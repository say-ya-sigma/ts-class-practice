/**
 * ============================================
 * Genericsを応用したAPIクライアント
 * ============================================
 *
 * 改善ポイント:
 * 1. zod によるランタイム検証 (as T の乱用を排除)
 * 2. AbortController によるタイムアウト制御
 * 3. インメモリキャッシュ (TTL付き) で重複リクエストを回避
 * 4. Photo / Todo リソースにも対応
 * 5. ApiRepository を ResourceType でパラメータ化し型推論を強化
 */

import type { ZodType } from 'zod';
import { z } from 'zod';
import {
  type Result,
  type ResourceType,
  type ApiResource,
  type User,
  type Post,
  type Comment,
  type Album,
  type Photo,
  type Todo,
  RESOURCE_PATHS,
  API_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  isUser,
  isPost,
  isComment,
  isAlbum,
} from './types';
import { resourceSchemaMap } from './schemas';

// ============================================
// リソースタイプ -> TS型 のマッピング
// ============================================

export type ResourceTypeMap = {
  users: User;
  posts: Post;
  comments: Comment;
  albums: Album;
  photos: Photo;
  todos: Todo;
};

// ============================================
// キャッシュ機構 (TTL付き)
// ============================================

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
let cacheTtlMs = 60_000; // デフォルト 60 秒

/** キャッシュの TTL を変更する（ms） */
export function setCacheTtl(ms: number): void {
  cacheTtlMs = ms;
}

/** キャッシュを全件クリア */
export function clearCache(): void {
  cache.clear();
}

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, expiresAt: Date.now() + cacheTtlMs });
}

// ============================================
// リクエストオプション
// ============================================

export interface FetchOptions {
  /** タイムアウト (ms)。省略時は DEFAULT_TIMEOUT_MS */
  timeoutMs?: number;
  /** キャッシュを使用するか。デフォルト true */
  cache?: boolean;
  /** キャッシュのキーを上書きしたい場合に指定 */
  cacheKey?: string;
}

// ============================================
// 基本のGenerics関数 (zod 検証付き)
// ============================================

/**
 * APIからデータを取得し、zod スキーマで検証する基本関数。
 * スキーマから T が推論されるため `as T` は不要。
 *
 * 学習ポイント:
 * - ジェネリクス <T> は z.ZodType<T> から推論される
 * - 実行時検証が入ることで「型は合っているがデータ形が違う」バグを防ぐ
 */
export async function fetchData<T>(
  url: string,
  schema: ZodType<T>,
  options: FetchOptions = {},
): Promise<Result<T>> {
  const useCache = options.cache !== false;
  const cacheKey = options.cacheKey ?? url;

  if (useCache) {
    const cached = getCached<T>(cacheKey);
    if (cached !== undefined) {
      return { success: true, data: cached };
    }
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return {
        success: false,
        error: new Error(`HTTP error! status: ${response.status} url: ${url}`),
      };
    }

    const json: unknown = await response.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return {
        success: false,
        error: new Error(
          `Validation error for ${url}:\n${parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`,
        ),
      };
    }

    if (useCache) {
      setCached(cacheKey, parsed.data);
    }
    return { success: true, data: parsed.data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: new Error(`Request timed out after ${timeoutMs}ms: ${url}`),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================
// 制約付きGenerics
// ============================================

/**
 * 特定の型に制約を付けたGenerics。
 * K から戻り値の型 ResourceTypeMap[K] が自動推論される。
 */
export async function fetchResource<K extends ResourceType>(
  type: K,
  id?: number,
  options?: FetchOptions,
): Promise<Result<ResourceTypeMap[K]>> {
  const path = RESOURCE_PATHS[type];
  const url = id !== undefined ? `${API_BASE_URL}${path}/${id}` : `${API_BASE_URL}${path}`;

  const schema = resourceSchemaMap[type] as unknown as ZodType<ResourceTypeMap[K]>;
  return fetchData(url, schema, options);
}

// ============================================
// 可変長引数とGenerics
// ============================================

/**
 * 複数のリソースを一括で取得。
 * Promise.all と Generics の組み合わせ。
 * 1件でも失敗したら全体を失敗とする（fail-fast）。
 */
export async function fetchMultiple<K extends ResourceType>(
  type: K,
  ...ids: number[]
): Promise<Result<ResourceTypeMap[K][]>> {
  const promises = ids.map((id) => fetchResource(type, id));
  const results = await Promise.all(promises);

  const data: ResourceTypeMap[K][] = [];
  for (const result of results) {
    if (result.success) {
      data.push(result.data);
    } else {
      return { success: false, error: result.error };
    }
  }
  return { success: true, data };
}

// ============================================
// 型のマッピングとGenerics (キーから型を自動推論)
// ============================================

/**
 * リソースタイプ (文字列リテラル) から戻り値の型を自動推論する関数。
 * 呼び出し側でジェネリクスを明示しなくても型が決まる。
 *
 * @example
 *   const r = await fetchTypedResource('users', 1);
 *   // r.data は User 型に自動的に絞り込まれる
 */
export async function fetchTypedResource<K extends ResourceType>(
  type: K,
  id?: number,
  options?: FetchOptions,
): Promise<Result<ResourceTypeMap[K]>> {
  return fetchResource(type, id, options);
}

// ============================================
// 型安全なリポジトリパターン
// ============================================

/**
 * 型安全なAPIリポジトリクラス。
 * K (ResourceType) でエンティティ型 ResourceTypeMap[K] が自動決定される。
 * Generics + マッピング型の実践例。
 */
export class ApiRepository<K extends ResourceType> {
  constructor(private readonly resourceType: K) {}

  async findAll(options?: FetchOptions): Promise<Result<ResourceTypeMap[K][]>> {
    const url = `${API_BASE_URL}${RESOURCE_PATHS[this.resourceType]}`;
    const schema = z.array(
      resourceSchemaMap[this.resourceType] as unknown as ZodType<ResourceTypeMap[K]>,
    );
    return fetchData(url, schema, options);
  }

  async findById(id: number, options?: FetchOptions): Promise<Result<ResourceTypeMap[K]>> {
    return fetchResource(this.resourceType, id, options);
  }

  /** 配列の要素を変換する (Generics + コールバック) */
  async findAllWithTransform<R>(
    transform: (item: ResourceTypeMap[K]) => R,
    options?: FetchOptions,
  ): Promise<Result<R[]>> {
    const result = await this.findAll(options);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data.map(transform) };
  }

  /** 配列を述語でフィルタリングする (Generics + 型ガード) */
  async findAllWithGuard(
    guard: (item: ResourceTypeMap[K]) => boolean,
    options?: FetchOptions,
  ): Promise<Result<ResourceTypeMap[K][]>> {
    const result = await this.findAll(options);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data.filter(guard) };
  }
}

// ============================================
// 特定型のリポジトリインスタンス
// ============================================

export const userRepository = new ApiRepository('users');
export const postRepository = new ApiRepository('posts');
export const commentRepository = new ApiRepository('comments');
export const albumRepository = new ApiRepository('albums');
export const photoRepository = new ApiRepository('photos');
export const todoRepository = new ApiRepository('todos');

// ============================================
// エクスポート
// ============================================
// 関数とクラスは宣言時に export 済み。以下は再エクスポートのみ。

/** 型ガード関数も再エクスポート（利便性のため） */
export { isUser, isPost, isComment, isAlbum };

/** ApiResource の再エクスポート（後方互換性） */
export type { ApiResource };
