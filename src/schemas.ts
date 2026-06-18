/**
 * ============================================
 * zod によるランタイム検証スキーマ
 * ============================================
 *
 * types.ts は「コンパイル時の型」を定義するのに対し、
 * このファイルは「実行時の検証」を担います。
 * API レスポンスなどをこのスキーマで検証することで、
 * 型アサーション (as T) に頼らない堅牢なデータ取得が可能になります。
 *
 * 学習ポイント:
 * - TS の型はコンパイル時に消える -> 実行時の形を保証しない
 * - zod は実行時にデータを検証し、型も推論してくれる
 * - z.infer<typeof schema> で TS の型を得られるので types.ts と整合する
 */

import { z } from 'zod';

// ============================================
// 各リソースのスキーマ
// ============================================

export const geoSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

export const addressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: geoSchema,
});

export const companySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string(),
  address: addressSchema,
  company: companySchema,
});

export const postSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

export const commentSchema = z.object({
  postId: z.number(),
  id: z.number(),
  name: z.string(),
  email: z.string(),
  body: z.string(),
});

export const albumSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
});

export const photoSchema = z.object({
  albumId: z.number(),
  id: z.number(),
  title: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url(),
});

export const todoSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
});

// ============================================
// リソースタイプ -> スキーマ のマッピング
// ============================================

export const resourceSchemaMap = {
  users: userSchema,
  posts: postSchema,
  comments: commentSchema,
  albums: albumSchema,
  photos: photoSchema,
  todos: todoSchema,
} as const;

/** 単一リソースを検証する関数 */
export function validateResource<K extends keyof typeof resourceSchemaMap>(
  type: K,
  data: unknown,
): z.infer<(typeof resourceSchemaMap)[K]> {
  return resourceSchemaMap[type].parse(data);
}

/** 配列リソースを検証する関数 */
export function validateResourceArray<K extends keyof typeof resourceSchemaMap>(
  type: K,
  data: unknown,
): z.infer<(typeof resourceSchemaMap)[K]>[] {
  const schema = z.array(resourceSchemaMap[type]);
  return schema.parse(data) as z.infer<(typeof resourceSchemaMap)[K]>[];
}
