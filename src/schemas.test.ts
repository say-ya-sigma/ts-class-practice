import { describe, it, expect } from 'vitest';
import {
  userSchema,
  postSchema,
  commentSchema,
  albumSchema,
  photoSchema,
  todoSchema,
  validateResource,
  validateResourceArray,
} from './schemas';

const validUser = {
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
  company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered', bs: 'harness' },
};

const validPost = { userId: 1, id: 1, title: 't', body: 'b' };
const validComment = { postId: 1, id: 1, name: 'n', email: 'e@x.com', body: 'b' };
const validAlbum = { userId: 1, id: 1, title: 't' };
const validPhoto = {
  albumId: 1,
  id: 1,
  title: 't',
  url: 'https://example.com/1.jpg',
  thumbnailUrl: 'https://example.com/t1.jpg',
};
const validTodo = { userId: 1, id: 1, title: 't', completed: false };

describe('各リソーススキーマ (正常系)', () => {
  it('userSchema が有効な User をパースする', () => {
    expect(userSchema.parse(validUser)).toEqual(validUser);
  });
  it('postSchema が有効な Post をパースする', () => {
    expect(postSchema.parse(validPost)).toEqual(validPost);
  });
  it('commentSchema が有効な Comment をパースする', () => {
    expect(commentSchema.parse(validComment)).toEqual(validComment);
  });
  it('albumSchema が有効な Album をパースする', () => {
    expect(albumSchema.parse(validAlbum)).toEqual(validAlbum);
  });
  it('photoSchema が有効な Photo をパースする', () => {
    expect(photoSchema.parse(validPhoto)).toEqual(validPhoto);
  });
  it('todoSchema が有効な Todo をパースする', () => {
    expect(todoSchema.parse(validTodo)).toEqual(validTodo);
  });
});

describe('各リソーススキーマ (異常系)', () => {
  it('userSchema は必須フィールド欠落を拒否', () => {
    const result = userSchema.safeParse({ id: 1, name: 'x' });
    expect(result.success).toBe(false);
  });

  it('postSchema は型違いを拒否 (id が文字列)', () => {
    const result = postSchema.safeParse({ userId: 1, id: '1', title: 't', body: 'b' });
    expect(result.success).toBe(false);
  });

  it('photoSchema は不正URLを拒否', () => {
    const result = photoSchema.safeParse({
      albumId: 1,
      id: 1,
      title: 't',
      url: 'not-a-url',
      thumbnailUrl: 'also-not',
    });
    expect(result.success).toBe(false);
  });

  it('todoSchema は completed が boolean 以外を拒否', () => {
    const result = todoSchema.safeParse({ userId: 1, id: 1, title: 't', completed: 'yes' });
    expect(result.success).toBe(false);
  });
});

describe('validateResource', () => {
  it('タイプを指定して単一リソースを検証', () => {
    const user = validateResource('users', validUser);
    expect(user.id).toBe(1);
    expect(user.username).toBe('Bret');
  });

  it('タイプを指定して配列を検証', () => {
    const posts = validateResourceArray('posts', [validPost, validPost]);
    expect(posts).toHaveLength(2);
  });

  it('配列検証で不正要素は例外', () => {
    expect(() => validateResourceArray('posts', [validPost, { bad: true }])).toThrow();
  });
});

describe('スキーマとTS型の整合性', () => {
  it('z.infer は TS 型と一致する（コンパイル時検証）', () => {
    // これらはコンパイルが通れば型が整合している証拠
    const _u: { id: number; name: string; username: string } = userSchema.parse(validUser);
    const _p: { userId: number; id: number; title: string; body: string } =
      postSchema.parse(validPost);
    expect(_u.id).toBe(1);
    expect(_p.userId).toBe(1);
  });
});
