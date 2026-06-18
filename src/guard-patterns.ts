/**
 * ============================================
 * Pattern 5: 型ガード関数
 * ============================================
 * 学習内容:
 * - isUser(resource): resource is User
 * - isPost(resource): resource is Post
 * - isComment(resource): resource is Comment
 * - isAlbum(resource): resource is Album
 * - isPhoto(resource): resource is Photo
 * - isTodo(resource): resource is Todo
 * - 型ガードによる配列フィルタリング
 * - カスタム型ガードの実装
 */

import {
  userRepository,
  postRepository,
  commentRepository,
  albumRepository,
  photoRepository,
  todoRepository,
} from './api-client';
import { isUser, isPost, isComment, isAlbum, isPhoto, isTodo, type ApiResource } from './types';
import { first } from './utils';

async function main() {
  console.log('=== Pattern 5: 型ガード関数 ===\n');

  const [users, posts, comments, albums, photos, todos] = await Promise.all([
    userRepository.findAll(),
    postRepository.findAll(),
    commentRepository.findAll(),
    albumRepository.findAll(),
    photoRepository.findAll({ cache: true }),
    todoRepository.findAll({ cache: true }),
  ]);

  if (
    !users.success ||
    !posts.success ||
    !comments.success ||
    !albums.success ||
    !photos.success ||
    !todos.success
  ) {
    console.error('データ取得に失敗しました');
    return;
  }

  // 1. isUser
  console.log('【1. isUser(resource): resource is User】');
  const maybeUser: ApiResource = first(users.data);
  console.log('入力:', JSON.stringify({ id: maybeUser.id, type: 'ApiResource' }, null, 2));
  if (isUser(maybeUser)) {
    console.log(
      '型ガード後:',
      JSON.stringify(
        {
          isUser: true,
          username: maybeUser.username,
          email: maybeUser.email,
          company: maybeUser.company.name,
        },
        null,
        2,
      ),
    );
  }

  // 2. isPost
  console.log('\n【2. isPost(resource): resource is Post】');
  const maybePost: ApiResource = first(posts.data);
  console.log('入力:', JSON.stringify({ id: maybePost.id, type: 'ApiResource' }, null, 2));
  if (isPost(maybePost)) {
    console.log(
      '型ガード後:',
      JSON.stringify(
        {
          isPost: true,
          userId: maybePost.userId,
          title: maybePost.title,
          bodyLength: maybePost.body.length,
        },
        null,
        2,
      ),
    );
  }

  // 3. isComment
  console.log('\n【3. isComment(resource): resource is Comment】');
  const maybeComment: ApiResource = first(comments.data);
  console.log('入力:', JSON.stringify({ id: maybeComment.id, type: 'ApiResource' }, null, 2));
  if (isComment(maybeComment)) {
    console.log(
      '型ガード後:',
      JSON.stringify(
        {
          isComment: true,
          postId: maybeComment.postId,
          email: maybeComment.email,
          bodyLength: maybeComment.body.length,
        },
        null,
        2,
      ),
    );
  }

  // 4. isAlbum
  console.log('\n【4. isAlbum(resource): resource is Album】');
  const maybeAlbum: ApiResource = first(albums.data);
  console.log('入力:', JSON.stringify({ id: maybeAlbum.id, type: 'ApiResource' }, null, 2));
  if (isAlbum(maybeAlbum)) {
    console.log(
      '型ガード後:',
      JSON.stringify(
        {
          isAlbum: true,
          userId: maybeAlbum.userId,
          title: maybeAlbum.title,
        },
        null,
        2,
      ),
    );
  }

  // 4b. isPhoto
  console.log('\n【4b. isPhoto(resource): resource is Photo】');
  const maybePhoto: ApiResource = first(photos.data);
  console.log('入力:', JSON.stringify({ id: maybePhoto.id, type: 'ApiResource' }, null, 2));
  if (isPhoto(maybePhoto)) {
    console.log(
      '型ガード後:',
      JSON.stringify(
        {
          isPhoto: true,
          albumId: maybePhoto.albumId,
          title: maybePhoto.title.slice(0, 30),
        },
        null,
        2,
      ),
    );
  }

  // 4c. isTodo
  console.log('\n【4c. isTodo(resource): resource is Todo】');
  const maybeTodo: ApiResource = first(todos.data);
  console.log('入力:', JSON.stringify({ id: maybeTodo.id, type: 'ApiResource' }, null, 2));
  if (isTodo(maybeTodo)) {
    console.log(
      '型ガード後:',
      JSON.stringify(
        {
          isTodo: true,
          userId: maybeTodo.userId,
          title: maybeTodo.title.slice(0, 30),
          completed: maybeTodo.completed,
        },
        null,
        2,
      ),
    );
  }

  // 5. Union型の配列を型ガードでフィルタリング
  console.log('\n【5. 型ガードによる配列フィルタリング】');
  const mixed: ApiResource[] = [
    ...users.data.slice(0, 2),
    ...posts.data.slice(0, 2),
    ...comments.data.slice(0, 2),
    ...albums.data.slice(0, 2),
    ...photos.data.slice(0, 1),
    ...todos.data.slice(0, 1),
  ];
  console.log(
    '混合配列 (ApiResource[10件]):',
    JSON.stringify(
      mixed.map((r) => ({
        id: r.id,
        guessed: isUser(r)
          ? 'User'
          : isPost(r)
            ? 'Post'
            : isComment(r)
              ? 'Comment'
              : isAlbum(r)
                ? 'Album'
                : isPhoto(r)
                  ? 'Photo'
                  : isTodo(r)
                    ? 'Todo'
                    : 'Unknown',
      })),
      null,
      2,
    ),
  );

  const onlyUsers = mixed.filter(isUser);
  const onlyPosts = mixed.filter(isPost);
  const onlyComments = mixed.filter(isComment);
  const onlyAlbums = mixed.filter(isAlbum);
  const onlyPhotos = mixed.filter(isPhoto);
  const onlyTodos = mixed.filter(isTodo);
  console.log(
    'isUser でフィルタリング:',
    JSON.stringify(
      onlyUsers.map((u) => ({ id: u.id, name: u.name, username: u.username })),
      null,
      2,
    ),
  );
  console.log(
    'isPost でフィルタリング:',
    JSON.stringify(
      onlyPosts.map((p) => ({ id: p.id, title: p.title.slice(0, 30) })),
      null,
      2,
    ),
  );
  console.log(
    'isComment でフィルタリング:',
    JSON.stringify(
      onlyComments.map((c) => ({ id: c.id, name: c.name, email: c.email })),
      null,
      2,
    ),
  );
  console.log(
    'isAlbum でフィルタリング:',
    JSON.stringify(
      onlyAlbums.map((a) => ({ id: a.id, title: a.title.slice(0, 30) })),
      null,
      2,
    ),
  );
  console.log(
    'isPhoto でフィルタリング:',
    JSON.stringify(
      onlyPhotos.map((p) => ({ id: p.id, title: p.title.slice(0, 30) })),
      null,
      2,
    ),
  );
  console.log(
    'isTodo でフィルタリング:',
    JSON.stringify(
      onlyTodos.map((t) => ({ id: t.id, completed: t.completed })),
      null,
      2,
    ),
  );

  // 6. カスタム型ガード
  console.log('\n【6. カスタム型ガードの例】');
  function hasEmail<T>(resource: T): resource is T & { email: string } {
    return typeof (resource as { email?: unknown }).email === 'string';
  }
  const emailHolders = mixed.filter(hasEmail);
  console.log(
    'hasEmail でフィルタリング:',
    JSON.stringify(
      emailHolders.map((r) => ({ id: r.id, email: r.email })),
      null,
      2,
    ),
  );

  console.log('\n=== Pattern 5 完了 ===');
}

main().catch(console.error);
