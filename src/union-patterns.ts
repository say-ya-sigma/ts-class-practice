/**
 * ============================================
 * Pattern 3: Union型の応用
 * ============================================
 * 学習内容:
 * - Result<T,E> 型 (Success | Failure)
 * - ApiResource Union型 (User | Post | Comment | Album)
 * - ResourceType 文字列Union型
 * - 型ガードによる Union型の絞り込み
 * - classifyResources で Union型の配列を分類
 * - WithUserId<T> 条件付き型
 */

import { userRepository, postRepository, commentRepository, albumRepository } from './api-client';
import { classifyResources, filterByUserId, first } from './utils';
import type { Result, ApiResource, ResourceType, User, Post } from './types';

async function main() {
  console.log('=== Pattern 3: Union型の応用 ===\n');

  // 1. Result<T,E> 型 (Success | Failure)
  console.log('【1. Result<T,E> 型 - Success | Failure の Union】');
  const userResult: Result<User> = await userRepository.findById(1);
  console.log('Result<User> = { success: true, data: User } | { success: false, error: Error }');
  if (userResult.success) {
    console.log(
      '成功パターン:',
      JSON.stringify({ success: userResult.success, data: userResult.data }, null, 2),
    );
  } else {
    console.log(
      '失敗パターン:',
      JSON.stringify({ success: userResult.success, error: userResult.error.message }, null, 2),
    );
  }

  // 意図的な失敗パターン
  const badResult: Result<Post> = {
    success: false,
    error: new Error('404 Not Found'),
  };
  console.log('失敗パターンの例:', JSON.stringify(badResult, null, 2));

  // 2. ResourceType 文字列Union型
  console.log('\n【2. ResourceType 文字列Union型】');
  const resourceTypes: ResourceType[] = ['users', 'posts', 'comments', 'albums'];
  console.log('type ResourceType = "users" | "posts" | "comments" | "albums"');
  console.log('値の配列:', JSON.stringify(resourceTypes, null, 2));

  // 3. ApiResource Union型
  console.log('\n【3. ApiResource Union型 - User | Post | Comment | Album】');
  const [users, posts, comments, albums] = await Promise.all([
    userRepository.findAll(),
    postRepository.findAll(),
    commentRepository.findAll(),
    albumRepository.findAll(),
  ]);

  if (!users.success || !posts.success || !comments.success || !albums.success) {
    console.error('データ取得に失敗しました');
    return;
  }

  // 異なる型を混ぜた Union型の配列
  const mixedResources: ApiResource[] = [
    first(users.data),
    first(posts.data),
    first(comments.data),
    first(albums.data),
  ];
  console.log('Union型の配列 (ApiResource[]):');
  console.log(
    JSON.stringify(
      mixedResources.map((r) => ({
        // in 演算子による Union 型の絞り込み（型ガード相当）
        type:
          'username' in r
            ? 'User'
            : 'postId' in r
              ? 'Comment'
              : 'albumId' in r
                ? 'Photo'
                : 'completed' in r
                  ? 'Todo'
                  : 'body' in r
                    ? 'Post'
                    : 'Album',
        id: r.id,
        // name を持つのは User と Comment、title を持つのは残り全て
        titleOrName: 'name' in r ? r.name : 'title' in r ? r.title : '-',
      })),
      null,
      2,
    ),
  );

  // 4. classifyResources - Union型の配列を分類
  console.log('\n【4. classifyResources - Union型の配列を型ガードで分類】');
  const classified = classifyResources(mixedResources);
  console.log('入力: ApiResource[4件]');
  console.log(
    '出力:',
    JSON.stringify(
      {
        users: classified.users.map((u) => ({ id: u.id, name: u.name })),
        posts: classified.posts.map((p) => ({ id: p.id, title: p.title })),
        comments: classified.comments.map((c) => ({ id: c.id, name: c.name })),
        albums: classified.albums.map((a) => ({ id: a.id, title: a.title })),
      },
      null,
      2,
    ),
  );

  // 5. WithUserId<T> 条件付き型
  console.log('\n【5. WithUserId<T> 条件付き型 - { userId: number } を持つ型を抽出】');
  const userPosts = filterByUserId(posts.data, 1);
  const userAlbums = filterByUserId(albums.data, 1);
  console.log('WithUserId<Post> -> Post[] (userId=1):', JSON.stringify(userPosts.length, null, 2));
  console.log(
    'WithUserId<Album> -> Album[] (userId=1):',
    JSON.stringify(userAlbums.length, null, 2),
  );
  console.log('Post サンプル:', JSON.stringify(userPosts.slice(0, 2), null, 2));

  console.log('\n=== Pattern 3 完了 ===');
}

main().catch(console.error);
