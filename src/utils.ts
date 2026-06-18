/**
 * ============================================
 * 配列操作と型の応用
 * ============================================
 *
 * 改善ポイント:
 * - omit を any / delete なしで実装（Partial<T> 経由で再構築）
 * - CamelCase 型は types.ts の正規定義を import して重複解消
 * - groupBy / reduceBy を noUncheckedIndexedAccess 対応にリファクタ
 * - classifyResources を 6 リソース (Photo/Todo 含む) に拡張
 * - デッドコード (toNullable) を削除
 */

import {
  type User,
  type Post,
  type Comment,
  type Album,
  type Photo,
  type Todo,
  type ApiResource,
  type Nullable,
  type WithUserId,
  type CamelCase,
  isUser,
  isPost,
  isComment,
  isAlbum,
  isPhoto,
  isTodo,
} from './types';

// ============================================
// 配列型の応用
// ============================================

/**
 * 配列の要素をグループ化する関数
 * Record<K, V> を使った型安全なグループ化
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of array) {
    const key = keyFn(item);
    const list = result[key];
    if (list) {
      list.push(item);
    } else {
      result[key] = [item];
    }
  }
  return result;
}

/** 配列から重複を排除する（Set を使う） */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 配列の先頭要素を安全に取得する（空配列なら例外）
 * noUncheckedIndexedAccess 環境で `arr[0]` が `T | undefined` になる問題を
 * 型安全に解決するヘルパー。
 */
export function first<T>(array: readonly T[]): T {
  const value = array[0];
  if (value === undefined) {
    throw new Error('Expected non-empty array, got empty');
  }
  return value;
}

/** 配列の末尾要素を安全に取得する（空配列なら例外） */
export function last<T>(array: readonly T[]): T {
  const value = array[array.length - 1];
  if (value === undefined) {
    throw new Error('Expected non-empty array, got empty');
  }
  return value;
}

/**
 * 配列から特定のプロパティだけを抽出する
 * K extends keyof T でプロパティ名を制約
 */
export function pluck<T, K extends keyof T>(array: T[], key: K): T[K][] {
  return array.map((item) => item[key]);
}

/** 配列をソートする（Comparator 関数） */
export function sortBy<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
  return [...array].sort(compareFn);
}

/** 配列をページ分割する */
export function paginate<T>(array: T[], pageSize: number, pageNumber: number): T[] {
  const start = (pageNumber - 1) * pageSize;
  return array.slice(start, start + pageSize);
}

/**
 * 配列の要素を型で分類する（6 リソース対応）
 * 戻り値の型は各リソース配列を持つオブジェクト
 */
export function classifyResources(resources: ApiResource[]): {
  users: User[];
  posts: Post[];
  comments: Comment[];
  albums: Album[];
  photos: Photo[];
  todos: Todo[];
} {
  const users: User[] = [];
  const posts: Post[] = [];
  const comments: Comment[] = [];
  const albums: Album[] = [];
  const photos: Photo[] = [];
  const todos: Todo[] = [];

  for (const resource of resources) {
    if (isUser(resource)) {
      users.push(resource);
    } else if (isPost(resource)) {
      posts.push(resource);
    } else if (isComment(resource)) {
      comments.push(resource);
    } else if (isAlbum(resource)) {
      albums.push(resource);
    } else if (isPhoto(resource)) {
      photos.push(resource);
    } else if (isTodo(resource)) {
      todos.push(resource);
    }
  }

  return { users, posts, comments, albums, photos, todos };
}

// ============================================
// オブジェクト操作
// ============================================

/**
 * オブジェクトから特定のキーを抽出して新しいオブジェクトを作成
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

/**
 * オブジェクトから特定のキーを除外して新しいオブジェクトを作成
 * any や delete を使わず、残すキーだけを部分構築して Omit<T,K> へ変換
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const keysToOmit: ReadonlySet<K> = new Set(keys);
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (!keysToOmit.has(key as K)) {
      result[key] = obj[key];
    }
  }
  return result as Omit<T, K>;
}

/**
 * オブジェクトのキーを変換する（snake_case -> camelCase）
 * 戻り値の型はマッピング型で camelCase キーを表現
 */
export function keysToCamelCase<T extends Record<string, unknown>>(
  obj: T,
): { [K in keyof T as CamelCase<string & K>]: T[K] } {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
      result[camelKey] = obj[key];
    }
  }
  return result as { [K in keyof T as CamelCase<string & K>]: T[K] };
}

// ============================================
// Union型の応用
// ============================================

/** userId を持つリソースを抽出する（Post | Album | Todo が該当） */
export function filterByUserId<T extends WithUserId<ApiResource>>(
  resources: T[],
  userId: number,
): T[] {
  return resources.filter((r) => r.userId === userId);
}

/** 配列の要素が Nullable な場合の安全な操作（null を除去） */
export function compact<T>(array: Nullable<T>[]): T[] {
  return array.filter((item): item is T => item !== null);
}

/**
 * 配列の要素を Nullable に変換（一部を null にする）
 * 条件を満たした要素が null になる
 */
export function toNullableWithCondition<T>(
  array: T[],
  condition: (item: T) => boolean,
): Nullable<T>[] {
  return array.map((item) => (condition(item) ? null : item));
}

// ============================================
// 型安全なオブジェクトのマージ
// ============================================

/** 2つのオブジェクトをマージする（交差型 T & U） */
export function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

/** 配列の配列を平坦化する */
export function flatten<T>(array: T[][]): T[] {
  return array.flat();
}

/**
 * 配列の要素を累積処理する（グループ化 + 値変換）
 */
export function reduceBy<T, K extends string | number, V>(
  array: T[],
  keyFn: (item: T) => K,
  valueFn: (item: T) => V,
): Record<K, V[]> {
  const result = {} as Record<K, V[]>;
  for (const item of array) {
    const key = keyFn(item);
    const value = valueFn(item);
    const list = result[key];
    if (list) {
      list.push(value);
    } else {
      result[key] = [value];
    }
  }
  return result;
}

// ============================================
// 実用例：ユーザーと投稿の関連付け
// ============================================

/** User に投稿を紐付けた拡張型 */
export interface UserWithPosts extends User {
  posts: Post[];
}

export function associateUserWithPosts(users: User[], posts: Post[]): UserWithPosts[] {
  const postsByUser = groupBy(posts, (p) => p.userId);
  return users.map((user) => ({
    ...user,
    posts: postsByUser[user.id] ?? [],
  }));
}

/** Post にコメントを紐付けた拡張型 */
export interface PostWithComments extends Post {
  comments: Comment[];
}

export function associatePostWithComments(posts: Post[], comments: Comment[]): PostWithComments[] {
  const commentsByPost = groupBy(comments, (c) => c.postId);
  return posts.map((post) => ({
    ...post,
    comments: commentsByPost[post.id] ?? [],
  }));
}

// ============================================
// 型推論の応用
// ============================================

/** 配列の要素型を推論する（infer のデモ用） */
export type ElementType<T> = T extends (infer U)[] ? U : never;

/** 配列の要素の特定のプロパティ型を推論する */
export type PropertyType<T, K extends keyof T> = T[K];

/** 配列からユニークなプロパティ値を取得する */
export function uniqueProperty<T, K extends keyof T>(array: T[], key: K): T[K][] {
  return unique(pluck(array, key));
}
