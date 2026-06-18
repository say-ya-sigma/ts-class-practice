/**
 * ============================================
 * Pattern 6: 高度な型操作
 * ============================================
 * 学習内容:
 * - Nullable<T>, Optional<T>
 * - Partial<T>, Required<T>, Pick<T,K>, Omit<T,K>
 * - Record<K,T>
 * - ElementType<T>, ReturnType<T> (infer)
 * - IsString<T>, IsNumber<T> (条件付き型)
 * - DeepReadonly<T> (再帰型)
 * - CamelCase<S> (テンプレートリテラル型)
 * - JSONValue (再帰型)
 */

import { userRepository, postRepository } from './api-client';
import { compact, keysToCamelCase, first } from './utils';
import type {
  User,
  Nullable,
  Optional,
  PartialUser,
  RequiredUserFields,
  UserWithoutCompany,
} from './types';

// ============================================
// このファイル内で学習する高度な型（ローカル定義）
// ============================================

/** 配列の要素型を infer で取り出す */
type ElementType<T> = T extends (infer U)[] ? U : never;

/** 関数の戻り値型を infer で取り出す */
type ReturnTypeOf<T> = T extends (...args: never[]) => infer R ? R : never;

/** 条件付き型: T が string なら true */
type IsString<T> = T extends string ? true : false;

/** 条件付き型: T が number なら true */
type IsNumber<T> = T extends number ? true : false;

/** 再帰的な Readonly（ネストしたオブジェクトもすべて readonly に） */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** 再帰的な JSON 値型 */
type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];

async function main() {
  console.log('=== Pattern 6: 高度な型操作 ===\n');

  const usersResult = await userRepository.findAll();
  const postsResult = await postRepository.findAll();

  if (!usersResult.success || !postsResult.success) {
    console.error('データ取得に失敗しました');
    return;
  }

  const users = usersResult.data;
  const posts = postsResult.data;

  // 1. Nullable<T>, Optional<T>
  console.log('【1. Nullable<T>, Optional<T> - ユニオン型のエイリアス】');
  const nullableValues: Nullable<number>[] = [1, null, 2, null, 3];
  const optionalValues: Optional<string>[] = ['a', undefined, 'b', undefined, 'c'];
  console.log('Nullable<number>[]:', JSON.stringify(nullableValues, null, 2));
  console.log('Optional<string>[]:', JSON.stringify(optionalValues, null, 2));
  console.log('compact(Nullable[]):', JSON.stringify(compact(nullableValues), null, 2));

  // 2. Partial<T>, Required<T>, Pick<T,K>, Omit<T,K>
  console.log('\n【2. Partial<T>, Required<T>, Pick<T,K>, Omit<T,K>】');
  const fullUser = first(users);
  console.log('元の User (全プロパティ):', JSON.stringify(Object.keys(fullUser), null, 2));

  const partialUser: PartialUser = { name: 'Partial User' };
  console.log('Partial<User> (nameのみ):', JSON.stringify(partialUser, null, 2));

  const requiredFields: RequiredUserFields = {
    id: fullUser.id,
    name: fullUser.name,
    email: fullUser.email,
  };
  console.log('Pick<User, "id" | "name" | "email">:', JSON.stringify(requiredFields, null, 2));

  const withoutCompany: UserWithoutCompany = {
    id: fullUser.id,
    name: fullUser.name,
    username: fullUser.username,
    email: fullUser.email,
    address: fullUser.address,
    phone: fullUser.phone,
    website: fullUser.website,
  };
  console.log(
    'Omit<User, "company"> (keys):',
    JSON.stringify(Object.keys(withoutCompany), null, 2),
  );

  // 3. Record<K,T>
  console.log('\n【3. Record<K,T> - オブジェクトの型付け】');
  const userById: Record<number, User> = {};
  for (const user of users) {
    userById[user.id] = user;
  }
  console.log(
    'Record<number, User>:',
    JSON.stringify(
      Object.fromEntries(
        Object.entries(userById)
          .slice(0, 3)
          .map(([k, v]) => [k, { name: v.name }]),
      ),
      null,
      2,
    ),
  );

  // 4. ElementType<T>, ReturnTypeOf<T> (infer)
  console.log('\n【4. ElementType<T>, ReturnTypeOf<T> (infer)】');
  type PostArray = typeof posts;
  type SinglePost = ElementType<PostArray>;
  const samplePost: SinglePost = first(posts);
  console.log(
    'ElementType<Post[]> (infer U):',
    JSON.stringify(
      {
        id: samplePost.id,
        title: samplePost.title,
      },
      null,
      2,
    ),
  );

  type FetchFn = typeof userRepository.findAll;
  type FetchResultPromise = ReturnTypeOf<FetchFn>; // Promise<Result<User[]>>
  type FetchResultAwaited = Awaited<FetchResultPromise>; // Result<User[]>
  const result: FetchResultAwaited = await userRepository.findAll();
  console.log(
    'ReturnTypeOf<ApiRepository["findAll"]> (infer R) + Awaited<T>:',
    JSON.stringify(
      {
        promiseType: 'Promise<Result<User[]>>',
        awaitedType: 'Result<User[]>',
        hasSuccess: 'success' in result,
      },
      null,
      2,
    ),
  );

  // 5. 条件付き型 IsString<T>, IsNumber<T>
  console.log('\n【5. 条件付き型 IsString<T>, IsNumber<T>】');
  type CheckString = IsString<string>;
  type CheckNumber = IsNumber<number>;
  type CheckStringNumber = IsString<number>;
  const conditionalDemo: {
    isStringString: CheckString;
    isNumberNumber: CheckNumber;
    isStringNumber: CheckStringNumber;
  } = {
    isStringString: true,
    isNumberNumber: true,
    isStringNumber: false,
  };
  console.log('条件付き型の結果:', JSON.stringify(conditionalDemo, null, 2));

  // 6. テンプレートリテラル型 CamelCase<S> (keysToCamelCase 経由で実演)
  console.log('\n【6. テンプレートリテラル型 CamelCase<S>】');
  const snakeCaseObj = {
    user_id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email_address: 'john@example.com',
    phone_number: '123-456-7890',
  };
  console.log('入力 (snake_case):', JSON.stringify(snakeCaseObj, null, 2));
  const camelCaseObj = keysToCamelCase(snakeCaseObj);
  console.log('出力 (camelCase):', JSON.stringify(camelCaseObj, null, 2));

  // 7. 再帰型 JSONValue / DeepReadonly
  console.log('\n【7. 再帰型 JSONValue / DeepReadonly<T>】');
  const jsonData: JSONValue = {
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
    meta: {
      total: users.length,
      page: 1,
    },
  };
  console.log('JSONValue (入れ子オブジェクト):', JSON.stringify(jsonData, null, 2));

  // DeepReadonly はコンパイル時のみの機能。実行時には影響しないが、
  // 代入しようとするとコンパイルエラーになることを以下の型注釈で示す。
  const readonlyUser: DeepReadonly<User> = {
    ...fullUser,
  };
  console.log(
    'DeepReadonly<User> (id は readonly):',
    JSON.stringify({ id: readonlyUser.id, name: readonlyUser.name }, null, 2),
  );

  console.log('\n=== Pattern 6 完了 ===');
}

main().catch(console.error);
