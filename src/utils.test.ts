import { describe, it, expect } from 'vitest';
import {
  groupBy,
  unique,
  pluck,
  sortBy,
  paginate,
  pick,
  omit,
  keysToCamelCase,
  compact,
  filterByUserId,
  merge,
  flatten,
  reduceBy,
  first,
  last,
  uniqueProperty,
  classifyResources,
  associateUserWithPosts,
  associatePostWithComments,
} from './utils';
import type { User, Post, Comment, Album, Photo, Todo, ApiResource } from './types';

// ============================================
// テスト用フィクスチャ
// ============================================

const users: User[] = [
  {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'leanne@april.biz',
    phone: '1-770-736-8031',
    website: 'leanne.org',
    address: {
      street: 'Kulas Light',
      suite: 'Apt. 556',
      city: 'Gwenborough',
      zipcode: '92998-3874',
      geo: { lat: '-37.3159', lng: '81.1496' },
    },
    company: {
      name: 'Romaguera-Crona',
      catchPhrase: 'Multi-layered',
      bs: 'harness real-time e-markets',
    },
  },
  {
    id: 2,
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'ervin@melissa.tv',
    phone: '010-692-6593',
    website: 'ervin.net',
    address: {
      street: 'Victor Plains',
      suite: 'Suite 879',
      city: 'Wisokyburgh',
      zipcode: '90566-7771',
      geo: { lat: '-43.9509', lng: '-34.4618' },
    },
    company: {
      name: 'Deckow-Crist',
      catchPhrase: 'Proactive didactic',
      bs: 'synergize scalable supply-chains',
    },
  },
];

const posts: Post[] = [
  { userId: 1, id: 1, title: 'Post A', body: 'body-a' },
  { userId: 1, id: 2, title: 'Post B', body: 'body-b' },
  { userId: 2, id: 3, title: 'Post C', body: 'body-c' },
];

const comments: Comment[] = [
  { postId: 1, id: 1, name: 'Comment 1', email: 'c1@example.com', body: 'c-body-1' },
  { postId: 1, id: 2, name: 'Comment 2', email: 'c2@example.com', body: 'c-body-2' },
];

const albums: Album[] = [
  { userId: 1, id: 1, title: 'Album 1' },
  { userId: 2, id: 2, title: 'Album 2' },
];

const photos: Photo[] = [
  {
    albumId: 1,
    id: 1,
    title: 'Photo 1',
    url: 'https://example.com/1.jpg',
    thumbnailUrl: 'https://example.com/t1.jpg',
  },
];

const todos: Todo[] = [
  { userId: 1, id: 1, title: 'Todo 1', completed: false },
  { userId: 2, id: 2, title: 'Todo 2', completed: true },
];

// ============================================
// 配列操作
// ============================================

describe('groupBy', () => {
  it('キー関数でグループ化できる', () => {
    const grouped = groupBy(posts, (p) => p.userId);
    expect(Object.keys(grouped).sort()).toEqual(['1', '2']);
    expect(grouped[1]).toHaveLength(2);
    expect(grouped[2]).toHaveLength(1);
  });

  it('空配列は空のRecordを返す', () => {
    const grouped = groupBy([] as Post[], (p) => p.userId);
    expect(Object.keys(grouped)).toHaveLength(0);
  });
});

describe('unique', () => {
  it('重複を排除する', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });

  it('文字列も排除する', () => {
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('空配列は空配列', () => {
    expect(unique([])).toEqual([]);
  });
});

describe('pluck', () => {
  it('指定プロパティを抽出する', () => {
    expect(pluck(users, 'id')).toEqual([1, 2]);
    expect(pluck(users, 'name')).toEqual(['Leanne Graham', 'Ervin Howell']);
  });

  it('型安全: 存在しないキーはコンパイルエラー（実行時は undefined を集める）', () => {
    // @ts-expect-error 存在しないキーは型エラー
    pluck(users, 'nonexistent');
  });
});

describe('sortBy', () => {
  it('Comparator でソートする', () => {
    const sorted = sortBy(posts, (a, b) => a.title.localeCompare(b.title));
    expect(sorted.map((p) => p.title)).toEqual(['Post A', 'Post B', 'Post C']);
  });

  it('元配列を破壊しない', () => {
    const original = [...posts];
    sortBy(posts, (a, b) => b.id - a.id);
    expect(posts.map((p) => p.id)).toEqual(original.map((p) => p.id));
  });
});

describe('paginate', () => {
  it('指定ページを返す', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 1)).toEqual([1, 2]);
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
    expect(paginate([1, 2, 3, 4, 5], 2, 3)).toEqual([5]);
  });

  it('範囲外ページは空配列', () => {
    expect(paginate([1, 2, 3], 2, 10)).toEqual([]);
  });
});

describe('first / last', () => {
  it('first は先頭要素', () => {
    expect(first([1, 2, 3])).toBe(1);
  });

  it('last は末尾要素', () => {
    expect(last([1, 2, 3])).toBe(3);
  });

  it('first は空配列で例外', () => {
    expect(() => first([])).toThrow();
  });

  it('last は空配列で例外', () => {
    expect(() => last([])).toThrow();
  });
});

describe('flatten', () => {
  it('2次元配列を平坦化', () => {
    expect(flatten([[1, 2], [3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });

  it('空配列を含む', () => {
    expect(flatten([[], [1], []])).toEqual([1]);
  });
});

describe('reduceBy', () => {
  it('キーでグループ化しつつ値を変換', () => {
    const result = reduceBy(
      posts,
      (p) => p.userId,
      (p) => p.title,
    );
    expect(result[1]).toEqual(['Post A', 'Post B']);
    expect(result[2]).toEqual(['Post C']);
  });
});

// ============================================
// オブジェクト操作
// ============================================

describe('pick', () => {
  it('指定キーだけ残す', () => {
    const picked = pick(users[0]!, ['id', 'name']);
    expect(picked).toEqual({ id: 1, name: 'Leanne Graham' });
    expect(Object.keys(picked).sort()).toEqual(['id', 'name']);
  });
});

describe('omit', () => {
  it('指定キーを除外する', () => {
    const omitted = omit(users[0]!, [
      'address',
      'company',
      'phone',
      'website',
      'email',
      'username',
    ]);
    expect(omitted).toEqual({ id: 1, name: 'Leanne Graham' });
  });

  it('除外対象キーは結果に含まれない', () => {
    const omitted = omit(posts[0]!, ['body']);
    expect('body' in omitted).toBe(false);
    expect(omitted.id).toBe(1);
    expect(omitted.title).toBe('Post A');
  });
});

describe('keysToCamelCase', () => {
  it('snake_case を camelCase に変換', () => {
    const result = keysToCamelCase({
      user_id: 1,
      first_name: 'John',
      last_name: 'Doe',
    });
    expect(result).toEqual({ userId: 1, firstName: 'John', lastName: 'Doe' });
  });

  it('アンスコ無しキーはそのまま', () => {
    const result = keysToCamelCase({ id: 1, name: 'x' });
    expect(result).toEqual({ id: 1, name: 'x' });
  });
});

describe('merge', () => {
  it('2オブジェクトをマージ', () => {
    const merged = merge({ a: 1 }, { b: 2 });
    expect(merged).toEqual({ a: 1, b: 2 });
  });

  it('後勝ちの挙動', () => {
    const merged = merge({ a: 1 }, { a: 2, b: 3 });
    expect(merged).toEqual({ a: 2, b: 3 });
  });
});

// ============================================
// Union / Nullable
// ============================================

describe('compact', () => {
  it('null を除去', () => {
    expect(compact([1, null, 2, null, 3])).toEqual([1, 2, 3]);
  });

  it('全 null は空配列', () => {
    expect(compact([null, null])).toEqual([]);
  });
});

describe('filterByUserId', () => {
  it('userId でフィルタ', () => {
    expect(filterByUserId(posts, 1)).toHaveLength(2);
    expect(filterByUserId(posts, 2)).toHaveLength(1);
    expect(filterByUserId(posts, 999)).toHaveLength(0);
  });

  it('Album でも動作', () => {
    expect(filterByUserId(albums, 1)).toHaveLength(1);
  });
});

describe('uniqueProperty', () => {
  it('プロパティ値のユニークを返す', () => {
    expect(uniqueProperty(posts, 'userId')).toEqual([1, 2]);
  });
});

// ============================================
// classifyResources (型ガードによる分類)
// ============================================

describe('classifyResources', () => {
  it('Union配列を6種類に分類する', () => {
    const mixed: ApiResource[] = [...users, ...posts, ...comments, ...albums, ...photos, ...todos];
    const classified = classifyResources(mixed);
    expect(classified.users).toHaveLength(2);
    expect(classified.posts).toHaveLength(3);
    expect(classified.comments).toHaveLength(2);
    expect(classified.albums).toHaveLength(2);
    expect(classified.photos).toHaveLength(1);
    expect(classified.todos).toHaveLength(2);
  });

  it('空配列は全て空', () => {
    const classified = classifyResources([]);
    expect(classified.users).toEqual([]);
    expect(classified.todos).toEqual([]);
  });
});

// ============================================
// 関連付け
// ============================================

describe('associateUserWithPosts', () => {
  it('ユーザーに投稿を紐付ける', () => {
    const result = associateUserWithPosts(users, posts);
    expect(result).toHaveLength(2);
    expect(result[0]!.name).toBe('Leanne Graham');
    expect(result[0]!.posts).toHaveLength(2);
    expect(result[1]!.posts).toHaveLength(1);
  });

  it('投稿がないユーザーは空配列', () => {
    const lonelyUser: User = { ...users[0]!, id: 999 };
    const result = associateUserWithPosts([lonelyUser], posts);
    expect(result[0]!.posts).toEqual([]);
  });
});

describe('associatePostWithComments', () => {
  it('投稿にコメントを紐付ける', () => {
    const result = associatePostWithComments(posts.slice(0, 1), comments);
    expect(result).toHaveLength(1);
    expect(result[0]!.comments).toHaveLength(2);
  });
});
