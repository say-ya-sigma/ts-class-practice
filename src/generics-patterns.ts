/**
 * ============================================
 * Pattern 4: Genericsの応用
 * ============================================
 * 学習内容:
 * - fetchData<T>: zod スキーマから T を推論する基本関数
 * - fetchResource<K extends ResourceType>: 制約付きGenerics (K から型を推論)
 * - fetchMultiple<K>: 可変長引数 + Generics
 * - fetchTypedResource<K>: キーから型を自動推論
 * - ApiRepository<K>: 型安全なリポジトリクラス
 * - findAllWithTransform<R>: コールバック + Generics
 * - ResourceTypeMap: 型のマッピング
 */

import {
  fetchData,
  fetchResource,
  fetchMultiple,
  fetchTypedResource,
  userRepository,
  postRepository,
  commentRepository,
} from './api-client';
import { userSchema, postSchema } from './schemas';
import type { User, Post, Comment, ResourceType } from './types';
import { unwrap } from './types';

async function main() {
  console.log('=== Pattern 4: Genericsの応用 ===\n');

  // 1. fetchData<T>: zod スキーマから T を推論する基本関数
  console.log('【1. fetchData<T> - zod スキーマで型推論 + ランタイム検証】');
  console.log('function fetchData<T>(url: string, schema: ZodType<T>): Promise<Result<T>>');
  const user = unwrap(await fetchData('https://jsonplaceholder.typicode.com/users/1', userSchema));
  console.log('User型で取得:', JSON.stringify(user, null, 2));

  const post = unwrap(await fetchData('https://jsonplaceholder.typicode.com/posts/1', postSchema));
  console.log('Post型で取得:', JSON.stringify(post, null, 2));

  // 2. fetchResource<K extends ResourceType>: 制約付きGenerics
  console.log('\n【2. fetchResource<K extends ResourceType> - K から型を自動推論】');
  console.log(
    'function fetchResource<K extends ResourceType>(type: K, id?: number): Promise<Result<ResourceTypeMap[K]>>',
  );
  const userRes = unwrap(await fetchResource('users', 1));
  const postRes = unwrap(await fetchResource('posts', 1));
  const commentRes = unwrap(await fetchResource('comments', 1));
  console.log('User:', JSON.stringify({ id: userRes.id, name: userRes.name }, null, 2));
  console.log('Post:', JSON.stringify({ id: postRes.id, title: postRes.title }, null, 2));
  console.log('Comment:', JSON.stringify({ id: commentRes.id, name: commentRes.name }, null, 2));

  // 3. fetchMultiple<K>: 可変長引数 + Generics
  console.log('\n【3. fetchMultiple<K> - 可変長引数 + Generics】');
  console.log(
    'function fetchMultiple<K extends ResourceType>(type: K, ...ids: number[]): Promise<Result<ResourceTypeMap[K][]>>',
  );
  const multipleUsers = unwrap(await fetchMultiple('users', 1, 2, 3));
  console.log(
    'User[1,2,3]:',
    JSON.stringify(
      multipleUsers.map((u) => ({ id: u.id, name: u.name })),
      null,
      2,
    ),
  );

  const multiplePosts = unwrap(await fetchMultiple('posts', 1, 2, 3, 4, 5));
  console.log(
    'Post[1,2,3,4,5]:',
    JSON.stringify(
      multiplePosts.map((p) => ({ id: p.id, title: p.title.slice(0, 30) })),
      null,
      2,
    ),
  );

  // 4. fetchTypedResource<K extends ResourceType>: キーから型を自動推論
  console.log('\n【4. fetchTypedResource<K> - キーから型を自動推論】');
  console.log(
    'function fetchTypedResource<K extends ResourceType>(type: K, id?: number): Promise<Result<ResourceTypeMap[K]>>',
  );
  const typedUser = unwrap(await fetchTypedResource('users', 1));
  const typedPost = unwrap(await fetchTypedResource('posts', 1));
  const typedComment = unwrap(await fetchTypedResource('comments', 1));
  const typedAlbum = unwrap(await fetchTypedResource('albums', 1));
  console.log(
    'type="users" -> User:',
    JSON.stringify({ id: typedUser.id, name: typedUser.name }, null, 2),
  );
  console.log(
    'type="posts" -> Post:',
    JSON.stringify({ id: typedPost.id, title: typedPost.title.slice(0, 30) }, null, 2),
  );
  console.log(
    'type="comments" -> Comment:',
    JSON.stringify({ id: typedComment.id, name: typedComment.name }, null, 2),
  );
  console.log(
    'type="albums" -> Album:',
    JSON.stringify({ id: typedAlbum.id, title: typedAlbum.title }, null, 2),
  );

  // 5. ApiRepository<K>: 型安全なリポジトリクラス
  console.log('\n【5. ApiRepository<K> - 型安全なリポジトリクラス】');
  console.log(
    'class ApiRepository<K extends ResourceType> { findAll(): Promise<Result<ResourceTypeMap[K][]>>; ... }',
  );
  const allUsers = unwrap(await userRepository.findAll());
  const allPosts = unwrap(await postRepository.findAll());
  const allComments = unwrap(await commentRepository.findAll());
  console.log('userRepository.findAll() -> User[]:', JSON.stringify(allUsers.length, null, 2));
  console.log('postRepository.findAll() -> Post[]:', JSON.stringify(allPosts.length, null, 2));
  console.log(
    'commentRepository.findAll() -> Comment[]:',
    JSON.stringify(allComments.length, null, 2),
  );

  // 6. findAllWithTransform<R>: コールバック + Generics
  console.log('\n【6. findAllWithTransform<R> - コールバック + Generics】');
  const userSummaries = unwrap(
    await userRepository.findAllWithTransform((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    })),
  );
  console.log('User -> { id, name, email }:', JSON.stringify(userSummaries.slice(0, 3), null, 2));

  const postSummaries = unwrap(
    await postRepository.findAllWithTransform((p) => ({
      postId: p.id,
      summary: `${p.title} (by user ${p.userId})`,
    })),
  );
  console.log('Post -> { postId, summary }:', JSON.stringify(postSummaries.slice(0, 3), null, 2));

  // 7. ResourceTypeMap の型マッピング（コンパイル時確認）
  console.log('\n【7. ResourceTypeMap - リソースタイプからエンティティ型へのマッピング】');
  const resourceTypes: ResourceType[] = ['users', 'posts', 'comments', 'albums', 'photos', 'todos'];
  console.log('type ResourceTypeMap = { users: User; posts: Post; ... }');
  console.log('ResourceType 値:', JSON.stringify(resourceTypes, null, 2));

  // 型レベルの検証（実行時には影響しない）
  type _CheckUser = ResourceTypeMap2['users'] extends User ? true : false;
  type _CheckPost = ResourceTypeMap2['posts'] extends Post ? true : false;
  const typeChecks: { users: _CheckUser; posts: _CheckPost; comments: true } = {
    users: true,
    posts: true,
    comments: true as const,
  };
  console.log('型マッピングの検証:', JSON.stringify(typeChecks, null, 2));

  console.log('\n=== Pattern 4 完了 ===');
}

// ローカルで ResourceTypeMap の参照（api-client から再エクスポートされている想定）
type ResourceTypeMap2 = {
  users: User;
  posts: Post;
  comments: Comment;
  albums: { userId: number; id: number; title: string };
  photos: { albumId: number; id: number; title: string; url: string; thumbnailUrl: string };
  todos: { userId: number; id: number; title: string; completed: boolean };
};

main().catch(console.error);
