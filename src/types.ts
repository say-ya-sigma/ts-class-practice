/**
 * ============================================
 * TypeScript 基礎型定義 - オブジェクトとUnion型
 * ============================================
 *
 * このファイルは純粋な型定義と型ガードのみを扱います。
 * 実行時検証 (zod) は src/schemas.ts に分離しています。
 */

// ============================================
// オブジェクト型の基本 (JSONPlaceholder)
// ============================================

export interface Geo {
  lat: string;
  lng: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  company: Company;
}

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface Album {
  userId: number;
  id: number;
  title: string;
}

export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

// ============================================
// Union型の応用
// ============================================

/** 成功・失敗のUnion型（Result型）。E は失敗時のエラー型 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/** APIから取得できるリソースのUnion型 */
export type ApiResource = User | Post | Comment | Album | Photo | Todo;

/** リソースの種別を示す文字列Union型（URL パスにも対応） */
export type ResourceType = 'users' | 'posts' | 'comments' | 'albums' | 'photos' | 'todos';

/** userId を持つリソースだけを抽出する条件付き型 */
export type WithUserId<T> = T extends { userId: number } ? T : never;

/** ユーザーに関連するリソースだけを抽出（Post | Comment(albumId持ち) | Album | Todo） */
export type UserRelatedResource = WithUserId<ApiResource>;

/** Nullableな値を扱う型 */
export type Nullable<T> = T | null;

/** Optionalな値を扱う型 */
export type Optional<T> = T | undefined;

/** 配列の要素をNullableにする */
export type NullableArray<T> = Array<Nullable<T>>;

/** 部分型（Partial） */
export type PartialUser = Partial<User>;

/** 特定のキーのみ必須（Required） */
export type RequiredUserFields = Pick<User, 'id' | 'name' | 'email'>;

/** 特定のキーを除外（Omit） */
export type UserWithoutCompany = Omit<User, 'company'>;

/** キーを変換する型 */
export type UserSummary = {
  [K in keyof RequiredUserFields]: RequiredUserFields[K];
};

/**
 * snake_case -> camelCase のテンプレートリテラル型（再帰）
 * 例: "user_first_name" -> "userFirstName"
 */
export type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

// ============================================
// 型ガード関数
// ============================================
//
// 各リソースが持つ「固有のキー」を判定に使うことで脆さを解消。
// - User     : username（他リソースには無い）
// - Comment  : postId + email の組合せ
// - Post     : userId + title + body
// - Album    : userId + title（body 無し）
// - Photo    : albumId + url
// - Todo     : completed（boolean のフラグ）
// ============================================

export function isUser(resource: ApiResource): resource is User {
  return 'username' in resource && 'address' in resource;
}

export function isPost(resource: ApiResource): resource is Post {
  return (
    'userId' in resource && 'title' in resource && 'body' in resource && !('email' in resource)
  );
}

export function isComment(resource: ApiResource): resource is Comment {
  return 'postId' in resource && 'email' in resource;
}

export function isAlbum(resource: ApiResource): resource is Album {
  return (
    'userId' in resource &&
    'title' in resource &&
    !('body' in resource) &&
    !('email' in resource) &&
    !('completed' in resource)
  );
}

export function isPhoto(resource: ApiResource): resource is Photo {
  return 'albumId' in resource && 'url' in resource && 'thumbnailUrl' in resource;
}

export function isTodo(resource: ApiResource): resource is Todo {
  return (
    'completed' in resource && typeof (resource as { completed: unknown }).completed === 'boolean'
  );
}

// ============================================
// 定数とユーティリティ
// ============================================

export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const RESOURCE_PATHS: Record<ResourceType, string> = {
  users: '/users',
  posts: '/posts',
  comments: '/comments',
  albums: '/albums',
  photos: '/photos',
  todos: '/todos',
};

/** デフォルトのリクエストタイムアウト (ms) */
export const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Result型からデータを取り出すユーティリティ
 * 失敗時は例外をスローする
 */
export function unwrap<T>(result: Result<T>): T {
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Result型を安全に処理するためのヘルパー（モナド風）
 * 成功時は map 関数を適用、失敗時はそのまま伝播
 */
export function mapResult<T, U>(result: Result<T>, map: (data: T) => U): Result<U> {
  if (result.success) {
    return { success: true, data: map(result.data) };
  }
  return { success: false, error: result.error };
}
