/**
 * ============================================
 * Pattern 2: Object型の応用
 * ============================================
 * 学習内容:
 * - pick<T,K>: 特定キーを抽出
 * - omit<T,K>: 特定キーを除外
 * - merge<T,U>: オブジェクトマージ
 * - keysToCamelCase<T>: キー変換
 * - associateUserWithPosts: オブジェクト関連付け
 * - associatePostWithComments: オブジェクト関連付け
 */

import { userRepository, postRepository, commentRepository } from './api-client';
import {
  pick,
  omit,
  merge,
  keysToCamelCase,
  associateUserWithPosts,
  associatePostWithComments,
  first,
} from './utils';

async function main() {
  console.log('=== Pattern 2: Object型の応用 ===\n');

  const usersResult = await userRepository.findAll();
  const postsResult = await postRepository.findAll();
  const commentsResult = await commentRepository.findAll();

  if (!usersResult.success || !postsResult.success || !commentsResult.success) {
    console.error('データ取得に失敗しました');
    return;
  }

  const users = usersResult.data;
  const posts = postsResult.data;
  const comments = commentsResult.data;

  // 1. pick<T,K>: 特定キーを抽出
  console.log('【1. pick<T,K> - 特定キーの抽出】');
  const firstUser = first(users);
  console.log('入力 (User):', JSON.stringify(firstUser, null, 2));
  const userSummary = pick(firstUser, ['id', 'name', 'email']);
  console.log('出力 (Pick<User, "id" | "name" | "email">):');
  console.log(JSON.stringify(userSummary, null, 2));

  // 2. omit<T,K>: 特定キーを除外
  console.log('\n【2. omit<T,K> - 特定キーの除外】');
  const userWithoutAddress = omit(firstUser, ['address', 'company', 'phone', 'website']);
  console.log('入力 (User):', JSON.stringify(firstUser, null, 2));
  console.log('出力 (Omit<User, "address" | "company" | "phone" | "website">):');
  console.log(JSON.stringify(userWithoutAddress, null, 2));

  // 3. merge<T,U>: オブジェクトマージ
  console.log('\n【3. merge<T,U> - オブジェクトのマージ】');
  const userPart = pick(firstUser, ['id', 'name']);
  const extraInfo = { score: 95, isActive: true };
  console.log('入力1:', JSON.stringify(userPart, null, 2));
  console.log('入力2:', JSON.stringify(extraInfo, null, 2));
  const merged = merge(userPart, extraInfo);
  console.log('出力 (T & U):', JSON.stringify(merged, null, 2));

  // 4. keysToCamelCase<T>: キー変換
  console.log('\n【4. keysToCamelCase<T> - キー名の変換 (snake_case -> camelCase)】');
  const snakeObj = {
    user_id: 1,
    first_name: 'Leanne',
    last_name: 'Graham',
    email_address: 'Sincere@april.biz',
  };
  console.log('入力:', JSON.stringify(snakeObj, null, 2));
  const camelObj = keysToCamelCase(snakeObj);
  console.log('出力:', JSON.stringify(camelObj, null, 2));

  // 5. associateUserWithPosts: オブジェクト関連付け
  console.log('\n【5. associateUserWithPosts - オブジェクトの関連付け】');
  const usersWithPosts = associateUserWithPosts(users.slice(0, 3), posts);
  console.log('入力: User[3件], Post[100件]');
  console.log(
    '出力 (UserWithPosts[]):',
    JSON.stringify(
      usersWithPosts.map((u) => ({
        id: u.id,
        name: u.name,
        postCount: u.posts.length,
        posts: u.posts.slice(0, 1).map((p) => ({
          id: p.id,
          title: p.title,
        })),
      })),
      null,
      2,
    ),
  );

  // 6. associatePostWithComments: オブジェクト関連付け
  console.log('\n【6. associatePostWithComments - オブジェクトの関連付け】');
  const postsWithComments = associatePostWithComments(posts.slice(0, 3), comments);
  console.log('入力: Post[3件], Comment[500件]');
  console.log(
    '出力 (PostWithComments[]):',
    JSON.stringify(
      postsWithComments.map((p) => ({
        id: p.id,
        title: p.title,
        commentCount: p.comments.length,
        comments: p.comments.slice(0, 1).map((c) => ({
          id: c.id,
          name: c.name,
        })),
      })),
      null,
      2,
    ),
  );

  console.log('\n=== Pattern 2 完了 ===');
}

main().catch(console.error);
