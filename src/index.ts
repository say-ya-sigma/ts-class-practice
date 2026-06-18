/**
 * ============================================
 * TypeScript 復習プロジェクト - メインエントリポイント
 * ============================================
 *
 * このプロジェクトでは以下のTypeScriptの機能を学習します：
 * 1. Array型の応用
 * 2. Object型の応用
 * 3. Union型とその応用
 * 4. Genericsとその応用
 * 5. 型ガード関数
 * 6. 高度な型操作
 *
 * 使用するAPI: JSONPlaceholder (https://jsonplaceholder.typicode.com/)
 * 無料のパブリックなREST APIです。
 */

import {
  userRepository,
  postRepository,
  commentRepository,
  albumRepository,
  fetchTypedResource,
  fetchMultiple,
  clearCache,
} from './api-client';

import {
  groupBy,
  pluck,
  sortBy,
  paginate,
  classifyResources,
  filterByUserId,
  associateUserWithPosts,
  associatePostWithComments,
  pick,
  omit,
  compact,
  uniqueProperty,
  first,
} from './utils';

import type { ApiResource, User } from './types';

// ============================================
// 実行例
// ============================================

async function main() {
  console.log('=== TypeScript 復習プロジェクト ===\n');

  // 1. Array型の応用 - ユーザー一覧を取得
  console.log('1. Array型の応用 - ユーザー一覧を取得');
  const usersResult = await userRepository.findAll();
  if (usersResult.success) {
    const users = usersResult.data;
    console.log(`  取得したユーザー数: ${users.length}`);

    // pluck: 配列から特定のプロパティを抽出
    const userNames = pluck(users, 'name');
    console.log(`  ユーザー名: ${userNames.slice(0, 3).join(', ')}...`);

    // sortBy: 配列をソート
    const sortedUsers = sortBy(users, (a, b) => a.name.localeCompare(b.name));
    console.log(`  ソート後の先頭ユーザー: ${first(sortedUsers).name}`);

    // paginate: 配列をページ分割
    const firstPage = paginate(users, 5, 1);
    console.log(`  1ページ目のユーザー数: ${firstPage.length}`);

    // groupBy: 配列をグループ化
    const usersByCity = groupBy(users, (u) => u.address.city);
    console.log(`  都市別ユーザー数: ${Object.keys(usersByCity).length}都市`);
  }

  // 2. Object型の応用 - 投稿を取得してオブジェクト操作
  console.log('\n2. Object型の応用 - 投稿オブジェクトの操作');
  const postsResult = await postRepository.findAll();
  if (postsResult.success) {
    const posts = postsResult.data;

    // pick: オブジェクトから特定のキーを抽出
    const firstPost = first(posts);
    const postSummary = pick(firstPost, ['id', 'title', 'userId']);
    console.log(`  投稿の要約: ${JSON.stringify(postSummary)}`);

    // omit: オブジェクトから特定のキーを除外
    const postWithoutBody = omit(firstPost, ['body']);
    console.log(`  本文なし投稿のキー: ${Object.keys(postWithoutBody).join(', ')}`);
  }

  // 3. Union型の応用 - 型ガードと分類
  console.log('\n3. Union型の応用 - 型ガードとリソース分類');
  const commentsResult = await commentRepository.findAll();
  const albumsResult = await albumRepository.findAll();

  if (
    usersResult.success &&
    postsResult.success &&
    commentsResult.success &&
    albumsResult.success
  ) {
    // 複数のリソースを混ぜた配列（Union型）
    const mixedResources: ApiResource[] = [
      ...usersResult.data.slice(0, 2),
      ...postsResult.data.slice(0, 2),
      ...commentsResult.data.slice(0, 2),
      ...albumsResult.data.slice(0, 2),
    ];

    // classifyResources: Union型の配列を型ガードで分類
    const classified = classifyResources(mixedResources);
    console.log(
      `  分類結果: ${classified.users.length}ユーザー, ${classified.posts.length}投稿, ` +
        `${classified.comments.length}コメント, ${classified.albums.length}アルバム`,
    );

    // filterByUserId: userIdを持つUnion型を抽出
    const userPosts = filterByUserId(postsResult.data, 1);
    console.log(`  ユーザー1の投稿数: ${userPosts.length}`);
  }

  // 4. Genericsの応用 - 型安全なリポジトリ
  console.log('\n4. Genericsの応用 - 型安全なAPIクライアント');

  // fetchTypedResource: リソースタイプから型を自動推論
  const userResult = await fetchTypedResource('users', 1);
  if (userResult.success) {
    console.log(`  取得したユーザー: ${userResult.data.name} (型: User)`);
  }

  const postResult = await fetchTypedResource('posts', 1);
  if (postResult.success) {
    console.log(`  取得した投稿: ${postResult.data.title} (型: Post)`);
  }

  // fetchMultiple: 複数のリソースを一括取得（K から型を推論）
  const multipleUsers = await fetchMultiple('users', 1, 2, 3);
  if (multipleUsers.success) {
    console.log(`  一括取得したユーザー数: ${multipleUsers.data.length}`);
  }

  // 5. 配列の高度な操作
  console.log('\n5. 配列の高度な操作');
  if (usersResult.success) {
    // uniqueProperty: ユニークなプロパティ値を取得
    const addresses = uniqueProperty(usersResult.data, 'address');
    console.log(`  ユニークな住所数: ${addresses.length}`);
  }

  // 6. オブジェクトの関連付け
  console.log('\n6. オブジェクトの関連付け');
  if (usersResult.success && postsResult.success) {
    const usersWithPosts = associateUserWithPosts(usersResult.data.slice(0, 3), postsResult.data);
    for (const user of usersWithPosts) {
      console.log(`  ${user.name}: ${user.posts.length}件の投稿`);
    }
  }

  if (postsResult.success && commentsResult.success) {
    const postsWithComments = associatePostWithComments(
      postsResult.data.slice(0, 3),
      commentsResult.data,
    );
    for (const post of postsWithComments) {
      console.log(`  投稿「${post.title.slice(0, 20)}...」: ${post.comments.length}件のコメント`);
    }
  }

  // 7. Nullable型の応用
  console.log('\n7. Nullable型の応用');
  const nullableArray = [1, null, 2, null, 3];
  const compacted = compact(nullableArray);
  console.log(`  コンパクト前: ${nullableArray.length}要素, コンパクト後: ${compacted.length}要素`);

  // キャッシュクリアのデモ（学習用）
  clearCache();
  console.log('\n  (キャッシュをクリアしました)');

  console.log('\n=== 完了 ===');
}

// エラーハンドリング
main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});

// User 型を参照するための import (実行時には使わないが型注釈で活用)
export type { User };
