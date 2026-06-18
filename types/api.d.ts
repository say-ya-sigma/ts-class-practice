/**
 * ============================================
 * .d.ts 型定義ファイルの例
 * ============================================
 *
 * .d.tsファイルは型定義専用ファイルです。
 * 実装（JavaScriptコード）を含まず、型情報のみを記述します。
 * 主な用途:
 * 1. 外部ライブラリの型定義
 * 2. グローバルな型の拡張
 * 3. 型情報の分離（実装と型を分離する）
 */

// ============================================
// 1. 外部APIの型定義（JSONPlaceholder）
// ============================================

declare namespace JsonPlaceholderAPI {
  interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
      street: string;
      suite: string;
      city: string;
      zipcode: string;
      geo: {
        lat: string;
        lng: string;
      };
    };
    phone: string;
    website: string;
    company: {
      name: string;
      catchPhrase: string;
      bs: string;
    };
  }

  interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
  }

  interface Comment {
    postId: number;
    id: number;
    name: string;
    email: string;
    body: string;
  }

  interface Album {
    userId: number;
    id: number;
    title: string;
  }

  interface Photo {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
  }

  interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  }

  // リソースのUnion型
  type Resource = User | Post | Comment | Album | Photo | Todo;

  // エンドポイントの型
  type Endpoint = 'users' | 'posts' | 'comments' | 'albums' | 'photos' | 'todos';
}

// ============================================
// 2. グローバルな型の拡張
// ============================================

// Windowオブジェクトにカスタムプロパティを追加
declare global {
  interface Window {
    myApp: {
      version: string;
      apiUrl: string;
    };
  }
}

// fetch関数の拡張（オプションの型強化）
declare global {
  interface RequestInit {
    // カスタムヘッダーなどを追加する場合
    myCustomOption?: string;
  }
}

// ============================================
// 3. 型のエイリアス
// ============================================

declare type Nullable<T> = T | null;
declare type Optional<T> = T | undefined;
declare type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// ============================================
// 4. モジュールの型定義
// ============================================

// もし外部モジュールの型を拡張する場合
declare module 'my-external-module' {
  export function myFunction(): string;
  export interface MyInterface {
    id: number;
  }
}

// ============================================
// 5. 環境変数の型定義
// ============================================

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    API_BASE_URL: string;
    API_TIMEOUT: string;
  }
}

// ============================================
// 6. 定数の型定義
// ============================================

declare const API_VERSION: string;
declare const API_BASE_URL: string;

// ============================================
// 7. 関数の型定義（オーバーロード）
// ============================================

declare function fetchResource(type: 'users', id: number): Promise<JsonPlaceholderAPI.User>;
declare function fetchResource(type: 'posts', id: number): Promise<JsonPlaceholderAPI.Post>;
declare function fetchResource(type: 'comments', id: number): Promise<JsonPlaceholderAPI.Comment>;
declare function fetchResource(type: 'albums', id: number): Promise<JsonPlaceholderAPI.Album>;

// ============================================
// 8. クラスの型定義（実装なし）
// ============================================

declare class ApiClient {
  constructor(baseUrl: string);
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body: unknown): Promise<T>;
  put<T>(path: string, body: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

// ============================================
// 9. 列挙型の型定義
// ============================================

declare enum ResourceType {
  Users = 'users',
  Posts = 'posts',
  Comments = 'comments',
  Albums = 'albums',
  Photos = 'photos',
  Todos = 'todos',
}

// ============================================
// 10. マッピング型の例
// ============================================

declare type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

declare type Partial<T> = {
  [P in keyof T]?: T[P];
};

declare type Required<T> = {
  [P in keyof T]-?: T[P];
};

declare type Record<K extends keyof any, T> = {
  [P in K]: T;
};

declare type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

declare type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// ============================================
// 11. 条件付き型の例
// ============================================

declare type IsString<T> = T extends string ? true : false;
declare type IsNumber<T> = T extends number ? true : false;
declare type IsArray<T> = T extends any[] ? true : false;

declare type ElementType<T> = T extends (infer U)[] ? U : never;
declare type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

declare type NonNullable<T> = T extends null | undefined ? never : T;

declare type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ============================================
// 12. テンプレートリテラル型の例
// ============================================

declare type EventName<T extends string> = `on${Capitalize<T>}`;
declare type CSSProperty = `margin-${'top' | 'bottom' | 'left' | 'right'}`;
declare type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
declare type APIEndpoint = `/api/${string}`;

// ============================================
// 13. 汎用型のユーティリティ
// ============================================

declare interface Identifiable {
  id: number;
}

declare interface Named {
  name: string;
}

declare type WithId<T> = T & Identifiable;
declare type WithName<T> = T & Named;
declare type Entity = WithId<WithName<{}>>;

// ============================================
// 14. 型の互換性
// ============================================

declare type StringOrNumber = string | number;
declare type StringOrBoolean = string | boolean;
declare type Intersection = StringOrNumber & StringOrBoolean; // string

// ============================================
// 15. 再帰型の例
// ============================================

declare type NestedArray<T> = T | NestedArray<T>[];
declare type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
declare interface JSONObject {
  [key: string]: JSONValue;
}
declare interface JSONArray extends Array<JSONValue> {}

// エクスポート（モジュールとして使用する場合）
export {};
