# TypeScript 復習プロジェクト

TypeScript の基礎（Array / Object / Union / Generics / 型ガード / 高度な型操作 / `.d.ts`）を復習するためのサンプルプロジェクトです。
パブリックな API（[JSONPlaceholder](https://jsonplaceholder.typicode.com/)）にアクセスし、実際の JSON データを **コンパイル時の型安全** と **zod による実行時検証** の両面から扱います。

v1.1 のブラッシュアップで以下を追加しています：

- **zod によるランタイム検証**（`as T` の乱用を排除）
- **AbortController によるタイムアウト** + **TTL 付きキャッシュ**
- **Photo / Todo リソース** を追加（計 6 リソース）
- **型ガードを固有キーで堅牢化**（`isPost`/`isAlbum`/`isPhoto`/`isTodo`）
- **Vitest によるユニットテスト**（67 件）
- **ESLint + Prettier** の導入
- **tsconfig 厳格化**（`noUncheckedIndexedAccess` 等）
- **ts-node → tsx** に移行（起動高速化）

## 使用する API

[JSONPlaceholder](https://jsonplaceholder.typicode.com/) - 無料のパブリックな REST API

## プロジェクト構成

```
├── src/
│   ├── index.ts              # メインエントリポイント（全パターンサマリー）
│   ├── types.ts              # 基本型定義 + 型ガード (User/Post/Comment/Album/Photo/Todo)
│   ├── schemas.ts            # zod スキーマ（実行時検証）
│   ├── api-client.ts         # Generics を応用した API クライアント (zod + timeout + cache)
│   ├── utils.ts              # 配列操作・オブジェクト操作ユーティリティ
│   ├── array-patterns.ts     # Pattern 1: Array型の応用
│   ├── object-patterns.ts    # Pattern 2: Object型の応用
│   ├── union-patterns.ts     # Pattern 3: Union型の応用
│   ├── generics-patterns.ts  # Pattern 4: Genericsの応用
│   ├── guard-patterns.ts     # Pattern 5: 型ガード関数 (6 リソース対応)
│   ├── advanced-patterns.ts  # Pattern 6: 高度な型操作
│   ├── all-patterns.ts       # Pattern 7: すべてのパターンをまとめて実行
│   ├── utils.test.ts         # Vitest ユニットテスト (utils)
│   ├── types.test.ts         # Vitest ユニットテスト (型ガード / Result)
│   └── schemas.test.ts       # Vitest ユニットテスト (zod スキーマ)
├── types/
│   └── api.d.ts              # .d.ts 型定義ファイルの例（教学用 declare 集）
├── dist/                     # コンパイル済み JavaScript
├── eslint.config.mjs         # ESLint flat config
├── .prettierrc.mjs           # Prettier 設定
├── vitest.config.ts          # Vitest 設定
├── package.json
├── tsconfig.json
└── README.md
```

## セットアップ

```bash
npm install
```

## 開発コマンド

```bash
# 品質チェック（typecheck + lint + test を一括）
npm run check

# 型チェックのみ
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# フォーマット
npm run format
npm run format:check

# テスト
npm test            # 1 回実行
npm run test:watch  # watch モード
```

## 実行コマンド

```bash
# ビルド
npm run build

# 実行
npm start          # index.ts（全パターンサマリー）

# 7 パターンの個別実行（実際の JSON データを含む出力）
npm run array      # Pattern 1: Array型の応用
npm run object     # Pattern 2: Object型の応用
npm run union      # Pattern 3: Union型の応用
npm run generics   # Pattern 4: Genericsの応用
npm run guard      # Pattern 5: 型ガード関数 (Photo/Todo 含む 6 リソース)
npm run advanced   # Pattern 6: 高度な型操作
npm run all        # Pattern 7: すべてのパターンをまとめて実行
```

## 各パターンの学習内容

### Pattern 1: Array型の応用

- `pluck<T, K>` - 配列から特定のプロパティを抽出
- `sortBy<T>` - Comparator 関数によるソート
- `paginate<T>` - ページ分割
- `groupBy<T, K>` - `Record<K, T[]>` でグループ化
- `unique<T>` - Set で重複排除
- `flatten<T>` - 配列の配列を平坦化
- `reduceBy<T, K, V>` - 集計
- `first<T>` / `last<T>` - `noUncheckedIndexedAccess` 安全版の先頭/末尾取得

### Pattern 2: Object型の応用

- `pick<T, K>` - オブジェクトから特定のキーを抽出
- `omit<T, K>` - オブジェクトから特定のキーを除外（`any`/`delete` 不使用）
- `merge<T, U>` - 2 つのオブジェクトをマージ
- `keysToCamelCase<T>` - キー名を変換（snake_case -> camelCase）
- `associateUserWithPosts` / `associatePostWithComments` - オブジェクトの関連付け

### Pattern 3: Union型の応用

- `Result<T, E>` - 成功・失敗の Union 型（Success | Failure）
- `ApiResource` - 複数の型の Union 型（User | Post | Comment | Album | Photo | Todo）
- `ResourceType` - 文字列 Union 型
- `classifyResources` - Union 型の配列を型ガードで分類
- `WithUserId<T>` - 条件付き型（`{ userId: number }` を持つ型を抽出）
- `in` 演算子による Union 型の絞り込み

### Pattern 4: Genericsの応用

- `fetchData<T>(url, schema)` - zod スキーマから T を推論する基本関数
- `fetchResource<K extends ResourceType>` - 制約付き Generics（K から型を自動推論）
- `fetchMultiple<K>` - 可変長引数 + Generics
- `fetchTypedResource<K>` - キーから型を自動推論
- `ApiRepository<K>` - 型安全なリポジトリパターン
- `findAllWithTransform<R>` - コールバック + Generics
- `ResourceTypeMap` - リソースタイプ → エンティティ型のマッピング

### Pattern 5: 型ガード関数

- `isUser(resource): resource is User`（`username` で判定）
- `isPost(resource): resource is Post`（`userId` + `title` + `body`）
- `isComment(resource): resource is Comment`（`postId` + `email`）
- `isAlbum(resource): resource is Album`（`title` + `body` 無し）
- `isPhoto(resource): resource is Photo`（`albumId` + `url`）
- `isTodo(resource): resource is Todo`（`completed: boolean`）
- 型ガードによる配列フィルタリング
- カスタム型ガード（`hasEmail<T>`）

### Pattern 6: 高度な型操作

- `Nullable<T>`, `Optional<T>` - ユニオン型のエイリアス
- `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>` - マッピング型
- `Record<K, T>` - オブジェクトの型付け
- `ElementType<T>`, `ReturnTypeOf<T>` - `infer` での型推論
- `Awaited<T>` - Promise の中身を取り出す
- `IsString<T>`, `IsNumber<T>` - 条件付き型
- `CamelCase<S>` - テンプレートリテラル型
- `DeepReadonly<T>`, `JSONValue` - 再帰型

### Pattern 7: すべてをまとめて実行

Pattern 1〜6 のすべての機能を一括で実行し、1 つの巨大な JSON オブジェクトとして出力します。

### .d.ts ファイル（型定義ファイル）

`types/api.d.ts` に以下の教学例を記述：

- 外部 API の型定義（`namespace JsonPlaceholderAPI`）
- グローバルな型の拡張（`Window`, `RequestInit`）
- 型のエイリアス（`Nullable`, `Optional`, `Result`）
- モジュールの型定義
- 環境変数の型定義
- 関数のオーバーロード
- クラスの型定義
- 列挙型
- マッピング型（`Readonly`, `Partial`, `Required`, `Record`, `Pick`, `Omit`）
- 条件付き型（`IsString`, `IsNumber`, `ElementType`, `ReturnType`）
- テンプレートリテラル型（`EventName`, `CSSProperty`, `APIEndpoint`）
- 再帰型（`NestedArray`, `JSONValue`）

## zod によるランタイム検証

本プロジェクトでは TS の型（コンパイル時に消える）と zod（実行時に検証）を併用します。

```ts
// 従来: as T で型アサーション（実行時の形を保証しない）
const data = (await response.json()) as T;

// 改善後: zod スキーマで検証しつつ型も推論
const data = await fetchData(url, userSchema);
// T は userSchema から推論されるため as 不要
```

`src/schemas.ts` に各リソースの zod スキーマを定義し、`api-client.ts` の `fetchData` が必ずスキーマ経由で検証します。これにより「型は合っているが実データの形が違う」バグを防げます。

## API クライアントの機能

- **タイムアウト**: `AbortController` + `DEFAULT_TIMEOUT_MS`（8 秒）
- **キャッシュ**: TTL 付きインメモリキャッシュ（デフォルト 60 秒）
  - `setCacheTtl(ms)` / `clearCache()` で制御可能
- **オプション**: `FetchOptions { timeoutMs?, cache?, cacheKey? }`
- **Result 型**: 例外を投げず `Result<T>` で成功/失敗を返す（`unwrap()` で取り出し）

## テスト

```bash
npm test
```

`utils.ts` / `types.ts` / `schemas.ts` の主要関数と型ガードを 67 件のユニットテストでカバーしています。テストはネットワークアクセス不要（フィクスチャ使用）。

## 厳格な tsconfig 設定

- `strict: true`
- `noUncheckedIndexedAccess` - 配列/Record のインデックスアクセスを `T | undefined` に
- `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- `noUnusedLocals`, `noUnusedParameters`
- `isolatedModules`

## 要件

- Node.js 18+
- TypeScript 5.5+
