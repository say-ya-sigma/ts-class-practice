/**
 * ============================================
 * Pattern 7: すべてのパターンをまとめて実行
 * ============================================
 * 7つのパターンを順番に実行し、実際のJSONデータを含むサマリーを出力
 */

import { userRepository, postRepository, commentRepository, albumRepository } from './api-client';
import {
  pluck,
  sortBy,
  paginate,
  groupBy,
  unique,
  flatten,
  pick,
  omit,
  merge,
  keysToCamelCase,
  associateUserWithPosts,
  associatePostWithComments,
  classifyResources,
  filterByUserId,
  compact,
  first,
} from './utils';
import {
  isUser,
  isPost,
  isComment,
  isAlbum,
  type ApiResource,
  type ResourceType,
  type User,
  unwrap,
} from './types';

async function main() {
  console.log('=== Pattern 7: すべてのパターンをまとめて実行 ===\n');

  const [usersR, postsR, commentsR, albumsR] = await Promise.all([
    userRepository.findAll(),
    postRepository.findAll(),
    commentRepository.findAll(),
    albumRepository.findAll(),
  ]);

  if (!usersR.success || !postsR.success || !commentsR.success || !albumsR.success) {
    console.error('データ取得に失敗しました');
    return;
  }

  const users = usersR.data;
  const posts = postsR.data;
  const comments = commentsR.data;
  const albums = albumsR.data;

  const firstUser = first(users);
  const firstPost = first(posts);
  const firstComment = first(comments);
  const firstAlbum = first(albums);

  // サマリー出力
  const summary = {
    // 1. Array
    array: {
      users: {
        total: users.length,
        names: pluck(users, 'name'),
        sortedByName: pluck(
          sortBy(users, (a, b) => a.name.localeCompare(b.name)),
          'name',
        ),
        page1: paginate(users, 3, 1).map((u) => u.name),
        uniqueCities: unique(pluck(users, 'address').map((a) => a.city)),
      },
      posts: {
        total: posts.length,
        byUser: (() => {
          const byUser = groupBy(posts, (p) => p.userId);
          const result: Record<string, number> = {};
          for (const [k, v] of Object.entries(byUser)) {
            result[k] = v.length;
          }
          return result;
        })(),
        flattened: flatten([posts.slice(0, 3), posts.slice(3, 6)]).map((p) => p.id),
      },
    },

    // 2. Object
    object: {
      pick: pick(firstUser, ['id', 'name', 'email']),
      omit: (() => {
        const o = omit(firstUser, ['address', 'company', 'phone', 'website']);
        return { keys: Object.keys(o), data: o };
      })(),
      merge: merge(pick(firstUser, ['id', 'name']), { score: 95 }),
      camelCase: keysToCamelCase({ user_id: 1, first_name: 'John', last_name: 'Doe' }),
      usersWithPosts: associateUserWithPosts(users.slice(0, 3), posts).map((u) => ({
        id: u.id,
        name: u.name,
        postCount: u.posts.length,
      })),
      postsWithComments: associatePostWithComments(posts.slice(0, 3), comments).map((p) => ({
        id: p.id,
        title: p.title,
        commentCount: p.comments.length,
      })),
    },

    // 3. Union
    union: {
      resourceTypes: ['users', 'posts', 'comments', 'albums', 'photos', 'todos'] as ResourceType[],
      mixedResources: (() => {
        const mixed: ApiResource[] = [firstUser, firstPost, firstComment, firstAlbum];
        return classifyResources(mixed);
      })(),
      user1Posts: filterByUserId(posts, 1).length,
      user1Albums: filterByUserId(albums, 1).length,
    },

    // 4. Generics
    generics: {
      fetchUser: { id: firstUser.id, name: firstUser.name },
      fetchPost: { id: firstPost.id, title: firstPost.title },
      multipleUsers: (await Promise.all([1, 2, 3].map((id) => userRepository.findById(id))))
        .filter((r): r is { success: true; data: User } => r.success)
        .map((r) => ({ id: r.data.id, name: r.data.name })),
      transforms: {
        userSummary: unwrap(
          await userRepository.findAllWithTransform((u) => ({
            id: u.id,
            name: u.name,
          })),
        ).slice(0, 3),
      },
    },

    // 5. Guard
    guard: {
      userCheck: (() => {
        const u: ApiResource = firstUser;
        return isUser(u) ? { isUser: true, username: u.username } : { isUser: false };
      })(),
      postCheck: (() => {
        const p: ApiResource = firstPost;
        return isPost(p) ? { isPost: true, userId: p.userId } : { isPost: false };
      })(),
      commentCheck: (() => {
        const c: ApiResource = firstComment;
        return isComment(c) ? { isComment: true, email: c.email } : { isComment: false };
      })(),
      albumCheck: (() => {
        const a: ApiResource = firstAlbum;
        return isAlbum(a) ? { isAlbum: true, userId: a.userId } : { isAlbum: false };
      })(),
      filtered: {
        usersFromMixed: [firstUser, firstPost, firstComment, firstAlbum]
          .filter(isUser)
          .map((u) => u.name),
        postsFromMixed: [firstUser, firstPost, firstComment, firstAlbum]
          .filter(isPost)
          .map((p) => p.title),
      },
    },

    // 6. Advanced
    advanced: {
      nullable: {
        before: [1, null, 2, null, 3] as (number | null)[],
        after: compact([1, null, 2, null, 3]),
      },
      partial: { name: 'Partial Only' } as Partial<User>,
      required: { id: 1, name: 'A', email: 'a@b.com' },
      record: (() => {
        const r: Record<number, string> = {};
        for (const u of users.slice(0, 3)) {
          r[u.id] = u.name;
        }
        return r;
      })(),
      deepObject: {
        users: users.slice(0, 2).map((u) => ({
          id: u.id,
          name: u.name,
          address: {
            city: u.address.city,
            geo: {
              lat: u.address.geo.lat,
              lng: u.address.geo.lng,
            },
          },
        })),
      },
    },
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log('\n=== Pattern 7 完了 ===');
}

main().catch(console.error);
