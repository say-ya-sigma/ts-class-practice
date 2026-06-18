/**
 * ============================================
 * Pattern 1: Array型の応用
 * ============================================
 * 学習内容:
 * - pluck<T,K>: 配列から特定プロパティを抽出
 * - sortBy<T>: Comparator関数によるソート
 * - paginate<T>: ページ分割
 * - groupBy<T,K>: Record<K, T[]> でグループ化
 * - unique<T>: Set で重複排除
 * - flatten<T>: 配列の配列を平坦化
 * - reduceBy<T,K,V>: 集計
 */

import { userRepository, postRepository } from './api-client';
import { pluck, sortBy, paginate, groupBy, unique, flatten, reduceBy } from './utils';

async function main() {
  console.log('=== Pattern 1: Array型の応用 ===\n');

  const usersResult = await userRepository.findAll();
  const postsResult = await postRepository.findAll();

  if (!usersResult.success || !postsResult.success) {
    console.error('データ取得に失敗しました');
    return;
  }

  const users = usersResult.data;
  const posts = postsResult.data;

  // 1. pluck<T,K>: 配列から特定プロパティを抽出
  console.log('【1. pluck<T,K> - 特定プロパティの抽出】');
  const userNames = pluck(users, 'name');
  console.log('入力: User[] (10件)');
  console.log('出力 (string[]):', JSON.stringify(userNames, null, 2));

  // 2. sortBy<T>: Comparator関数によるソート
  console.log('\n【2. sortBy<T> - ソート】');
  const sortedByName = sortBy(users, (a, b) => a.name.localeCompare(b.name));
  console.log('入力: User[] (10件)');
  console.log('出力 (User[] - name順):');
  console.log(
    JSON.stringify(
      pluck(sortedByName, 'name').map((n) => ({ name: n })),
      null,
      2,
    ),
  );

  // 3. paginate<T>: ページ分割
  console.log('\n【3. paginate<T> - ページ分割】');
  const page1 = paginate(users, 3, 1);
  const page2 = paginate(users, 3, 2);
  console.log('入力: User[] (10件), pageSize=3');
  console.log('第1ページ:', JSON.stringify(pluck(page1, 'name'), null, 2));
  console.log('第2ページ:', JSON.stringify(pluck(page2, 'name'), null, 2));

  // 4. groupBy<T,K>: Record<K, T[]> でグループ化
  console.log('\n【4. groupBy<T,K> - Record<K, T[]> によるグループ化】');
  const postsByUser = groupBy(posts, (p) => p.userId);
  console.log('入力: Post[] (100件)');
  console.log('出力 (Record<number, Post[]>):');
  const summary: Record<string, number> = {};
  for (const [uid, list] of Object.entries(postsByUser)) {
    summary[uid] = list.length;
  }
  console.log(JSON.stringify(summary, null, 2));

  // 5. unique<T>: Set で重複排除
  console.log('\n【5. unique<T> - 重複排除】');
  const cities = pluck(users, 'address').map((a) => a.city);
  console.log('入力 (都市リスト):', JSON.stringify(cities, null, 2));
  console.log('出力 (ユニーク):', JSON.stringify(unique(cities), null, 2));

  // 6. flatten<T>: 配列の配列を平坦化
  console.log('\n【6. flatten<T> - 配列の平坦化】');
  const nestedArrays = [posts.slice(0, 3), posts.slice(3, 6), posts.slice(6, 9)];
  console.log('入力: Post[][] (3 x 3件)');
  const flattened = flatten(nestedArrays);
  console.log(
    '出力 (Post[]):',
    JSON.stringify(
      flattened.map((p) => ({ id: p.id, title: p.title })),
      null,
      2,
    ),
  );

  // 7. reduceBy<T,K,V>: 集計
  console.log('\n【7. reduceBy<T,K,V> - 集計】');
  const userPostTitles = reduceBy(
    posts,
    (p) => p.userId,
    (p) => p.title,
  );
  console.log('入力: Post[] (100件)');
  console.log('出力 (Record<number, string[]>):');
  const userPostSummary: Record<string, { count: number; titles: string[] }> = {};
  for (const [uid, titles] of Object.entries(userPostTitles)) {
    userPostSummary[uid] = { count: titles.length, titles: titles.slice(0, 2) };
  }
  console.log(JSON.stringify(userPostSummary, null, 2));

  console.log('\n=== Pattern 1 完了 ===');
}

main().catch(console.error);
