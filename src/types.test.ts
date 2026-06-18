import { describe, it, expect } from 'vitest';
import {
  unwrap,
  mapResult,
  isUser,
  isPost,
  isComment,
  isAlbum,
  isPhoto,
  isTodo,
  type ApiResource,
  type Result,
} from './types';

// テスト用サンプル
const sampleUser: ApiResource = {
  id: 1,
  name: 'Leanne',
  username: 'Bret',
  email: 'leanne@x.com',
  phone: '1-770',
  website: 'x.org',
  address: {
    street: 's',
    suite: 'su',
    city: 'c',
    zipcode: 'z',
    geo: { lat: '1', lng: '2' },
  },
  company: { name: 'C', catchPhrase: 'p', bs: 'b' },
};

const samplePost: ApiResource = { userId: 1, id: 1, title: 't', body: 'b' };
const sampleComment: ApiResource = { postId: 1, id: 1, name: 'n', email: 'e@x.com', body: 'b' };
const sampleAlbum: ApiResource = { userId: 1, id: 1, title: 't' };
const samplePhoto: ApiResource = {
  albumId: 1,
  id: 1,
  title: 't',
  url: 'https://x.com/1.jpg',
  thumbnailUrl: 'https://x.com/t1.jpg',
};
const sampleTodo: ApiResource = { userId: 1, id: 1, title: 't', completed: false };

describe('unwrap', () => {
  it('成功Resultからデータを取り出す', () => {
    const ok: Result<number> = { success: true, data: 42 };
    expect(unwrap(ok)).toBe(42);
  });

  it('失敗Resultは例外をスロー', () => {
    const err: Result<number> = { success: false, error: new Error('boom') };
    expect(() => unwrap(err)).toThrow('boom');
  });
});

describe('mapResult', () => {
  it('成功時は関数を適用', () => {
    const ok: Result<number> = { success: true, data: 10 };
    const mapped = mapResult(ok, (n) => n * 2);
    expect(mapped).toEqual({ success: true, data: 20 });
  });

  it('失敗時はそのまま伝播', () => {
    const err: Result<number> = { success: false, error: new Error('e') };
    const mapped = mapResult<number, number>(err, (n) => n * 2);
    expect(mapped.success).toBe(false);
    if (!mapped.success) {
      expect(mapped.error.message).toBe('e');
    }
  });
});

describe('型ガード', () => {
  describe('isUser', () => {
    it('User を正しく判定', () => {
      expect(isUser(sampleUser)).toBe(true);
    });
    it('他リソースは false', () => {
      expect(isUser(samplePost)).toBe(false);
      expect(isUser(sampleComment)).toBe(false);
      expect(isUser(sampleAlbum)).toBe(false);
      expect(isUser(samplePhoto)).toBe(false);
      expect(isUser(sampleTodo)).toBe(false);
    });
  });

  describe('isPost', () => {
    it('Post を正しく判定', () => {
      expect(isPost(samplePost)).toBe(true);
    });
    it('他リソースは false', () => {
      expect(isPost(sampleUser)).toBe(false);
      expect(isPost(sampleComment)).toBe(false);
      expect(isPost(sampleAlbum)).toBe(false);
    });
  });

  describe('isComment', () => {
    it('Comment を正しく判定', () => {
      expect(isComment(sampleComment)).toBe(true);
    });
    it('他リソースは false', () => {
      expect(isComment(samplePost)).toBe(false);
      expect(isComment(sampleUser)).toBe(false);
    });
  });

  describe('isAlbum', () => {
    it('Album を正しく判定', () => {
      expect(isAlbum(sampleAlbum)).toBe(true);
    });
    it('Post (title+body) と区別できる', () => {
      expect(isAlbum(samplePost)).toBe(false);
    });
    it('Photo と区別できる', () => {
      expect(isAlbum(samplePhoto)).toBe(false);
    });
  });

  describe('isPhoto', () => {
    it('Photo を正しく判定', () => {
      expect(isPhoto(samplePhoto)).toBe(true);
    });
    it('Album と区別できる', () => {
      expect(isPhoto(sampleAlbum)).toBe(false);
    });
  });

  describe('isTodo', () => {
    it('Todo を正しく判定', () => {
      expect(isTodo(sampleTodo)).toBe(true);
    });
    it('他リソースは false', () => {
      expect(isTodo(samplePost)).toBe(false);
      expect(isTodo(sampleAlbum)).toBe(false);
    });
  });

  it('各型ガードで絞り込んだ後は固有プロパティにアクセス可能', () => {
    // 型レベルの検証: コンパイルが通ればOK
    if (isUser(sampleUser)) {
      expect(sampleUser.username).toBe('Bret');
    }
    if (isPost(samplePost)) {
      expect(samplePost.body).toBe('b');
    }
    if (isComment(sampleComment)) {
      expect(sampleComment.postId).toBe(1);
    }
    if (isAlbum(sampleAlbum)) {
      expect(sampleAlbum.userId).toBe(1);
    }
    if (isPhoto(samplePhoto)) {
      expect(samplePhoto.albumId).toBe(1);
    }
    if (isTodo(sampleTodo)) {
      expect(sampleTodo.completed).toBe(false);
    }
  });
});
