
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model CustodialWallet
 * 
 */
export type CustodialWallet = $Result.DefaultSelection<Prisma.$CustodialWalletPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Wallet
 * 
 */
export type Wallet = $Result.DefaultSelection<Prisma.$WalletPayload>
/**
 * Model WalletTransaction
 * 
 */
export type WalletTransaction = $Result.DefaultSelection<Prisma.$WalletTransactionPayload>
/**
 * Model Bet
 * 
 */
export type Bet = $Result.DefaultSelection<Prisma.$BetPayload>
/**
 * Model UserTask
 * 
 */
export type UserTask = $Result.DefaultSelection<Prisma.$UserTaskPayload>
/**
 * Model Referral
 * 
 */
export type Referral = $Result.DefaultSelection<Prisma.$ReferralPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CustodialWallets
 * const custodialWallets = await prisma.custodialWallet.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more CustodialWallets
   * const custodialWallets = await prisma.custodialWallet.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.custodialWallet`: Exposes CRUD operations for the **CustodialWallet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CustodialWallets
    * const custodialWallets = await prisma.custodialWallet.findMany()
    * ```
    */
  get custodialWallet(): Prisma.CustodialWalletDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.wallet`: Exposes CRUD operations for the **Wallet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Wallets
    * const wallets = await prisma.wallet.findMany()
    * ```
    */
  get wallet(): Prisma.WalletDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.walletTransaction`: Exposes CRUD operations for the **WalletTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WalletTransactions
    * const walletTransactions = await prisma.walletTransaction.findMany()
    * ```
    */
  get walletTransaction(): Prisma.WalletTransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.bet`: Exposes CRUD operations for the **Bet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bets
    * const bets = await prisma.bet.findMany()
    * ```
    */
  get bet(): Prisma.BetDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userTask`: Exposes CRUD operations for the **UserTask** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTasks
    * const userTasks = await prisma.userTask.findMany()
    * ```
    */
  get userTask(): Prisma.UserTaskDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.referral`: Exposes CRUD operations for the **Referral** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Referrals
    * const referrals = await prisma.referral.findMany()
    * ```
    */
  get referral(): Prisma.ReferralDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.18.0
   * Query Engine version: 34b5a692b7bd79939a9a2c3ef97d816e749cda2f
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    CustodialWallet: 'CustodialWallet',
    User: 'User',
    Wallet: 'Wallet',
    WalletTransaction: 'WalletTransaction',
    Bet: 'Bet',
    UserTask: 'UserTask',
    Referral: 'Referral'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "custodialWallet" | "user" | "wallet" | "walletTransaction" | "bet" | "userTask" | "referral"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      CustodialWallet: {
        payload: Prisma.$CustodialWalletPayload<ExtArgs>
        fields: Prisma.CustodialWalletFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CustodialWalletFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CustodialWalletFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>
          }
          findFirst: {
            args: Prisma.CustodialWalletFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CustodialWalletFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>
          }
          findMany: {
            args: Prisma.CustodialWalletFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>[]
          }
          create: {
            args: Prisma.CustodialWalletCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>
          }
          createMany: {
            args: Prisma.CustodialWalletCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CustodialWalletCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>[]
          }
          delete: {
            args: Prisma.CustodialWalletDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>
          }
          update: {
            args: Prisma.CustodialWalletUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>
          }
          deleteMany: {
            args: Prisma.CustodialWalletDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CustodialWalletUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CustodialWalletUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>[]
          }
          upsert: {
            args: Prisma.CustodialWalletUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CustodialWalletPayload>
          }
          aggregate: {
            args: Prisma.CustodialWalletAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCustodialWallet>
          }
          groupBy: {
            args: Prisma.CustodialWalletGroupByArgs<ExtArgs>
            result: $Utils.Optional<CustodialWalletGroupByOutputType>[]
          }
          count: {
            args: Prisma.CustodialWalletCountArgs<ExtArgs>
            result: $Utils.Optional<CustodialWalletCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Wallet: {
        payload: Prisma.$WalletPayload<ExtArgs>
        fields: Prisma.WalletFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WalletFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WalletFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>
          }
          findFirst: {
            args: Prisma.WalletFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WalletFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>
          }
          findMany: {
            args: Prisma.WalletFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>[]
          }
          create: {
            args: Prisma.WalletCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>
          }
          createMany: {
            args: Prisma.WalletCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WalletCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>[]
          }
          delete: {
            args: Prisma.WalletDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>
          }
          update: {
            args: Prisma.WalletUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>
          }
          deleteMany: {
            args: Prisma.WalletDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WalletUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WalletUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>[]
          }
          upsert: {
            args: Prisma.WalletUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletPayload>
          }
          aggregate: {
            args: Prisma.WalletAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWallet>
          }
          groupBy: {
            args: Prisma.WalletGroupByArgs<ExtArgs>
            result: $Utils.Optional<WalletGroupByOutputType>[]
          }
          count: {
            args: Prisma.WalletCountArgs<ExtArgs>
            result: $Utils.Optional<WalletCountAggregateOutputType> | number
          }
        }
      }
      WalletTransaction: {
        payload: Prisma.$WalletTransactionPayload<ExtArgs>
        fields: Prisma.WalletTransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WalletTransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WalletTransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>
          }
          findFirst: {
            args: Prisma.WalletTransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WalletTransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>
          }
          findMany: {
            args: Prisma.WalletTransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>[]
          }
          create: {
            args: Prisma.WalletTransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>
          }
          createMany: {
            args: Prisma.WalletTransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WalletTransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>[]
          }
          delete: {
            args: Prisma.WalletTransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>
          }
          update: {
            args: Prisma.WalletTransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>
          }
          deleteMany: {
            args: Prisma.WalletTransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WalletTransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WalletTransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>[]
          }
          upsert: {
            args: Prisma.WalletTransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WalletTransactionPayload>
          }
          aggregate: {
            args: Prisma.WalletTransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWalletTransaction>
          }
          groupBy: {
            args: Prisma.WalletTransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<WalletTransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.WalletTransactionCountArgs<ExtArgs>
            result: $Utils.Optional<WalletTransactionCountAggregateOutputType> | number
          }
        }
      }
      Bet: {
        payload: Prisma.$BetPayload<ExtArgs>
        fields: Prisma.BetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          findFirst: {
            args: Prisma.BetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          findMany: {
            args: Prisma.BetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>[]
          }
          create: {
            args: Prisma.BetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          createMany: {
            args: Prisma.BetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>[]
          }
          delete: {
            args: Prisma.BetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          update: {
            args: Prisma.BetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          deleteMany: {
            args: Prisma.BetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BetUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>[]
          }
          upsert: {
            args: Prisma.BetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BetPayload>
          }
          aggregate: {
            args: Prisma.BetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBet>
          }
          groupBy: {
            args: Prisma.BetGroupByArgs<ExtArgs>
            result: $Utils.Optional<BetGroupByOutputType>[]
          }
          count: {
            args: Prisma.BetCountArgs<ExtArgs>
            result: $Utils.Optional<BetCountAggregateOutputType> | number
          }
        }
      }
      UserTask: {
        payload: Prisma.$UserTaskPayload<ExtArgs>
        fields: Prisma.UserTaskFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserTaskFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserTaskFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>
          }
          findFirst: {
            args: Prisma.UserTaskFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserTaskFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>
          }
          findMany: {
            args: Prisma.UserTaskFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>[]
          }
          create: {
            args: Prisma.UserTaskCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>
          }
          createMany: {
            args: Prisma.UserTaskCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserTaskCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>[]
          }
          delete: {
            args: Prisma.UserTaskDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>
          }
          update: {
            args: Prisma.UserTaskUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>
          }
          deleteMany: {
            args: Prisma.UserTaskDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserTaskUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserTaskUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>[]
          }
          upsert: {
            args: Prisma.UserTaskUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTaskPayload>
          }
          aggregate: {
            args: Prisma.UserTaskAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserTask>
          }
          groupBy: {
            args: Prisma.UserTaskGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTaskGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserTaskCountArgs<ExtArgs>
            result: $Utils.Optional<UserTaskCountAggregateOutputType> | number
          }
        }
      }
      Referral: {
        payload: Prisma.$ReferralPayload<ExtArgs>
        fields: Prisma.ReferralFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReferralFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReferralFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>
          }
          findFirst: {
            args: Prisma.ReferralFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReferralFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>
          }
          findMany: {
            args: Prisma.ReferralFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>[]
          }
          create: {
            args: Prisma.ReferralCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>
          }
          createMany: {
            args: Prisma.ReferralCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReferralCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>[]
          }
          delete: {
            args: Prisma.ReferralDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>
          }
          update: {
            args: Prisma.ReferralUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>
          }
          deleteMany: {
            args: Prisma.ReferralDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReferralUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReferralUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>[]
          }
          upsert: {
            args: Prisma.ReferralUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReferralPayload>
          }
          aggregate: {
            args: Prisma.ReferralAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReferral>
          }
          groupBy: {
            args: Prisma.ReferralGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReferralGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReferralCountArgs<ExtArgs>
            result: $Utils.Optional<ReferralCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    custodialWallet?: CustodialWalletOmit
    user?: UserOmit
    wallet?: WalletOmit
    walletTransaction?: WalletTransactionOmit
    bet?: BetOmit
    userTask?: UserTaskOmit
    referral?: ReferralOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CustodialWalletCountOutputType
   */

  export type CustodialWalletCountOutputType = {
    users: number
  }

  export type CustodialWalletCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | CustodialWalletCountOutputTypeCountUsersArgs
  }

  // Custom InputTypes
  /**
   * CustodialWalletCountOutputType without action
   */
  export type CustodialWalletCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWalletCountOutputType
     */
    select?: CustodialWalletCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CustodialWalletCountOutputType without action
   */
  export type CustodialWalletCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    bets: number
    userTasks: number
    referralsGiven: number
    referralsReceived: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bets?: boolean | UserCountOutputTypeCountBetsArgs
    userTasks?: boolean | UserCountOutputTypeCountUserTasksArgs
    referralsGiven?: boolean | UserCountOutputTypeCountReferralsGivenArgs
    referralsReceived?: boolean | UserCountOutputTypeCountReferralsReceivedArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountBetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BetWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountUserTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTaskWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReferralsGivenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReferralWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReferralsReceivedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReferralWhereInput
  }


  /**
   * Count Type WalletCountOutputType
   */

  export type WalletCountOutputType = {
    transactions: number
  }

  export type WalletCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transactions?: boolean | WalletCountOutputTypeCountTransactionsArgs
  }

  // Custom InputTypes
  /**
   * WalletCountOutputType without action
   */
  export type WalletCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletCountOutputType
     */
    select?: WalletCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WalletCountOutputType without action
   */
  export type WalletCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WalletTransactionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model CustodialWallet
   */

  export type AggregateCustodialWallet = {
    _count: CustodialWalletCountAggregateOutputType | null
    _min: CustodialWalletMinAggregateOutputType | null
    _max: CustodialWalletMaxAggregateOutputType | null
  }

  export type CustodialWalletMinAggregateOutputType = {
    id: string | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustodialWalletMaxAggregateOutputType = {
    id: string | null
    address: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CustodialWalletCountAggregateOutputType = {
    id: number
    address: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CustodialWalletMinAggregateInputType = {
    id?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustodialWalletMaxAggregateInputType = {
    id?: true
    address?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CustodialWalletCountAggregateInputType = {
    id?: true
    address?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CustodialWalletAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustodialWallet to aggregate.
     */
    where?: CustodialWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustodialWallets to fetch.
     */
    orderBy?: CustodialWalletOrderByWithRelationInput | CustodialWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CustodialWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustodialWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustodialWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CustodialWallets
    **/
    _count?: true | CustodialWalletCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CustodialWalletMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CustodialWalletMaxAggregateInputType
  }

  export type GetCustodialWalletAggregateType<T extends CustodialWalletAggregateArgs> = {
        [P in keyof T & keyof AggregateCustodialWallet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCustodialWallet[P]>
      : GetScalarType<T[P], AggregateCustodialWallet[P]>
  }




  export type CustodialWalletGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CustodialWalletWhereInput
    orderBy?: CustodialWalletOrderByWithAggregationInput | CustodialWalletOrderByWithAggregationInput[]
    by: CustodialWalletScalarFieldEnum[] | CustodialWalletScalarFieldEnum
    having?: CustodialWalletScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CustodialWalletCountAggregateInputType | true
    _min?: CustodialWalletMinAggregateInputType
    _max?: CustodialWalletMaxAggregateInputType
  }

  export type CustodialWalletGroupByOutputType = {
    id: string
    address: string
    createdAt: Date
    updatedAt: Date
    _count: CustodialWalletCountAggregateOutputType | null
    _min: CustodialWalletMinAggregateOutputType | null
    _max: CustodialWalletMaxAggregateOutputType | null
  }

  type GetCustodialWalletGroupByPayload<T extends CustodialWalletGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CustodialWalletGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CustodialWalletGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CustodialWalletGroupByOutputType[P]>
            : GetScalarType<T[P], CustodialWalletGroupByOutputType[P]>
        }
      >
    >


  export type CustodialWalletSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    wallet?: boolean | CustodialWallet$walletArgs<ExtArgs>
    users?: boolean | CustodialWallet$usersArgs<ExtArgs>
    _count?: boolean | CustodialWalletCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["custodialWallet"]>

  export type CustodialWalletSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["custodialWallet"]>

  export type CustodialWalletSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["custodialWallet"]>

  export type CustodialWalletSelectScalar = {
    id?: boolean
    address?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CustodialWalletOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "address" | "createdAt" | "updatedAt", ExtArgs["result"]["custodialWallet"]>
  export type CustodialWalletInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wallet?: boolean | CustodialWallet$walletArgs<ExtArgs>
    users?: boolean | CustodialWallet$usersArgs<ExtArgs>
    _count?: boolean | CustodialWalletCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CustodialWalletIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CustodialWalletIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CustodialWalletPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CustodialWallet"
    objects: {
      wallet: Prisma.$WalletPayload<ExtArgs> | null
      users: Prisma.$UserPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      address: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["custodialWallet"]>
    composites: {}
  }

  type CustodialWalletGetPayload<S extends boolean | null | undefined | CustodialWalletDefaultArgs> = $Result.GetResult<Prisma.$CustodialWalletPayload, S>

  type CustodialWalletCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CustodialWalletFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CustodialWalletCountAggregateInputType | true
    }

  export interface CustodialWalletDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CustodialWallet'], meta: { name: 'CustodialWallet' } }
    /**
     * Find zero or one CustodialWallet that matches the filter.
     * @param {CustodialWalletFindUniqueArgs} args - Arguments to find a CustodialWallet
     * @example
     * // Get one CustodialWallet
     * const custodialWallet = await prisma.custodialWallet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CustodialWalletFindUniqueArgs>(args: SelectSubset<T, CustodialWalletFindUniqueArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CustodialWallet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CustodialWalletFindUniqueOrThrowArgs} args - Arguments to find a CustodialWallet
     * @example
     * // Get one CustodialWallet
     * const custodialWallet = await prisma.custodialWallet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CustodialWalletFindUniqueOrThrowArgs>(args: SelectSubset<T, CustodialWalletFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustodialWallet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustodialWalletFindFirstArgs} args - Arguments to find a CustodialWallet
     * @example
     * // Get one CustodialWallet
     * const custodialWallet = await prisma.custodialWallet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CustodialWalletFindFirstArgs>(args?: SelectSubset<T, CustodialWalletFindFirstArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CustodialWallet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustodialWalletFindFirstOrThrowArgs} args - Arguments to find a CustodialWallet
     * @example
     * // Get one CustodialWallet
     * const custodialWallet = await prisma.custodialWallet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CustodialWalletFindFirstOrThrowArgs>(args?: SelectSubset<T, CustodialWalletFindFirstOrThrowArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CustodialWallets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustodialWalletFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CustodialWallets
     * const custodialWallets = await prisma.custodialWallet.findMany()
     * 
     * // Get first 10 CustodialWallets
     * const custodialWallets = await prisma.custodialWallet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const custodialWalletWithIdOnly = await prisma.custodialWallet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CustodialWalletFindManyArgs>(args?: SelectSubset<T, CustodialWalletFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CustodialWallet.
     * @param {CustodialWalletCreateArgs} args - Arguments to create a CustodialWallet.
     * @example
     * // Create one CustodialWallet
     * const CustodialWallet = await prisma.custodialWallet.create({
     *   data: {
     *     // ... data to create a CustodialWallet
     *   }
     * })
     * 
     */
    create<T extends CustodialWalletCreateArgs>(args: SelectSubset<T, CustodialWalletCreateArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CustodialWallets.
     * @param {CustodialWalletCreateManyArgs} args - Arguments to create many CustodialWallets.
     * @example
     * // Create many CustodialWallets
     * const custodialWallet = await prisma.custodialWallet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CustodialWalletCreateManyArgs>(args?: SelectSubset<T, CustodialWalletCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CustodialWallets and returns the data saved in the database.
     * @param {CustodialWalletCreateManyAndReturnArgs} args - Arguments to create many CustodialWallets.
     * @example
     * // Create many CustodialWallets
     * const custodialWallet = await prisma.custodialWallet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CustodialWallets and only return the `id`
     * const custodialWalletWithIdOnly = await prisma.custodialWallet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CustodialWalletCreateManyAndReturnArgs>(args?: SelectSubset<T, CustodialWalletCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CustodialWallet.
     * @param {CustodialWalletDeleteArgs} args - Arguments to delete one CustodialWallet.
     * @example
     * // Delete one CustodialWallet
     * const CustodialWallet = await prisma.custodialWallet.delete({
     *   where: {
     *     // ... filter to delete one CustodialWallet
     *   }
     * })
     * 
     */
    delete<T extends CustodialWalletDeleteArgs>(args: SelectSubset<T, CustodialWalletDeleteArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CustodialWallet.
     * @param {CustodialWalletUpdateArgs} args - Arguments to update one CustodialWallet.
     * @example
     * // Update one CustodialWallet
     * const custodialWallet = await prisma.custodialWallet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CustodialWalletUpdateArgs>(args: SelectSubset<T, CustodialWalletUpdateArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CustodialWallets.
     * @param {CustodialWalletDeleteManyArgs} args - Arguments to filter CustodialWallets to delete.
     * @example
     * // Delete a few CustodialWallets
     * const { count } = await prisma.custodialWallet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CustodialWalletDeleteManyArgs>(args?: SelectSubset<T, CustodialWalletDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustodialWallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustodialWalletUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CustodialWallets
     * const custodialWallet = await prisma.custodialWallet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CustodialWalletUpdateManyArgs>(args: SelectSubset<T, CustodialWalletUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CustodialWallets and returns the data updated in the database.
     * @param {CustodialWalletUpdateManyAndReturnArgs} args - Arguments to update many CustodialWallets.
     * @example
     * // Update many CustodialWallets
     * const custodialWallet = await prisma.custodialWallet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CustodialWallets and only return the `id`
     * const custodialWalletWithIdOnly = await prisma.custodialWallet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CustodialWalletUpdateManyAndReturnArgs>(args: SelectSubset<T, CustodialWalletUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CustodialWallet.
     * @param {CustodialWalletUpsertArgs} args - Arguments to update or create a CustodialWallet.
     * @example
     * // Update or create a CustodialWallet
     * const custodialWallet = await prisma.custodialWallet.upsert({
     *   create: {
     *     // ... data to create a CustodialWallet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CustodialWallet we want to update
     *   }
     * })
     */
    upsert<T extends CustodialWalletUpsertArgs>(args: SelectSubset<T, CustodialWalletUpsertArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CustodialWallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustodialWalletCountArgs} args - Arguments to filter CustodialWallets to count.
     * @example
     * // Count the number of CustodialWallets
     * const count = await prisma.custodialWallet.count({
     *   where: {
     *     // ... the filter for the CustodialWallets we want to count
     *   }
     * })
    **/
    count<T extends CustodialWalletCountArgs>(
      args?: Subset<T, CustodialWalletCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CustodialWalletCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CustodialWallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustodialWalletAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CustodialWalletAggregateArgs>(args: Subset<T, CustodialWalletAggregateArgs>): Prisma.PrismaPromise<GetCustodialWalletAggregateType<T>>

    /**
     * Group by CustodialWallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CustodialWalletGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CustodialWalletGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CustodialWalletGroupByArgs['orderBy'] }
        : { orderBy?: CustodialWalletGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CustodialWalletGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCustodialWalletGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CustodialWallet model
   */
  readonly fields: CustodialWalletFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CustodialWallet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CustodialWalletClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    wallet<T extends CustodialWallet$walletArgs<ExtArgs> = {}>(args?: Subset<T, CustodialWallet$walletArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    users<T extends CustodialWallet$usersArgs<ExtArgs> = {}>(args?: Subset<T, CustodialWallet$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CustodialWallet model
   */
  interface CustodialWalletFieldRefs {
    readonly id: FieldRef<"CustodialWallet", 'String'>
    readonly address: FieldRef<"CustodialWallet", 'String'>
    readonly createdAt: FieldRef<"CustodialWallet", 'DateTime'>
    readonly updatedAt: FieldRef<"CustodialWallet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CustodialWallet findUnique
   */
  export type CustodialWalletFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * Filter, which CustodialWallet to fetch.
     */
    where: CustodialWalletWhereUniqueInput
  }

  /**
   * CustodialWallet findUniqueOrThrow
   */
  export type CustodialWalletFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * Filter, which CustodialWallet to fetch.
     */
    where: CustodialWalletWhereUniqueInput
  }

  /**
   * CustodialWallet findFirst
   */
  export type CustodialWalletFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * Filter, which CustodialWallet to fetch.
     */
    where?: CustodialWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustodialWallets to fetch.
     */
    orderBy?: CustodialWalletOrderByWithRelationInput | CustodialWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustodialWallets.
     */
    cursor?: CustodialWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustodialWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustodialWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustodialWallets.
     */
    distinct?: CustodialWalletScalarFieldEnum | CustodialWalletScalarFieldEnum[]
  }

  /**
   * CustodialWallet findFirstOrThrow
   */
  export type CustodialWalletFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * Filter, which CustodialWallet to fetch.
     */
    where?: CustodialWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustodialWallets to fetch.
     */
    orderBy?: CustodialWalletOrderByWithRelationInput | CustodialWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CustodialWallets.
     */
    cursor?: CustodialWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustodialWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustodialWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CustodialWallets.
     */
    distinct?: CustodialWalletScalarFieldEnum | CustodialWalletScalarFieldEnum[]
  }

  /**
   * CustodialWallet findMany
   */
  export type CustodialWalletFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * Filter, which CustodialWallets to fetch.
     */
    where?: CustodialWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CustodialWallets to fetch.
     */
    orderBy?: CustodialWalletOrderByWithRelationInput | CustodialWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CustodialWallets.
     */
    cursor?: CustodialWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CustodialWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CustodialWallets.
     */
    skip?: number
    distinct?: CustodialWalletScalarFieldEnum | CustodialWalletScalarFieldEnum[]
  }

  /**
   * CustodialWallet create
   */
  export type CustodialWalletCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * The data needed to create a CustodialWallet.
     */
    data: XOR<CustodialWalletCreateInput, CustodialWalletUncheckedCreateInput>
  }

  /**
   * CustodialWallet createMany
   */
  export type CustodialWalletCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CustodialWallets.
     */
    data: CustodialWalletCreateManyInput | CustodialWalletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustodialWallet createManyAndReturn
   */
  export type CustodialWalletCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * The data used to create many CustodialWallets.
     */
    data: CustodialWalletCreateManyInput | CustodialWalletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CustodialWallet update
   */
  export type CustodialWalletUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * The data needed to update a CustodialWallet.
     */
    data: XOR<CustodialWalletUpdateInput, CustodialWalletUncheckedUpdateInput>
    /**
     * Choose, which CustodialWallet to update.
     */
    where: CustodialWalletWhereUniqueInput
  }

  /**
   * CustodialWallet updateMany
   */
  export type CustodialWalletUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CustodialWallets.
     */
    data: XOR<CustodialWalletUpdateManyMutationInput, CustodialWalletUncheckedUpdateManyInput>
    /**
     * Filter which CustodialWallets to update
     */
    where?: CustodialWalletWhereInput
    /**
     * Limit how many CustodialWallets to update.
     */
    limit?: number
  }

  /**
   * CustodialWallet updateManyAndReturn
   */
  export type CustodialWalletUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * The data used to update CustodialWallets.
     */
    data: XOR<CustodialWalletUpdateManyMutationInput, CustodialWalletUncheckedUpdateManyInput>
    /**
     * Filter which CustodialWallets to update
     */
    where?: CustodialWalletWhereInput
    /**
     * Limit how many CustodialWallets to update.
     */
    limit?: number
  }

  /**
   * CustodialWallet upsert
   */
  export type CustodialWalletUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * The filter to search for the CustodialWallet to update in case it exists.
     */
    where: CustodialWalletWhereUniqueInput
    /**
     * In case the CustodialWallet found by the `where` argument doesn't exist, create a new CustodialWallet with this data.
     */
    create: XOR<CustodialWalletCreateInput, CustodialWalletUncheckedCreateInput>
    /**
     * In case the CustodialWallet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CustodialWalletUpdateInput, CustodialWalletUncheckedUpdateInput>
  }

  /**
   * CustodialWallet delete
   */
  export type CustodialWalletDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
    /**
     * Filter which CustodialWallet to delete.
     */
    where: CustodialWalletWhereUniqueInput
  }

  /**
   * CustodialWallet deleteMany
   */
  export type CustodialWalletDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CustodialWallets to delete
     */
    where?: CustodialWalletWhereInput
    /**
     * Limit how many CustodialWallets to delete.
     */
    limit?: number
  }

  /**
   * CustodialWallet.wallet
   */
  export type CustodialWallet$walletArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    where?: WalletWhereInput
  }

  /**
   * CustodialWallet.users
   */
  export type CustodialWallet$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * CustodialWallet without action
   */
  export type CustodialWalletDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustodialWallet
     */
    select?: CustodialWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CustodialWallet
     */
    omit?: CustodialWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CustodialWalletInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    totalPoints: number | null
  }

  export type UserSumAggregateOutputType = {
    totalPoints: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    wallet_address: string | null
    custodial_wallet_id: string | null
    sessionId: string | null
    siwe_message: string | null
    siwe_signature: string | null
    siwe_expires_at: Date | null
    totalPoints: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    wallet_address: string | null
    custodial_wallet_id: string | null
    sessionId: string | null
    siwe_message: string | null
    siwe_signature: string | null
    siwe_expires_at: Date | null
    totalPoints: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    wallet_address: number
    custodial_wallet_id: number
    sessionId: number
    siwe_message: number
    siwe_signature: number
    siwe_expires_at: number
    totalPoints: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    totalPoints?: true
  }

  export type UserSumAggregateInputType = {
    totalPoints?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    wallet_address?: true
    custodial_wallet_id?: true
    sessionId?: true
    siwe_message?: true
    siwe_signature?: true
    siwe_expires_at?: true
    totalPoints?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    wallet_address?: true
    custodial_wallet_id?: true
    sessionId?: true
    siwe_message?: true
    siwe_signature?: true
    siwe_expires_at?: true
    totalPoints?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    wallet_address?: true
    custodial_wallet_id?: true
    sessionId?: true
    siwe_message?: true
    siwe_signature?: true
    siwe_expires_at?: true
    totalPoints?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    wallet_address: string
    custodial_wallet_id: string
    sessionId: string | null
    siwe_message: string | null
    siwe_signature: string | null
    siwe_expires_at: Date | null
    totalPoints: number
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet_address?: boolean
    custodial_wallet_id?: boolean
    sessionId?: boolean
    siwe_message?: boolean
    siwe_signature?: boolean
    siwe_expires_at?: boolean
    totalPoints?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
    bets?: boolean | User$betsArgs<ExtArgs>
    userTasks?: boolean | User$userTasksArgs<ExtArgs>
    referralsGiven?: boolean | User$referralsGivenArgs<ExtArgs>
    referralsReceived?: boolean | User$referralsReceivedArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet_address?: boolean
    custodial_wallet_id?: boolean
    sessionId?: boolean
    siwe_message?: boolean
    siwe_signature?: boolean
    siwe_expires_at?: boolean
    totalPoints?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wallet_address?: boolean
    custodial_wallet_id?: boolean
    sessionId?: boolean
    siwe_message?: boolean
    siwe_signature?: boolean
    siwe_expires_at?: boolean
    totalPoints?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    wallet_address?: boolean
    custodial_wallet_id?: boolean
    sessionId?: boolean
    siwe_message?: boolean
    siwe_signature?: boolean
    siwe_expires_at?: boolean
    totalPoints?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "wallet_address" | "custodial_wallet_id" | "sessionId" | "siwe_message" | "siwe_signature" | "siwe_expires_at" | "totalPoints" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
    bets?: boolean | User$betsArgs<ExtArgs>
    userTasks?: boolean | User$userTasksArgs<ExtArgs>
    referralsGiven?: boolean | User$referralsGivenArgs<ExtArgs>
    referralsReceived?: boolean | User$referralsReceivedArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      custodialWallet: Prisma.$CustodialWalletPayload<ExtArgs>
      bets: Prisma.$BetPayload<ExtArgs>[]
      userTasks: Prisma.$UserTaskPayload<ExtArgs>[]
      referralsGiven: Prisma.$ReferralPayload<ExtArgs>[]
      referralsReceived: Prisma.$ReferralPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      wallet_address: string
      custodial_wallet_id: string
      sessionId: string | null
      siwe_message: string | null
      siwe_signature: string | null
      siwe_expires_at: Date | null
      totalPoints: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    custodialWallet<T extends CustodialWalletDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustodialWalletDefaultArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    bets<T extends User$betsArgs<ExtArgs> = {}>(args?: Subset<T, User$betsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    userTasks<T extends User$userTasksArgs<ExtArgs> = {}>(args?: Subset<T, User$userTasksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    referralsGiven<T extends User$referralsGivenArgs<ExtArgs> = {}>(args?: Subset<T, User$referralsGivenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    referralsReceived<T extends User$referralsReceivedArgs<ExtArgs> = {}>(args?: Subset<T, User$referralsReceivedArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly wallet_address: FieldRef<"User", 'String'>
    readonly custodial_wallet_id: FieldRef<"User", 'String'>
    readonly sessionId: FieldRef<"User", 'String'>
    readonly siwe_message: FieldRef<"User", 'String'>
    readonly siwe_signature: FieldRef<"User", 'String'>
    readonly siwe_expires_at: FieldRef<"User", 'DateTime'>
    readonly totalPoints: FieldRef<"User", 'Int'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.bets
   */
  export type User$betsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    where?: BetWhereInput
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    cursor?: BetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * User.userTasks
   */
  export type User$userTasksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    where?: UserTaskWhereInput
    orderBy?: UserTaskOrderByWithRelationInput | UserTaskOrderByWithRelationInput[]
    cursor?: UserTaskWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserTaskScalarFieldEnum | UserTaskScalarFieldEnum[]
  }

  /**
   * User.referralsGiven
   */
  export type User$referralsGivenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    where?: ReferralWhereInput
    orderBy?: ReferralOrderByWithRelationInput | ReferralOrderByWithRelationInput[]
    cursor?: ReferralWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReferralScalarFieldEnum | ReferralScalarFieldEnum[]
  }

  /**
   * User.referralsReceived
   */
  export type User$referralsReceivedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    where?: ReferralWhereInput
    orderBy?: ReferralOrderByWithRelationInput | ReferralOrderByWithRelationInput[]
    cursor?: ReferralWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReferralScalarFieldEnum | ReferralScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Wallet
   */

  export type AggregateWallet = {
    _count: WalletCountAggregateOutputType | null
    _avg: WalletAvgAggregateOutputType | null
    _sum: WalletSumAggregateOutputType | null
    _min: WalletMinAggregateOutputType | null
    _max: WalletMaxAggregateOutputType | null
  }

  export type WalletAvgAggregateOutputType = {
    createdAt: number | null
    lastUsed: number | null
  }

  export type WalletSumAggregateOutputType = {
    createdAt: bigint | null
    lastUsed: bigint | null
  }

  export type WalletMinAggregateOutputType = {
    custodialWalletId: string | null
    address: string | null
    encryptedPrivateKey: string | null
    createdAt: bigint | null
    balance: string | null
    lockedBalance: string | null
    lastUsed: bigint | null
    createdAtTimestamp: Date | null
    updatedAt: Date | null
  }

  export type WalletMaxAggregateOutputType = {
    custodialWalletId: string | null
    address: string | null
    encryptedPrivateKey: string | null
    createdAt: bigint | null
    balance: string | null
    lockedBalance: string | null
    lastUsed: bigint | null
    createdAtTimestamp: Date | null
    updatedAt: Date | null
  }

  export type WalletCountAggregateOutputType = {
    custodialWalletId: number
    address: number
    encryptedPrivateKey: number
    createdAt: number
    balance: number
    lockedBalance: number
    lastUsed: number
    createdAtTimestamp: number
    updatedAt: number
    _all: number
  }


  export type WalletAvgAggregateInputType = {
    createdAt?: true
    lastUsed?: true
  }

  export type WalletSumAggregateInputType = {
    createdAt?: true
    lastUsed?: true
  }

  export type WalletMinAggregateInputType = {
    custodialWalletId?: true
    address?: true
    encryptedPrivateKey?: true
    createdAt?: true
    balance?: true
    lockedBalance?: true
    lastUsed?: true
    createdAtTimestamp?: true
    updatedAt?: true
  }

  export type WalletMaxAggregateInputType = {
    custodialWalletId?: true
    address?: true
    encryptedPrivateKey?: true
    createdAt?: true
    balance?: true
    lockedBalance?: true
    lastUsed?: true
    createdAtTimestamp?: true
    updatedAt?: true
  }

  export type WalletCountAggregateInputType = {
    custodialWalletId?: true
    address?: true
    encryptedPrivateKey?: true
    createdAt?: true
    balance?: true
    lockedBalance?: true
    lastUsed?: true
    createdAtTimestamp?: true
    updatedAt?: true
    _all?: true
  }

  export type WalletAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Wallet to aggregate.
     */
    where?: WalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wallets to fetch.
     */
    orderBy?: WalletOrderByWithRelationInput | WalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Wallets
    **/
    _count?: true | WalletCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WalletAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WalletSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WalletMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WalletMaxAggregateInputType
  }

  export type GetWalletAggregateType<T extends WalletAggregateArgs> = {
        [P in keyof T & keyof AggregateWallet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWallet[P]>
      : GetScalarType<T[P], AggregateWallet[P]>
  }




  export type WalletGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WalletWhereInput
    orderBy?: WalletOrderByWithAggregationInput | WalletOrderByWithAggregationInput[]
    by: WalletScalarFieldEnum[] | WalletScalarFieldEnum
    having?: WalletScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WalletCountAggregateInputType | true
    _avg?: WalletAvgAggregateInputType
    _sum?: WalletSumAggregateInputType
    _min?: WalletMinAggregateInputType
    _max?: WalletMaxAggregateInputType
  }

  export type WalletGroupByOutputType = {
    custodialWalletId: string
    address: string
    encryptedPrivateKey: string
    createdAt: bigint
    balance: string
    lockedBalance: string
    lastUsed: bigint | null
    createdAtTimestamp: Date
    updatedAt: Date
    _count: WalletCountAggregateOutputType | null
    _avg: WalletAvgAggregateOutputType | null
    _sum: WalletSumAggregateOutputType | null
    _min: WalletMinAggregateOutputType | null
    _max: WalletMaxAggregateOutputType | null
  }

  type GetWalletGroupByPayload<T extends WalletGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WalletGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WalletGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WalletGroupByOutputType[P]>
            : GetScalarType<T[P], WalletGroupByOutputType[P]>
        }
      >
    >


  export type WalletSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    custodialWalletId?: boolean
    address?: boolean
    encryptedPrivateKey?: boolean
    createdAt?: boolean
    balance?: boolean
    lockedBalance?: boolean
    lastUsed?: boolean
    createdAtTimestamp?: boolean
    updatedAt?: boolean
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
    transactions?: boolean | Wallet$transactionsArgs<ExtArgs>
    _count?: boolean | WalletCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wallet"]>

  export type WalletSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    custodialWalletId?: boolean
    address?: boolean
    encryptedPrivateKey?: boolean
    createdAt?: boolean
    balance?: boolean
    lockedBalance?: boolean
    lastUsed?: boolean
    createdAtTimestamp?: boolean
    updatedAt?: boolean
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wallet"]>

  export type WalletSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    custodialWalletId?: boolean
    address?: boolean
    encryptedPrivateKey?: boolean
    createdAt?: boolean
    balance?: boolean
    lockedBalance?: boolean
    lastUsed?: boolean
    createdAtTimestamp?: boolean
    updatedAt?: boolean
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["wallet"]>

  export type WalletSelectScalar = {
    custodialWalletId?: boolean
    address?: boolean
    encryptedPrivateKey?: boolean
    createdAt?: boolean
    balance?: boolean
    lockedBalance?: boolean
    lastUsed?: boolean
    createdAtTimestamp?: boolean
    updatedAt?: boolean
  }

  export type WalletOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"custodialWalletId" | "address" | "encryptedPrivateKey" | "createdAt" | "balance" | "lockedBalance" | "lastUsed" | "createdAtTimestamp" | "updatedAt", ExtArgs["result"]["wallet"]>
  export type WalletInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
    transactions?: boolean | Wallet$transactionsArgs<ExtArgs>
    _count?: boolean | WalletCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WalletIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }
  export type WalletIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    custodialWallet?: boolean | CustodialWalletDefaultArgs<ExtArgs>
  }

  export type $WalletPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Wallet"
    objects: {
      custodialWallet: Prisma.$CustodialWalletPayload<ExtArgs>
      transactions: Prisma.$WalletTransactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      custodialWalletId: string
      address: string
      encryptedPrivateKey: string
      createdAt: bigint
      balance: string
      lockedBalance: string
      lastUsed: bigint | null
      createdAtTimestamp: Date
      updatedAt: Date
    }, ExtArgs["result"]["wallet"]>
    composites: {}
  }

  type WalletGetPayload<S extends boolean | null | undefined | WalletDefaultArgs> = $Result.GetResult<Prisma.$WalletPayload, S>

  type WalletCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WalletFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WalletCountAggregateInputType | true
    }

  export interface WalletDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Wallet'], meta: { name: 'Wallet' } }
    /**
     * Find zero or one Wallet that matches the filter.
     * @param {WalletFindUniqueArgs} args - Arguments to find a Wallet
     * @example
     * // Get one Wallet
     * const wallet = await prisma.wallet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WalletFindUniqueArgs>(args: SelectSubset<T, WalletFindUniqueArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Wallet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WalletFindUniqueOrThrowArgs} args - Arguments to find a Wallet
     * @example
     * // Get one Wallet
     * const wallet = await prisma.wallet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WalletFindUniqueOrThrowArgs>(args: SelectSubset<T, WalletFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Wallet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletFindFirstArgs} args - Arguments to find a Wallet
     * @example
     * // Get one Wallet
     * const wallet = await prisma.wallet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WalletFindFirstArgs>(args?: SelectSubset<T, WalletFindFirstArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Wallet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletFindFirstOrThrowArgs} args - Arguments to find a Wallet
     * @example
     * // Get one Wallet
     * const wallet = await prisma.wallet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WalletFindFirstOrThrowArgs>(args?: SelectSubset<T, WalletFindFirstOrThrowArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Wallets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Wallets
     * const wallets = await prisma.wallet.findMany()
     * 
     * // Get first 10 Wallets
     * const wallets = await prisma.wallet.findMany({ take: 10 })
     * 
     * // Only select the `custodialWalletId`
     * const walletWithCustodialWalletIdOnly = await prisma.wallet.findMany({ select: { custodialWalletId: true } })
     * 
     */
    findMany<T extends WalletFindManyArgs>(args?: SelectSubset<T, WalletFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Wallet.
     * @param {WalletCreateArgs} args - Arguments to create a Wallet.
     * @example
     * // Create one Wallet
     * const Wallet = await prisma.wallet.create({
     *   data: {
     *     // ... data to create a Wallet
     *   }
     * })
     * 
     */
    create<T extends WalletCreateArgs>(args: SelectSubset<T, WalletCreateArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Wallets.
     * @param {WalletCreateManyArgs} args - Arguments to create many Wallets.
     * @example
     * // Create many Wallets
     * const wallet = await prisma.wallet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WalletCreateManyArgs>(args?: SelectSubset<T, WalletCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Wallets and returns the data saved in the database.
     * @param {WalletCreateManyAndReturnArgs} args - Arguments to create many Wallets.
     * @example
     * // Create many Wallets
     * const wallet = await prisma.wallet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Wallets and only return the `custodialWalletId`
     * const walletWithCustodialWalletIdOnly = await prisma.wallet.createManyAndReturn({
     *   select: { custodialWalletId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WalletCreateManyAndReturnArgs>(args?: SelectSubset<T, WalletCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Wallet.
     * @param {WalletDeleteArgs} args - Arguments to delete one Wallet.
     * @example
     * // Delete one Wallet
     * const Wallet = await prisma.wallet.delete({
     *   where: {
     *     // ... filter to delete one Wallet
     *   }
     * })
     * 
     */
    delete<T extends WalletDeleteArgs>(args: SelectSubset<T, WalletDeleteArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Wallet.
     * @param {WalletUpdateArgs} args - Arguments to update one Wallet.
     * @example
     * // Update one Wallet
     * const wallet = await prisma.wallet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WalletUpdateArgs>(args: SelectSubset<T, WalletUpdateArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Wallets.
     * @param {WalletDeleteManyArgs} args - Arguments to filter Wallets to delete.
     * @example
     * // Delete a few Wallets
     * const { count } = await prisma.wallet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WalletDeleteManyArgs>(args?: SelectSubset<T, WalletDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Wallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Wallets
     * const wallet = await prisma.wallet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WalletUpdateManyArgs>(args: SelectSubset<T, WalletUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Wallets and returns the data updated in the database.
     * @param {WalletUpdateManyAndReturnArgs} args - Arguments to update many Wallets.
     * @example
     * // Update many Wallets
     * const wallet = await prisma.wallet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Wallets and only return the `custodialWalletId`
     * const walletWithCustodialWalletIdOnly = await prisma.wallet.updateManyAndReturn({
     *   select: { custodialWalletId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WalletUpdateManyAndReturnArgs>(args: SelectSubset<T, WalletUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Wallet.
     * @param {WalletUpsertArgs} args - Arguments to update or create a Wallet.
     * @example
     * // Update or create a Wallet
     * const wallet = await prisma.wallet.upsert({
     *   create: {
     *     // ... data to create a Wallet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Wallet we want to update
     *   }
     * })
     */
    upsert<T extends WalletUpsertArgs>(args: SelectSubset<T, WalletUpsertArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Wallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletCountArgs} args - Arguments to filter Wallets to count.
     * @example
     * // Count the number of Wallets
     * const count = await prisma.wallet.count({
     *   where: {
     *     // ... the filter for the Wallets we want to count
     *   }
     * })
    **/
    count<T extends WalletCountArgs>(
      args?: Subset<T, WalletCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WalletCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Wallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WalletAggregateArgs>(args: Subset<T, WalletAggregateArgs>): Prisma.PrismaPromise<GetWalletAggregateType<T>>

    /**
     * Group by Wallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WalletGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WalletGroupByArgs['orderBy'] }
        : { orderBy?: WalletGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WalletGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWalletGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Wallet model
   */
  readonly fields: WalletFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Wallet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WalletClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    custodialWallet<T extends CustodialWalletDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CustodialWalletDefaultArgs<ExtArgs>>): Prisma__CustodialWalletClient<$Result.GetResult<Prisma.$CustodialWalletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    transactions<T extends Wallet$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, Wallet$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Wallet model
   */
  interface WalletFieldRefs {
    readonly custodialWalletId: FieldRef<"Wallet", 'String'>
    readonly address: FieldRef<"Wallet", 'String'>
    readonly encryptedPrivateKey: FieldRef<"Wallet", 'String'>
    readonly createdAt: FieldRef<"Wallet", 'BigInt'>
    readonly balance: FieldRef<"Wallet", 'String'>
    readonly lockedBalance: FieldRef<"Wallet", 'String'>
    readonly lastUsed: FieldRef<"Wallet", 'BigInt'>
    readonly createdAtTimestamp: FieldRef<"Wallet", 'DateTime'>
    readonly updatedAt: FieldRef<"Wallet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Wallet findUnique
   */
  export type WalletFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * Filter, which Wallet to fetch.
     */
    where: WalletWhereUniqueInput
  }

  /**
   * Wallet findUniqueOrThrow
   */
  export type WalletFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * Filter, which Wallet to fetch.
     */
    where: WalletWhereUniqueInput
  }

  /**
   * Wallet findFirst
   */
  export type WalletFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * Filter, which Wallet to fetch.
     */
    where?: WalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wallets to fetch.
     */
    orderBy?: WalletOrderByWithRelationInput | WalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Wallets.
     */
    cursor?: WalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Wallets.
     */
    distinct?: WalletScalarFieldEnum | WalletScalarFieldEnum[]
  }

  /**
   * Wallet findFirstOrThrow
   */
  export type WalletFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * Filter, which Wallet to fetch.
     */
    where?: WalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wallets to fetch.
     */
    orderBy?: WalletOrderByWithRelationInput | WalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Wallets.
     */
    cursor?: WalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Wallets.
     */
    distinct?: WalletScalarFieldEnum | WalletScalarFieldEnum[]
  }

  /**
   * Wallet findMany
   */
  export type WalletFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * Filter, which Wallets to fetch.
     */
    where?: WalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Wallets to fetch.
     */
    orderBy?: WalletOrderByWithRelationInput | WalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Wallets.
     */
    cursor?: WalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Wallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Wallets.
     */
    skip?: number
    distinct?: WalletScalarFieldEnum | WalletScalarFieldEnum[]
  }

  /**
   * Wallet create
   */
  export type WalletCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * The data needed to create a Wallet.
     */
    data: XOR<WalletCreateInput, WalletUncheckedCreateInput>
  }

  /**
   * Wallet createMany
   */
  export type WalletCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Wallets.
     */
    data: WalletCreateManyInput | WalletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Wallet createManyAndReturn
   */
  export type WalletCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * The data used to create many Wallets.
     */
    data: WalletCreateManyInput | WalletCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Wallet update
   */
  export type WalletUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * The data needed to update a Wallet.
     */
    data: XOR<WalletUpdateInput, WalletUncheckedUpdateInput>
    /**
     * Choose, which Wallet to update.
     */
    where: WalletWhereUniqueInput
  }

  /**
   * Wallet updateMany
   */
  export type WalletUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Wallets.
     */
    data: XOR<WalletUpdateManyMutationInput, WalletUncheckedUpdateManyInput>
    /**
     * Filter which Wallets to update
     */
    where?: WalletWhereInput
    /**
     * Limit how many Wallets to update.
     */
    limit?: number
  }

  /**
   * Wallet updateManyAndReturn
   */
  export type WalletUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * The data used to update Wallets.
     */
    data: XOR<WalletUpdateManyMutationInput, WalletUncheckedUpdateManyInput>
    /**
     * Filter which Wallets to update
     */
    where?: WalletWhereInput
    /**
     * Limit how many Wallets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Wallet upsert
   */
  export type WalletUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * The filter to search for the Wallet to update in case it exists.
     */
    where: WalletWhereUniqueInput
    /**
     * In case the Wallet found by the `where` argument doesn't exist, create a new Wallet with this data.
     */
    create: XOR<WalletCreateInput, WalletUncheckedCreateInput>
    /**
     * In case the Wallet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WalletUpdateInput, WalletUncheckedUpdateInput>
  }

  /**
   * Wallet delete
   */
  export type WalletDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
    /**
     * Filter which Wallet to delete.
     */
    where: WalletWhereUniqueInput
  }

  /**
   * Wallet deleteMany
   */
  export type WalletDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Wallets to delete
     */
    where?: WalletWhereInput
    /**
     * Limit how many Wallets to delete.
     */
    limit?: number
  }

  /**
   * Wallet.transactions
   */
  export type Wallet$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    where?: WalletTransactionWhereInput
    orderBy?: WalletTransactionOrderByWithRelationInput | WalletTransactionOrderByWithRelationInput[]
    cursor?: WalletTransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WalletTransactionScalarFieldEnum | WalletTransactionScalarFieldEnum[]
  }

  /**
   * Wallet without action
   */
  export type WalletDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Wallet
     */
    select?: WalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Wallet
     */
    omit?: WalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletInclude<ExtArgs> | null
  }


  /**
   * Model WalletTransaction
   */

  export type AggregateWalletTransaction = {
    _count: WalletTransactionCountAggregateOutputType | null
    _avg: WalletTransactionAvgAggregateOutputType | null
    _sum: WalletTransactionSumAggregateOutputType | null
    _min: WalletTransactionMinAggregateOutputType | null
    _max: WalletTransactionMaxAggregateOutputType | null
  }

  export type WalletTransactionAvgAggregateOutputType = {
    id: number | null
    blockNumber: number | null
  }

  export type WalletTransactionSumAggregateOutputType = {
    id: number | null
    blockNumber: bigint | null
  }

  export type WalletTransactionMinAggregateOutputType = {
    id: number | null
    custodialWalletId: string | null
    txHash: string | null
    txType: string | null
    amount: string | null
    status: string | null
    blockNumber: bigint | null
    gasUsed: string | null
    createdAt: Date | null
    confirmedAt: Date | null
  }

  export type WalletTransactionMaxAggregateOutputType = {
    id: number | null
    custodialWalletId: string | null
    txHash: string | null
    txType: string | null
    amount: string | null
    status: string | null
    blockNumber: bigint | null
    gasUsed: string | null
    createdAt: Date | null
    confirmedAt: Date | null
  }

  export type WalletTransactionCountAggregateOutputType = {
    id: number
    custodialWalletId: number
    txHash: number
    txType: number
    amount: number
    status: number
    blockNumber: number
    gasUsed: number
    createdAt: number
    confirmedAt: number
    _all: number
  }


  export type WalletTransactionAvgAggregateInputType = {
    id?: true
    blockNumber?: true
  }

  export type WalletTransactionSumAggregateInputType = {
    id?: true
    blockNumber?: true
  }

  export type WalletTransactionMinAggregateInputType = {
    id?: true
    custodialWalletId?: true
    txHash?: true
    txType?: true
    amount?: true
    status?: true
    blockNumber?: true
    gasUsed?: true
    createdAt?: true
    confirmedAt?: true
  }

  export type WalletTransactionMaxAggregateInputType = {
    id?: true
    custodialWalletId?: true
    txHash?: true
    txType?: true
    amount?: true
    status?: true
    blockNumber?: true
    gasUsed?: true
    createdAt?: true
    confirmedAt?: true
  }

  export type WalletTransactionCountAggregateInputType = {
    id?: true
    custodialWalletId?: true
    txHash?: true
    txType?: true
    amount?: true
    status?: true
    blockNumber?: true
    gasUsed?: true
    createdAt?: true
    confirmedAt?: true
    _all?: true
  }

  export type WalletTransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WalletTransaction to aggregate.
     */
    where?: WalletTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WalletTransactions to fetch.
     */
    orderBy?: WalletTransactionOrderByWithRelationInput | WalletTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WalletTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WalletTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WalletTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WalletTransactions
    **/
    _count?: true | WalletTransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WalletTransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WalletTransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WalletTransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WalletTransactionMaxAggregateInputType
  }

  export type GetWalletTransactionAggregateType<T extends WalletTransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateWalletTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWalletTransaction[P]>
      : GetScalarType<T[P], AggregateWalletTransaction[P]>
  }




  export type WalletTransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WalletTransactionWhereInput
    orderBy?: WalletTransactionOrderByWithAggregationInput | WalletTransactionOrderByWithAggregationInput[]
    by: WalletTransactionScalarFieldEnum[] | WalletTransactionScalarFieldEnum
    having?: WalletTransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WalletTransactionCountAggregateInputType | true
    _avg?: WalletTransactionAvgAggregateInputType
    _sum?: WalletTransactionSumAggregateInputType
    _min?: WalletTransactionMinAggregateInputType
    _max?: WalletTransactionMaxAggregateInputType
  }

  export type WalletTransactionGroupByOutputType = {
    id: number
    custodialWalletId: string
    txHash: string | null
    txType: string
    amount: string
    status: string
    blockNumber: bigint | null
    gasUsed: string | null
    createdAt: Date
    confirmedAt: Date | null
    _count: WalletTransactionCountAggregateOutputType | null
    _avg: WalletTransactionAvgAggregateOutputType | null
    _sum: WalletTransactionSumAggregateOutputType | null
    _min: WalletTransactionMinAggregateOutputType | null
    _max: WalletTransactionMaxAggregateOutputType | null
  }

  type GetWalletTransactionGroupByPayload<T extends WalletTransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WalletTransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WalletTransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WalletTransactionGroupByOutputType[P]>
            : GetScalarType<T[P], WalletTransactionGroupByOutputType[P]>
        }
      >
    >


  export type WalletTransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    custodialWalletId?: boolean
    txHash?: boolean
    txType?: boolean
    amount?: boolean
    status?: boolean
    blockNumber?: boolean
    gasUsed?: boolean
    createdAt?: boolean
    confirmedAt?: boolean
    wallet?: boolean | WalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["walletTransaction"]>

  export type WalletTransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    custodialWalletId?: boolean
    txHash?: boolean
    txType?: boolean
    amount?: boolean
    status?: boolean
    blockNumber?: boolean
    gasUsed?: boolean
    createdAt?: boolean
    confirmedAt?: boolean
    wallet?: boolean | WalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["walletTransaction"]>

  export type WalletTransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    custodialWalletId?: boolean
    txHash?: boolean
    txType?: boolean
    amount?: boolean
    status?: boolean
    blockNumber?: boolean
    gasUsed?: boolean
    createdAt?: boolean
    confirmedAt?: boolean
    wallet?: boolean | WalletDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["walletTransaction"]>

  export type WalletTransactionSelectScalar = {
    id?: boolean
    custodialWalletId?: boolean
    txHash?: boolean
    txType?: boolean
    amount?: boolean
    status?: boolean
    blockNumber?: boolean
    gasUsed?: boolean
    createdAt?: boolean
    confirmedAt?: boolean
  }

  export type WalletTransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "custodialWalletId" | "txHash" | "txType" | "amount" | "status" | "blockNumber" | "gasUsed" | "createdAt" | "confirmedAt", ExtArgs["result"]["walletTransaction"]>
  export type WalletTransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wallet?: boolean | WalletDefaultArgs<ExtArgs>
  }
  export type WalletTransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wallet?: boolean | WalletDefaultArgs<ExtArgs>
  }
  export type WalletTransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    wallet?: boolean | WalletDefaultArgs<ExtArgs>
  }

  export type $WalletTransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WalletTransaction"
    objects: {
      wallet: Prisma.$WalletPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      custodialWalletId: string
      txHash: string | null
      txType: string
      amount: string
      status: string
      blockNumber: bigint | null
      gasUsed: string | null
      createdAt: Date
      confirmedAt: Date | null
    }, ExtArgs["result"]["walletTransaction"]>
    composites: {}
  }

  type WalletTransactionGetPayload<S extends boolean | null | undefined | WalletTransactionDefaultArgs> = $Result.GetResult<Prisma.$WalletTransactionPayload, S>

  type WalletTransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WalletTransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WalletTransactionCountAggregateInputType | true
    }

  export interface WalletTransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WalletTransaction'], meta: { name: 'WalletTransaction' } }
    /**
     * Find zero or one WalletTransaction that matches the filter.
     * @param {WalletTransactionFindUniqueArgs} args - Arguments to find a WalletTransaction
     * @example
     * // Get one WalletTransaction
     * const walletTransaction = await prisma.walletTransaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WalletTransactionFindUniqueArgs>(args: SelectSubset<T, WalletTransactionFindUniqueArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WalletTransaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WalletTransactionFindUniqueOrThrowArgs} args - Arguments to find a WalletTransaction
     * @example
     * // Get one WalletTransaction
     * const walletTransaction = await prisma.walletTransaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WalletTransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, WalletTransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WalletTransaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletTransactionFindFirstArgs} args - Arguments to find a WalletTransaction
     * @example
     * // Get one WalletTransaction
     * const walletTransaction = await prisma.walletTransaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WalletTransactionFindFirstArgs>(args?: SelectSubset<T, WalletTransactionFindFirstArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WalletTransaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletTransactionFindFirstOrThrowArgs} args - Arguments to find a WalletTransaction
     * @example
     * // Get one WalletTransaction
     * const walletTransaction = await prisma.walletTransaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WalletTransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, WalletTransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WalletTransactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletTransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WalletTransactions
     * const walletTransactions = await prisma.walletTransaction.findMany()
     * 
     * // Get first 10 WalletTransactions
     * const walletTransactions = await prisma.walletTransaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const walletTransactionWithIdOnly = await prisma.walletTransaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WalletTransactionFindManyArgs>(args?: SelectSubset<T, WalletTransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WalletTransaction.
     * @param {WalletTransactionCreateArgs} args - Arguments to create a WalletTransaction.
     * @example
     * // Create one WalletTransaction
     * const WalletTransaction = await prisma.walletTransaction.create({
     *   data: {
     *     // ... data to create a WalletTransaction
     *   }
     * })
     * 
     */
    create<T extends WalletTransactionCreateArgs>(args: SelectSubset<T, WalletTransactionCreateArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WalletTransactions.
     * @param {WalletTransactionCreateManyArgs} args - Arguments to create many WalletTransactions.
     * @example
     * // Create many WalletTransactions
     * const walletTransaction = await prisma.walletTransaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WalletTransactionCreateManyArgs>(args?: SelectSubset<T, WalletTransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many WalletTransactions and returns the data saved in the database.
     * @param {WalletTransactionCreateManyAndReturnArgs} args - Arguments to create many WalletTransactions.
     * @example
     * // Create many WalletTransactions
     * const walletTransaction = await prisma.walletTransaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many WalletTransactions and only return the `id`
     * const walletTransactionWithIdOnly = await prisma.walletTransaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WalletTransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, WalletTransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a WalletTransaction.
     * @param {WalletTransactionDeleteArgs} args - Arguments to delete one WalletTransaction.
     * @example
     * // Delete one WalletTransaction
     * const WalletTransaction = await prisma.walletTransaction.delete({
     *   where: {
     *     // ... filter to delete one WalletTransaction
     *   }
     * })
     * 
     */
    delete<T extends WalletTransactionDeleteArgs>(args: SelectSubset<T, WalletTransactionDeleteArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WalletTransaction.
     * @param {WalletTransactionUpdateArgs} args - Arguments to update one WalletTransaction.
     * @example
     * // Update one WalletTransaction
     * const walletTransaction = await prisma.walletTransaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WalletTransactionUpdateArgs>(args: SelectSubset<T, WalletTransactionUpdateArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WalletTransactions.
     * @param {WalletTransactionDeleteManyArgs} args - Arguments to filter WalletTransactions to delete.
     * @example
     * // Delete a few WalletTransactions
     * const { count } = await prisma.walletTransaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WalletTransactionDeleteManyArgs>(args?: SelectSubset<T, WalletTransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WalletTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletTransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WalletTransactions
     * const walletTransaction = await prisma.walletTransaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WalletTransactionUpdateManyArgs>(args: SelectSubset<T, WalletTransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WalletTransactions and returns the data updated in the database.
     * @param {WalletTransactionUpdateManyAndReturnArgs} args - Arguments to update many WalletTransactions.
     * @example
     * // Update many WalletTransactions
     * const walletTransaction = await prisma.walletTransaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more WalletTransactions and only return the `id`
     * const walletTransactionWithIdOnly = await prisma.walletTransaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WalletTransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, WalletTransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one WalletTransaction.
     * @param {WalletTransactionUpsertArgs} args - Arguments to update or create a WalletTransaction.
     * @example
     * // Update or create a WalletTransaction
     * const walletTransaction = await prisma.walletTransaction.upsert({
     *   create: {
     *     // ... data to create a WalletTransaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WalletTransaction we want to update
     *   }
     * })
     */
    upsert<T extends WalletTransactionUpsertArgs>(args: SelectSubset<T, WalletTransactionUpsertArgs<ExtArgs>>): Prisma__WalletTransactionClient<$Result.GetResult<Prisma.$WalletTransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WalletTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletTransactionCountArgs} args - Arguments to filter WalletTransactions to count.
     * @example
     * // Count the number of WalletTransactions
     * const count = await prisma.walletTransaction.count({
     *   where: {
     *     // ... the filter for the WalletTransactions we want to count
     *   }
     * })
    **/
    count<T extends WalletTransactionCountArgs>(
      args?: Subset<T, WalletTransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WalletTransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WalletTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletTransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WalletTransactionAggregateArgs>(args: Subset<T, WalletTransactionAggregateArgs>): Prisma.PrismaPromise<GetWalletTransactionAggregateType<T>>

    /**
     * Group by WalletTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WalletTransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WalletTransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WalletTransactionGroupByArgs['orderBy'] }
        : { orderBy?: WalletTransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WalletTransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWalletTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WalletTransaction model
   */
  readonly fields: WalletTransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WalletTransaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WalletTransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    wallet<T extends WalletDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WalletDefaultArgs<ExtArgs>>): Prisma__WalletClient<$Result.GetResult<Prisma.$WalletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the WalletTransaction model
   */
  interface WalletTransactionFieldRefs {
    readonly id: FieldRef<"WalletTransaction", 'Int'>
    readonly custodialWalletId: FieldRef<"WalletTransaction", 'String'>
    readonly txHash: FieldRef<"WalletTransaction", 'String'>
    readonly txType: FieldRef<"WalletTransaction", 'String'>
    readonly amount: FieldRef<"WalletTransaction", 'String'>
    readonly status: FieldRef<"WalletTransaction", 'String'>
    readonly blockNumber: FieldRef<"WalletTransaction", 'BigInt'>
    readonly gasUsed: FieldRef<"WalletTransaction", 'String'>
    readonly createdAt: FieldRef<"WalletTransaction", 'DateTime'>
    readonly confirmedAt: FieldRef<"WalletTransaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * WalletTransaction findUnique
   */
  export type WalletTransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * Filter, which WalletTransaction to fetch.
     */
    where: WalletTransactionWhereUniqueInput
  }

  /**
   * WalletTransaction findUniqueOrThrow
   */
  export type WalletTransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * Filter, which WalletTransaction to fetch.
     */
    where: WalletTransactionWhereUniqueInput
  }

  /**
   * WalletTransaction findFirst
   */
  export type WalletTransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * Filter, which WalletTransaction to fetch.
     */
    where?: WalletTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WalletTransactions to fetch.
     */
    orderBy?: WalletTransactionOrderByWithRelationInput | WalletTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WalletTransactions.
     */
    cursor?: WalletTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WalletTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WalletTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WalletTransactions.
     */
    distinct?: WalletTransactionScalarFieldEnum | WalletTransactionScalarFieldEnum[]
  }

  /**
   * WalletTransaction findFirstOrThrow
   */
  export type WalletTransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * Filter, which WalletTransaction to fetch.
     */
    where?: WalletTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WalletTransactions to fetch.
     */
    orderBy?: WalletTransactionOrderByWithRelationInput | WalletTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WalletTransactions.
     */
    cursor?: WalletTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WalletTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WalletTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WalletTransactions.
     */
    distinct?: WalletTransactionScalarFieldEnum | WalletTransactionScalarFieldEnum[]
  }

  /**
   * WalletTransaction findMany
   */
  export type WalletTransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * Filter, which WalletTransactions to fetch.
     */
    where?: WalletTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WalletTransactions to fetch.
     */
    orderBy?: WalletTransactionOrderByWithRelationInput | WalletTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WalletTransactions.
     */
    cursor?: WalletTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WalletTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WalletTransactions.
     */
    skip?: number
    distinct?: WalletTransactionScalarFieldEnum | WalletTransactionScalarFieldEnum[]
  }

  /**
   * WalletTransaction create
   */
  export type WalletTransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a WalletTransaction.
     */
    data: XOR<WalletTransactionCreateInput, WalletTransactionUncheckedCreateInput>
  }

  /**
   * WalletTransaction createMany
   */
  export type WalletTransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WalletTransactions.
     */
    data: WalletTransactionCreateManyInput | WalletTransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WalletTransaction createManyAndReturn
   */
  export type WalletTransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * The data used to create many WalletTransactions.
     */
    data: WalletTransactionCreateManyInput | WalletTransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * WalletTransaction update
   */
  export type WalletTransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a WalletTransaction.
     */
    data: XOR<WalletTransactionUpdateInput, WalletTransactionUncheckedUpdateInput>
    /**
     * Choose, which WalletTransaction to update.
     */
    where: WalletTransactionWhereUniqueInput
  }

  /**
   * WalletTransaction updateMany
   */
  export type WalletTransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WalletTransactions.
     */
    data: XOR<WalletTransactionUpdateManyMutationInput, WalletTransactionUncheckedUpdateManyInput>
    /**
     * Filter which WalletTransactions to update
     */
    where?: WalletTransactionWhereInput
    /**
     * Limit how many WalletTransactions to update.
     */
    limit?: number
  }

  /**
   * WalletTransaction updateManyAndReturn
   */
  export type WalletTransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * The data used to update WalletTransactions.
     */
    data: XOR<WalletTransactionUpdateManyMutationInput, WalletTransactionUncheckedUpdateManyInput>
    /**
     * Filter which WalletTransactions to update
     */
    where?: WalletTransactionWhereInput
    /**
     * Limit how many WalletTransactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * WalletTransaction upsert
   */
  export type WalletTransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the WalletTransaction to update in case it exists.
     */
    where: WalletTransactionWhereUniqueInput
    /**
     * In case the WalletTransaction found by the `where` argument doesn't exist, create a new WalletTransaction with this data.
     */
    create: XOR<WalletTransactionCreateInput, WalletTransactionUncheckedCreateInput>
    /**
     * In case the WalletTransaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WalletTransactionUpdateInput, WalletTransactionUncheckedUpdateInput>
  }

  /**
   * WalletTransaction delete
   */
  export type WalletTransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
    /**
     * Filter which WalletTransaction to delete.
     */
    where: WalletTransactionWhereUniqueInput
  }

  /**
   * WalletTransaction deleteMany
   */
  export type WalletTransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WalletTransactions to delete
     */
    where?: WalletTransactionWhereInput
    /**
     * Limit how many WalletTransactions to delete.
     */
    limit?: number
  }

  /**
   * WalletTransaction without action
   */
  export type WalletTransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WalletTransaction
     */
    select?: WalletTransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WalletTransaction
     */
    omit?: WalletTransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WalletTransactionInclude<ExtArgs> | null
  }


  /**
   * Model Bet
   */

  export type AggregateBet = {
    _count: BetCountAggregateOutputType | null
    _min: BetMinAggregateOutputType | null
    _max: BetMaxAggregateOutputType | null
  }

  export type BetMinAggregateOutputType = {
    id: string | null
    userId: string | null
    playerId: string | null
    serverSeedHash: string | null
    serverSeed: string | null
    clientSeed: string | null
    randomValue: string | null
    gameNumber: string | null
    wager: string | null
    targetMultiplier: string | null
    limboMultiplier: string | null
    outcome: string | null
    payout: string | null
    status: string | null
    ethPriceUsd: string | null
    wagerUsd: string | null
    payoutUsd: string | null
    betSignature: string | null
    betMessage: string | null
    signature: string | null
    txHash: string | null
    createdAt: Date | null
    resolvedAt: Date | null
  }

  export type BetMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    playerId: string | null
    serverSeedHash: string | null
    serverSeed: string | null
    clientSeed: string | null
    randomValue: string | null
    gameNumber: string | null
    wager: string | null
    targetMultiplier: string | null
    limboMultiplier: string | null
    outcome: string | null
    payout: string | null
    status: string | null
    ethPriceUsd: string | null
    wagerUsd: string | null
    payoutUsd: string | null
    betSignature: string | null
    betMessage: string | null
    signature: string | null
    txHash: string | null
    createdAt: Date | null
    resolvedAt: Date | null
  }

  export type BetCountAggregateOutputType = {
    id: number
    userId: number
    playerId: number
    serverSeedHash: number
    serverSeed: number
    clientSeed: number
    randomValue: number
    gameNumber: number
    wager: number
    targetMultiplier: number
    limboMultiplier: number
    outcome: number
    payout: number
    status: number
    ethPriceUsd: number
    wagerUsd: number
    payoutUsd: number
    betSignature: number
    betMessage: number
    signature: number
    txHash: number
    createdAt: number
    resolvedAt: number
    _all: number
  }


  export type BetMinAggregateInputType = {
    id?: true
    userId?: true
    playerId?: true
    serverSeedHash?: true
    serverSeed?: true
    clientSeed?: true
    randomValue?: true
    gameNumber?: true
    wager?: true
    targetMultiplier?: true
    limboMultiplier?: true
    outcome?: true
    payout?: true
    status?: true
    ethPriceUsd?: true
    wagerUsd?: true
    payoutUsd?: true
    betSignature?: true
    betMessage?: true
    signature?: true
    txHash?: true
    createdAt?: true
    resolvedAt?: true
  }

  export type BetMaxAggregateInputType = {
    id?: true
    userId?: true
    playerId?: true
    serverSeedHash?: true
    serverSeed?: true
    clientSeed?: true
    randomValue?: true
    gameNumber?: true
    wager?: true
    targetMultiplier?: true
    limboMultiplier?: true
    outcome?: true
    payout?: true
    status?: true
    ethPriceUsd?: true
    wagerUsd?: true
    payoutUsd?: true
    betSignature?: true
    betMessage?: true
    signature?: true
    txHash?: true
    createdAt?: true
    resolvedAt?: true
  }

  export type BetCountAggregateInputType = {
    id?: true
    userId?: true
    playerId?: true
    serverSeedHash?: true
    serverSeed?: true
    clientSeed?: true
    randomValue?: true
    gameNumber?: true
    wager?: true
    targetMultiplier?: true
    limboMultiplier?: true
    outcome?: true
    payout?: true
    status?: true
    ethPriceUsd?: true
    wagerUsd?: true
    payoutUsd?: true
    betSignature?: true
    betMessage?: true
    signature?: true
    txHash?: true
    createdAt?: true
    resolvedAt?: true
    _all?: true
  }

  export type BetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bet to aggregate.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bets
    **/
    _count?: true | BetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BetMaxAggregateInputType
  }

  export type GetBetAggregateType<T extends BetAggregateArgs> = {
        [P in keyof T & keyof AggregateBet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBet[P]>
      : GetScalarType<T[P], AggregateBet[P]>
  }




  export type BetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BetWhereInput
    orderBy?: BetOrderByWithAggregationInput | BetOrderByWithAggregationInput[]
    by: BetScalarFieldEnum[] | BetScalarFieldEnum
    having?: BetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BetCountAggregateInputType | true
    _min?: BetMinAggregateInputType
    _max?: BetMaxAggregateInputType
  }

  export type BetGroupByOutputType = {
    id: string
    userId: string
    playerId: string
    serverSeedHash: string
    serverSeed: string | null
    clientSeed: string | null
    randomValue: string
    gameNumber: string
    wager: string
    targetMultiplier: string
    limboMultiplier: string | null
    outcome: string
    payout: string
    status: string
    ethPriceUsd: string | null
    wagerUsd: string | null
    payoutUsd: string | null
    betSignature: string | null
    betMessage: string | null
    signature: string | null
    txHash: string | null
    createdAt: Date
    resolvedAt: Date | null
    _count: BetCountAggregateOutputType | null
    _min: BetMinAggregateOutputType | null
    _max: BetMaxAggregateOutputType | null
  }

  type GetBetGroupByPayload<T extends BetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BetGroupByOutputType[P]>
            : GetScalarType<T[P], BetGroupByOutputType[P]>
        }
      >
    >


  export type BetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    playerId?: boolean
    serverSeedHash?: boolean
    serverSeed?: boolean
    clientSeed?: boolean
    randomValue?: boolean
    gameNumber?: boolean
    wager?: boolean
    targetMultiplier?: boolean
    limboMultiplier?: boolean
    outcome?: boolean
    payout?: boolean
    status?: boolean
    ethPriceUsd?: boolean
    wagerUsd?: boolean
    payoutUsd?: boolean
    betSignature?: boolean
    betMessage?: boolean
    signature?: boolean
    txHash?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bet"]>

  export type BetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    playerId?: boolean
    serverSeedHash?: boolean
    serverSeed?: boolean
    clientSeed?: boolean
    randomValue?: boolean
    gameNumber?: boolean
    wager?: boolean
    targetMultiplier?: boolean
    limboMultiplier?: boolean
    outcome?: boolean
    payout?: boolean
    status?: boolean
    ethPriceUsd?: boolean
    wagerUsd?: boolean
    payoutUsd?: boolean
    betSignature?: boolean
    betMessage?: boolean
    signature?: boolean
    txHash?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bet"]>

  export type BetSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    playerId?: boolean
    serverSeedHash?: boolean
    serverSeed?: boolean
    clientSeed?: boolean
    randomValue?: boolean
    gameNumber?: boolean
    wager?: boolean
    targetMultiplier?: boolean
    limboMultiplier?: boolean
    outcome?: boolean
    payout?: boolean
    status?: boolean
    ethPriceUsd?: boolean
    wagerUsd?: boolean
    payoutUsd?: boolean
    betSignature?: boolean
    betMessage?: boolean
    signature?: boolean
    txHash?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["bet"]>

  export type BetSelectScalar = {
    id?: boolean
    userId?: boolean
    playerId?: boolean
    serverSeedHash?: boolean
    serverSeed?: boolean
    clientSeed?: boolean
    randomValue?: boolean
    gameNumber?: boolean
    wager?: boolean
    targetMultiplier?: boolean
    limboMultiplier?: boolean
    outcome?: boolean
    payout?: boolean
    status?: boolean
    ethPriceUsd?: boolean
    wagerUsd?: boolean
    payoutUsd?: boolean
    betSignature?: boolean
    betMessage?: boolean
    signature?: boolean
    txHash?: boolean
    createdAt?: boolean
    resolvedAt?: boolean
  }

  export type BetOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "playerId" | "serverSeedHash" | "serverSeed" | "clientSeed" | "randomValue" | "gameNumber" | "wager" | "targetMultiplier" | "limboMultiplier" | "outcome" | "payout" | "status" | "ethPriceUsd" | "wagerUsd" | "payoutUsd" | "betSignature" | "betMessage" | "signature" | "txHash" | "createdAt" | "resolvedAt", ExtArgs["result"]["bet"]>
  export type BetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type BetIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $BetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bet"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      playerId: string
      serverSeedHash: string
      serverSeed: string | null
      clientSeed: string | null
      randomValue: string
      gameNumber: string
      wager: string
      targetMultiplier: string
      limboMultiplier: string | null
      outcome: string
      payout: string
      status: string
      ethPriceUsd: string | null
      wagerUsd: string | null
      payoutUsd: string | null
      betSignature: string | null
      betMessage: string | null
      signature: string | null
      txHash: string | null
      createdAt: Date
      resolvedAt: Date | null
    }, ExtArgs["result"]["bet"]>
    composites: {}
  }

  type BetGetPayload<S extends boolean | null | undefined | BetDefaultArgs> = $Result.GetResult<Prisma.$BetPayload, S>

  type BetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BetCountAggregateInputType | true
    }

  export interface BetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bet'], meta: { name: 'Bet' } }
    /**
     * Find zero or one Bet that matches the filter.
     * @param {BetFindUniqueArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BetFindUniqueArgs>(args: SelectSubset<T, BetFindUniqueArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Bet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BetFindUniqueOrThrowArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BetFindUniqueOrThrowArgs>(args: SelectSubset<T, BetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetFindFirstArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BetFindFirstArgs>(args?: SelectSubset<T, BetFindFirstArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Bet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetFindFirstOrThrowArgs} args - Arguments to find a Bet
     * @example
     * // Get one Bet
     * const bet = await prisma.bet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BetFindFirstOrThrowArgs>(args?: SelectSubset<T, BetFindFirstOrThrowArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bets
     * const bets = await prisma.bet.findMany()
     * 
     * // Get first 10 Bets
     * const bets = await prisma.bet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const betWithIdOnly = await prisma.bet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BetFindManyArgs>(args?: SelectSubset<T, BetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Bet.
     * @param {BetCreateArgs} args - Arguments to create a Bet.
     * @example
     * // Create one Bet
     * const Bet = await prisma.bet.create({
     *   data: {
     *     // ... data to create a Bet
     *   }
     * })
     * 
     */
    create<T extends BetCreateArgs>(args: SelectSubset<T, BetCreateArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bets.
     * @param {BetCreateManyArgs} args - Arguments to create many Bets.
     * @example
     * // Create many Bets
     * const bet = await prisma.bet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BetCreateManyArgs>(args?: SelectSubset<T, BetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bets and returns the data saved in the database.
     * @param {BetCreateManyAndReturnArgs} args - Arguments to create many Bets.
     * @example
     * // Create many Bets
     * const bet = await prisma.bet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bets and only return the `id`
     * const betWithIdOnly = await prisma.bet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BetCreateManyAndReturnArgs>(args?: SelectSubset<T, BetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Bet.
     * @param {BetDeleteArgs} args - Arguments to delete one Bet.
     * @example
     * // Delete one Bet
     * const Bet = await prisma.bet.delete({
     *   where: {
     *     // ... filter to delete one Bet
     *   }
     * })
     * 
     */
    delete<T extends BetDeleteArgs>(args: SelectSubset<T, BetDeleteArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Bet.
     * @param {BetUpdateArgs} args - Arguments to update one Bet.
     * @example
     * // Update one Bet
     * const bet = await prisma.bet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BetUpdateArgs>(args: SelectSubset<T, BetUpdateArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bets.
     * @param {BetDeleteManyArgs} args - Arguments to filter Bets to delete.
     * @example
     * // Delete a few Bets
     * const { count } = await prisma.bet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BetDeleteManyArgs>(args?: SelectSubset<T, BetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bets
     * const bet = await prisma.bet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BetUpdateManyArgs>(args: SelectSubset<T, BetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bets and returns the data updated in the database.
     * @param {BetUpdateManyAndReturnArgs} args - Arguments to update many Bets.
     * @example
     * // Update many Bets
     * const bet = await prisma.bet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bets and only return the `id`
     * const betWithIdOnly = await prisma.bet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BetUpdateManyAndReturnArgs>(args: SelectSubset<T, BetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Bet.
     * @param {BetUpsertArgs} args - Arguments to update or create a Bet.
     * @example
     * // Update or create a Bet
     * const bet = await prisma.bet.upsert({
     *   create: {
     *     // ... data to create a Bet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bet we want to update
     *   }
     * })
     */
    upsert<T extends BetUpsertArgs>(args: SelectSubset<T, BetUpsertArgs<ExtArgs>>): Prisma__BetClient<$Result.GetResult<Prisma.$BetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetCountArgs} args - Arguments to filter Bets to count.
     * @example
     * // Count the number of Bets
     * const count = await prisma.bet.count({
     *   where: {
     *     // ... the filter for the Bets we want to count
     *   }
     * })
    **/
    count<T extends BetCountArgs>(
      args?: Subset<T, BetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BetAggregateArgs>(args: Subset<T, BetAggregateArgs>): Prisma.PrismaPromise<GetBetAggregateType<T>>

    /**
     * Group by Bet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BetGroupByArgs['orderBy'] }
        : { orderBy?: BetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bet model
   */
  readonly fields: BetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bet model
   */
  interface BetFieldRefs {
    readonly id: FieldRef<"Bet", 'String'>
    readonly userId: FieldRef<"Bet", 'String'>
    readonly playerId: FieldRef<"Bet", 'String'>
    readonly serverSeedHash: FieldRef<"Bet", 'String'>
    readonly serverSeed: FieldRef<"Bet", 'String'>
    readonly clientSeed: FieldRef<"Bet", 'String'>
    readonly randomValue: FieldRef<"Bet", 'String'>
    readonly gameNumber: FieldRef<"Bet", 'String'>
    readonly wager: FieldRef<"Bet", 'String'>
    readonly targetMultiplier: FieldRef<"Bet", 'String'>
    readonly limboMultiplier: FieldRef<"Bet", 'String'>
    readonly outcome: FieldRef<"Bet", 'String'>
    readonly payout: FieldRef<"Bet", 'String'>
    readonly status: FieldRef<"Bet", 'String'>
    readonly ethPriceUsd: FieldRef<"Bet", 'String'>
    readonly wagerUsd: FieldRef<"Bet", 'String'>
    readonly payoutUsd: FieldRef<"Bet", 'String'>
    readonly betSignature: FieldRef<"Bet", 'String'>
    readonly betMessage: FieldRef<"Bet", 'String'>
    readonly signature: FieldRef<"Bet", 'String'>
    readonly txHash: FieldRef<"Bet", 'String'>
    readonly createdAt: FieldRef<"Bet", 'DateTime'>
    readonly resolvedAt: FieldRef<"Bet", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Bet findUnique
   */
  export type BetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet findUniqueOrThrow
   */
  export type BetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet findFirst
   */
  export type BetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bets.
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bets.
     */
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * Bet findFirstOrThrow
   */
  export type BetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bet to fetch.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bets.
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bets.
     */
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * Bet findMany
   */
  export type BetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter, which Bets to fetch.
     */
    where?: BetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bets to fetch.
     */
    orderBy?: BetOrderByWithRelationInput | BetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bets.
     */
    cursor?: BetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bets.
     */
    skip?: number
    distinct?: BetScalarFieldEnum | BetScalarFieldEnum[]
  }

  /**
   * Bet create
   */
  export type BetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * The data needed to create a Bet.
     */
    data: XOR<BetCreateInput, BetUncheckedCreateInput>
  }

  /**
   * Bet createMany
   */
  export type BetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bets.
     */
    data: BetCreateManyInput | BetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bet createManyAndReturn
   */
  export type BetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * The data used to create many Bets.
     */
    data: BetCreateManyInput | BetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bet update
   */
  export type BetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * The data needed to update a Bet.
     */
    data: XOR<BetUpdateInput, BetUncheckedUpdateInput>
    /**
     * Choose, which Bet to update.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet updateMany
   */
  export type BetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bets.
     */
    data: XOR<BetUpdateManyMutationInput, BetUncheckedUpdateManyInput>
    /**
     * Filter which Bets to update
     */
    where?: BetWhereInput
    /**
     * Limit how many Bets to update.
     */
    limit?: number
  }

  /**
   * Bet updateManyAndReturn
   */
  export type BetUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * The data used to update Bets.
     */
    data: XOR<BetUpdateManyMutationInput, BetUncheckedUpdateManyInput>
    /**
     * Filter which Bets to update
     */
    where?: BetWhereInput
    /**
     * Limit how many Bets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Bet upsert
   */
  export type BetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * The filter to search for the Bet to update in case it exists.
     */
    where: BetWhereUniqueInput
    /**
     * In case the Bet found by the `where` argument doesn't exist, create a new Bet with this data.
     */
    create: XOR<BetCreateInput, BetUncheckedCreateInput>
    /**
     * In case the Bet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BetUpdateInput, BetUncheckedUpdateInput>
  }

  /**
   * Bet delete
   */
  export type BetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
    /**
     * Filter which Bet to delete.
     */
    where: BetWhereUniqueInput
  }

  /**
   * Bet deleteMany
   */
  export type BetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bets to delete
     */
    where?: BetWhereInput
    /**
     * Limit how many Bets to delete.
     */
    limit?: number
  }

  /**
   * Bet without action
   */
  export type BetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bet
     */
    select?: BetSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Bet
     */
    omit?: BetOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BetInclude<ExtArgs> | null
  }


  /**
   * Model UserTask
   */

  export type AggregateUserTask = {
    _count: UserTaskCountAggregateOutputType | null
    _avg: UserTaskAvgAggregateOutputType | null
    _sum: UserTaskSumAggregateOutputType | null
    _min: UserTaskMinAggregateOutputType | null
    _max: UserTaskMaxAggregateOutputType | null
  }

  export type UserTaskAvgAggregateOutputType = {
    points: number | null
  }

  export type UserTaskSumAggregateOutputType = {
    points: number | null
  }

  export type UserTaskMinAggregateOutputType = {
    id: string | null
    userId: string | null
    taskId: string | null
    completed: boolean | null
    points: number | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type UserTaskMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    taskId: string | null
    completed: boolean | null
    points: number | null
    completedAt: Date | null
    createdAt: Date | null
  }

  export type UserTaskCountAggregateOutputType = {
    id: number
    userId: number
    taskId: number
    completed: number
    points: number
    completedAt: number
    createdAt: number
    _all: number
  }


  export type UserTaskAvgAggregateInputType = {
    points?: true
  }

  export type UserTaskSumAggregateInputType = {
    points?: true
  }

  export type UserTaskMinAggregateInputType = {
    id?: true
    userId?: true
    taskId?: true
    completed?: true
    points?: true
    completedAt?: true
    createdAt?: true
  }

  export type UserTaskMaxAggregateInputType = {
    id?: true
    userId?: true
    taskId?: true
    completed?: true
    points?: true
    completedAt?: true
    createdAt?: true
  }

  export type UserTaskCountAggregateInputType = {
    id?: true
    userId?: true
    taskId?: true
    completed?: true
    points?: true
    completedAt?: true
    createdAt?: true
    _all?: true
  }

  export type UserTaskAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTask to aggregate.
     */
    where?: UserTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTasks to fetch.
     */
    orderBy?: UserTaskOrderByWithRelationInput | UserTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserTasks
    **/
    _count?: true | UserTaskCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserTaskAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserTaskSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserTaskMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserTaskMaxAggregateInputType
  }

  export type GetUserTaskAggregateType<T extends UserTaskAggregateArgs> = {
        [P in keyof T & keyof AggregateUserTask]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserTask[P]>
      : GetScalarType<T[P], AggregateUserTask[P]>
  }




  export type UserTaskGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTaskWhereInput
    orderBy?: UserTaskOrderByWithAggregationInput | UserTaskOrderByWithAggregationInput[]
    by: UserTaskScalarFieldEnum[] | UserTaskScalarFieldEnum
    having?: UserTaskScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserTaskCountAggregateInputType | true
    _avg?: UserTaskAvgAggregateInputType
    _sum?: UserTaskSumAggregateInputType
    _min?: UserTaskMinAggregateInputType
    _max?: UserTaskMaxAggregateInputType
  }

  export type UserTaskGroupByOutputType = {
    id: string
    userId: string
    taskId: string
    completed: boolean
    points: number
    completedAt: Date | null
    createdAt: Date
    _count: UserTaskCountAggregateOutputType | null
    _avg: UserTaskAvgAggregateOutputType | null
    _sum: UserTaskSumAggregateOutputType | null
    _min: UserTaskMinAggregateOutputType | null
    _max: UserTaskMaxAggregateOutputType | null
  }

  type GetUserTaskGroupByPayload<T extends UserTaskGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserTaskGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserTaskGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserTaskGroupByOutputType[P]>
            : GetScalarType<T[P], UserTaskGroupByOutputType[P]>
        }
      >
    >


  export type UserTaskSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    taskId?: boolean
    completed?: boolean
    points?: boolean
    completedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTask"]>

  export type UserTaskSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    taskId?: boolean
    completed?: boolean
    points?: boolean
    completedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTask"]>

  export type UserTaskSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    taskId?: boolean
    completed?: boolean
    points?: boolean
    completedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTask"]>

  export type UserTaskSelectScalar = {
    id?: boolean
    userId?: boolean
    taskId?: boolean
    completed?: boolean
    points?: boolean
    completedAt?: boolean
    createdAt?: boolean
  }

  export type UserTaskOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "taskId" | "completed" | "points" | "completedAt" | "createdAt", ExtArgs["result"]["userTask"]>
  export type UserTaskInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserTaskIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserTaskIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserTaskPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserTask"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      taskId: string
      completed: boolean
      points: number
      completedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["userTask"]>
    composites: {}
  }

  type UserTaskGetPayload<S extends boolean | null | undefined | UserTaskDefaultArgs> = $Result.GetResult<Prisma.$UserTaskPayload, S>

  type UserTaskCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserTaskFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserTaskCountAggregateInputType | true
    }

  export interface UserTaskDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserTask'], meta: { name: 'UserTask' } }
    /**
     * Find zero or one UserTask that matches the filter.
     * @param {UserTaskFindUniqueArgs} args - Arguments to find a UserTask
     * @example
     * // Get one UserTask
     * const userTask = await prisma.userTask.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserTaskFindUniqueArgs>(args: SelectSubset<T, UserTaskFindUniqueArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserTask that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserTaskFindUniqueOrThrowArgs} args - Arguments to find a UserTask
     * @example
     * // Get one UserTask
     * const userTask = await prisma.userTask.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserTaskFindUniqueOrThrowArgs>(args: SelectSubset<T, UserTaskFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTask that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTaskFindFirstArgs} args - Arguments to find a UserTask
     * @example
     * // Get one UserTask
     * const userTask = await prisma.userTask.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserTaskFindFirstArgs>(args?: SelectSubset<T, UserTaskFindFirstArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTask that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTaskFindFirstOrThrowArgs} args - Arguments to find a UserTask
     * @example
     * // Get one UserTask
     * const userTask = await prisma.userTask.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserTaskFindFirstOrThrowArgs>(args?: SelectSubset<T, UserTaskFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserTasks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTaskFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserTasks
     * const userTasks = await prisma.userTask.findMany()
     * 
     * // Get first 10 UserTasks
     * const userTasks = await prisma.userTask.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userTaskWithIdOnly = await prisma.userTask.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserTaskFindManyArgs>(args?: SelectSubset<T, UserTaskFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserTask.
     * @param {UserTaskCreateArgs} args - Arguments to create a UserTask.
     * @example
     * // Create one UserTask
     * const UserTask = await prisma.userTask.create({
     *   data: {
     *     // ... data to create a UserTask
     *   }
     * })
     * 
     */
    create<T extends UserTaskCreateArgs>(args: SelectSubset<T, UserTaskCreateArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserTasks.
     * @param {UserTaskCreateManyArgs} args - Arguments to create many UserTasks.
     * @example
     * // Create many UserTasks
     * const userTask = await prisma.userTask.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserTaskCreateManyArgs>(args?: SelectSubset<T, UserTaskCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserTasks and returns the data saved in the database.
     * @param {UserTaskCreateManyAndReturnArgs} args - Arguments to create many UserTasks.
     * @example
     * // Create many UserTasks
     * const userTask = await prisma.userTask.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserTasks and only return the `id`
     * const userTaskWithIdOnly = await prisma.userTask.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserTaskCreateManyAndReturnArgs>(args?: SelectSubset<T, UserTaskCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserTask.
     * @param {UserTaskDeleteArgs} args - Arguments to delete one UserTask.
     * @example
     * // Delete one UserTask
     * const UserTask = await prisma.userTask.delete({
     *   where: {
     *     // ... filter to delete one UserTask
     *   }
     * })
     * 
     */
    delete<T extends UserTaskDeleteArgs>(args: SelectSubset<T, UserTaskDeleteArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserTask.
     * @param {UserTaskUpdateArgs} args - Arguments to update one UserTask.
     * @example
     * // Update one UserTask
     * const userTask = await prisma.userTask.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserTaskUpdateArgs>(args: SelectSubset<T, UserTaskUpdateArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserTasks.
     * @param {UserTaskDeleteManyArgs} args - Arguments to filter UserTasks to delete.
     * @example
     * // Delete a few UserTasks
     * const { count } = await prisma.userTask.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserTaskDeleteManyArgs>(args?: SelectSubset<T, UserTaskDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTaskUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserTasks
     * const userTask = await prisma.userTask.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserTaskUpdateManyArgs>(args: SelectSubset<T, UserTaskUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTasks and returns the data updated in the database.
     * @param {UserTaskUpdateManyAndReturnArgs} args - Arguments to update many UserTasks.
     * @example
     * // Update many UserTasks
     * const userTask = await prisma.userTask.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserTasks and only return the `id`
     * const userTaskWithIdOnly = await prisma.userTask.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserTaskUpdateManyAndReturnArgs>(args: SelectSubset<T, UserTaskUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserTask.
     * @param {UserTaskUpsertArgs} args - Arguments to update or create a UserTask.
     * @example
     * // Update or create a UserTask
     * const userTask = await prisma.userTask.upsert({
     *   create: {
     *     // ... data to create a UserTask
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserTask we want to update
     *   }
     * })
     */
    upsert<T extends UserTaskUpsertArgs>(args: SelectSubset<T, UserTaskUpsertArgs<ExtArgs>>): Prisma__UserTaskClient<$Result.GetResult<Prisma.$UserTaskPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserTasks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTaskCountArgs} args - Arguments to filter UserTasks to count.
     * @example
     * // Count the number of UserTasks
     * const count = await prisma.userTask.count({
     *   where: {
     *     // ... the filter for the UserTasks we want to count
     *   }
     * })
    **/
    count<T extends UserTaskCountArgs>(
      args?: Subset<T, UserTaskCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserTaskCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTaskAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserTaskAggregateArgs>(args: Subset<T, UserTaskAggregateArgs>): Prisma.PrismaPromise<GetUserTaskAggregateType<T>>

    /**
     * Group by UserTask.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTaskGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserTaskGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserTaskGroupByArgs['orderBy'] }
        : { orderBy?: UserTaskGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserTaskGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTaskGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserTask model
   */
  readonly fields: UserTaskFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserTask.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserTaskClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserTask model
   */
  interface UserTaskFieldRefs {
    readonly id: FieldRef<"UserTask", 'String'>
    readonly userId: FieldRef<"UserTask", 'String'>
    readonly taskId: FieldRef<"UserTask", 'String'>
    readonly completed: FieldRef<"UserTask", 'Boolean'>
    readonly points: FieldRef<"UserTask", 'Int'>
    readonly completedAt: FieldRef<"UserTask", 'DateTime'>
    readonly createdAt: FieldRef<"UserTask", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserTask findUnique
   */
  export type UserTaskFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * Filter, which UserTask to fetch.
     */
    where: UserTaskWhereUniqueInput
  }

  /**
   * UserTask findUniqueOrThrow
   */
  export type UserTaskFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * Filter, which UserTask to fetch.
     */
    where: UserTaskWhereUniqueInput
  }

  /**
   * UserTask findFirst
   */
  export type UserTaskFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * Filter, which UserTask to fetch.
     */
    where?: UserTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTasks to fetch.
     */
    orderBy?: UserTaskOrderByWithRelationInput | UserTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTasks.
     */
    cursor?: UserTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTasks.
     */
    distinct?: UserTaskScalarFieldEnum | UserTaskScalarFieldEnum[]
  }

  /**
   * UserTask findFirstOrThrow
   */
  export type UserTaskFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * Filter, which UserTask to fetch.
     */
    where?: UserTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTasks to fetch.
     */
    orderBy?: UserTaskOrderByWithRelationInput | UserTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTasks.
     */
    cursor?: UserTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTasks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTasks.
     */
    distinct?: UserTaskScalarFieldEnum | UserTaskScalarFieldEnum[]
  }

  /**
   * UserTask findMany
   */
  export type UserTaskFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * Filter, which UserTasks to fetch.
     */
    where?: UserTaskWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTasks to fetch.
     */
    orderBy?: UserTaskOrderByWithRelationInput | UserTaskOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserTasks.
     */
    cursor?: UserTaskWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTasks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTasks.
     */
    skip?: number
    distinct?: UserTaskScalarFieldEnum | UserTaskScalarFieldEnum[]
  }

  /**
   * UserTask create
   */
  export type UserTaskCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * The data needed to create a UserTask.
     */
    data: XOR<UserTaskCreateInput, UserTaskUncheckedCreateInput>
  }

  /**
   * UserTask createMany
   */
  export type UserTaskCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserTasks.
     */
    data: UserTaskCreateManyInput | UserTaskCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserTask createManyAndReturn
   */
  export type UserTaskCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * The data used to create many UserTasks.
     */
    data: UserTaskCreateManyInput | UserTaskCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTask update
   */
  export type UserTaskUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * The data needed to update a UserTask.
     */
    data: XOR<UserTaskUpdateInput, UserTaskUncheckedUpdateInput>
    /**
     * Choose, which UserTask to update.
     */
    where: UserTaskWhereUniqueInput
  }

  /**
   * UserTask updateMany
   */
  export type UserTaskUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserTasks.
     */
    data: XOR<UserTaskUpdateManyMutationInput, UserTaskUncheckedUpdateManyInput>
    /**
     * Filter which UserTasks to update
     */
    where?: UserTaskWhereInput
    /**
     * Limit how many UserTasks to update.
     */
    limit?: number
  }

  /**
   * UserTask updateManyAndReturn
   */
  export type UserTaskUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * The data used to update UserTasks.
     */
    data: XOR<UserTaskUpdateManyMutationInput, UserTaskUncheckedUpdateManyInput>
    /**
     * Filter which UserTasks to update
     */
    where?: UserTaskWhereInput
    /**
     * Limit how many UserTasks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTask upsert
   */
  export type UserTaskUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * The filter to search for the UserTask to update in case it exists.
     */
    where: UserTaskWhereUniqueInput
    /**
     * In case the UserTask found by the `where` argument doesn't exist, create a new UserTask with this data.
     */
    create: XOR<UserTaskCreateInput, UserTaskUncheckedCreateInput>
    /**
     * In case the UserTask was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserTaskUpdateInput, UserTaskUncheckedUpdateInput>
  }

  /**
   * UserTask delete
   */
  export type UserTaskDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
    /**
     * Filter which UserTask to delete.
     */
    where: UserTaskWhereUniqueInput
  }

  /**
   * UserTask deleteMany
   */
  export type UserTaskDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTasks to delete
     */
    where?: UserTaskWhereInput
    /**
     * Limit how many UserTasks to delete.
     */
    limit?: number
  }

  /**
   * UserTask without action
   */
  export type UserTaskDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTask
     */
    select?: UserTaskSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTask
     */
    omit?: UserTaskOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTaskInclude<ExtArgs> | null
  }


  /**
   * Model Referral
   */

  export type AggregateReferral = {
    _count: ReferralCountAggregateOutputType | null
    _avg: ReferralAvgAggregateOutputType | null
    _sum: ReferralSumAggregateOutputType | null
    _min: ReferralMinAggregateOutputType | null
    _max: ReferralMaxAggregateOutputType | null
  }

  export type ReferralAvgAggregateOutputType = {
    points: number | null
  }

  export type ReferralSumAggregateOutputType = {
    points: number | null
  }

  export type ReferralMinAggregateOutputType = {
    id: string | null
    referrerId: string | null
    referredId: string | null
    points: number | null
    createdAt: Date | null
  }

  export type ReferralMaxAggregateOutputType = {
    id: string | null
    referrerId: string | null
    referredId: string | null
    points: number | null
    createdAt: Date | null
  }

  export type ReferralCountAggregateOutputType = {
    id: number
    referrerId: number
    referredId: number
    points: number
    createdAt: number
    _all: number
  }


  export type ReferralAvgAggregateInputType = {
    points?: true
  }

  export type ReferralSumAggregateInputType = {
    points?: true
  }

  export type ReferralMinAggregateInputType = {
    id?: true
    referrerId?: true
    referredId?: true
    points?: true
    createdAt?: true
  }

  export type ReferralMaxAggregateInputType = {
    id?: true
    referrerId?: true
    referredId?: true
    points?: true
    createdAt?: true
  }

  export type ReferralCountAggregateInputType = {
    id?: true
    referrerId?: true
    referredId?: true
    points?: true
    createdAt?: true
    _all?: true
  }

  export type ReferralAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Referral to aggregate.
     */
    where?: ReferralWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Referrals to fetch.
     */
    orderBy?: ReferralOrderByWithRelationInput | ReferralOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReferralWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Referrals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Referrals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Referrals
    **/
    _count?: true | ReferralCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReferralAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReferralSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReferralMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReferralMaxAggregateInputType
  }

  export type GetReferralAggregateType<T extends ReferralAggregateArgs> = {
        [P in keyof T & keyof AggregateReferral]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReferral[P]>
      : GetScalarType<T[P], AggregateReferral[P]>
  }




  export type ReferralGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReferralWhereInput
    orderBy?: ReferralOrderByWithAggregationInput | ReferralOrderByWithAggregationInput[]
    by: ReferralScalarFieldEnum[] | ReferralScalarFieldEnum
    having?: ReferralScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReferralCountAggregateInputType | true
    _avg?: ReferralAvgAggregateInputType
    _sum?: ReferralSumAggregateInputType
    _min?: ReferralMinAggregateInputType
    _max?: ReferralMaxAggregateInputType
  }

  export type ReferralGroupByOutputType = {
    id: string
    referrerId: string
    referredId: string
    points: number
    createdAt: Date
    _count: ReferralCountAggregateOutputType | null
    _avg: ReferralAvgAggregateOutputType | null
    _sum: ReferralSumAggregateOutputType | null
    _min: ReferralMinAggregateOutputType | null
    _max: ReferralMaxAggregateOutputType | null
  }

  type GetReferralGroupByPayload<T extends ReferralGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReferralGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReferralGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReferralGroupByOutputType[P]>
            : GetScalarType<T[P], ReferralGroupByOutputType[P]>
        }
      >
    >


  export type ReferralSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    points?: boolean
    createdAt?: boolean
    referrer?: boolean | UserDefaultArgs<ExtArgs>
    referred?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["referral"]>

  export type ReferralSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    points?: boolean
    createdAt?: boolean
    referrer?: boolean | UserDefaultArgs<ExtArgs>
    referred?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["referral"]>

  export type ReferralSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    points?: boolean
    createdAt?: boolean
    referrer?: boolean | UserDefaultArgs<ExtArgs>
    referred?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["referral"]>

  export type ReferralSelectScalar = {
    id?: boolean
    referrerId?: boolean
    referredId?: boolean
    points?: boolean
    createdAt?: boolean
  }

  export type ReferralOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "referrerId" | "referredId" | "points" | "createdAt", ExtArgs["result"]["referral"]>
  export type ReferralInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrer?: boolean | UserDefaultArgs<ExtArgs>
    referred?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReferralIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrer?: boolean | UserDefaultArgs<ExtArgs>
    referred?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type ReferralIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    referrer?: boolean | UserDefaultArgs<ExtArgs>
    referred?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $ReferralPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Referral"
    objects: {
      referrer: Prisma.$UserPayload<ExtArgs>
      referred: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      referrerId: string
      referredId: string
      points: number
      createdAt: Date
    }, ExtArgs["result"]["referral"]>
    composites: {}
  }

  type ReferralGetPayload<S extends boolean | null | undefined | ReferralDefaultArgs> = $Result.GetResult<Prisma.$ReferralPayload, S>

  type ReferralCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReferralFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReferralCountAggregateInputType | true
    }

  export interface ReferralDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Referral'], meta: { name: 'Referral' } }
    /**
     * Find zero or one Referral that matches the filter.
     * @param {ReferralFindUniqueArgs} args - Arguments to find a Referral
     * @example
     * // Get one Referral
     * const referral = await prisma.referral.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReferralFindUniqueArgs>(args: SelectSubset<T, ReferralFindUniqueArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Referral that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReferralFindUniqueOrThrowArgs} args - Arguments to find a Referral
     * @example
     * // Get one Referral
     * const referral = await prisma.referral.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReferralFindUniqueOrThrowArgs>(args: SelectSubset<T, ReferralFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Referral that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReferralFindFirstArgs} args - Arguments to find a Referral
     * @example
     * // Get one Referral
     * const referral = await prisma.referral.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReferralFindFirstArgs>(args?: SelectSubset<T, ReferralFindFirstArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Referral that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReferralFindFirstOrThrowArgs} args - Arguments to find a Referral
     * @example
     * // Get one Referral
     * const referral = await prisma.referral.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReferralFindFirstOrThrowArgs>(args?: SelectSubset<T, ReferralFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Referrals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReferralFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Referrals
     * const referrals = await prisma.referral.findMany()
     * 
     * // Get first 10 Referrals
     * const referrals = await prisma.referral.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const referralWithIdOnly = await prisma.referral.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReferralFindManyArgs>(args?: SelectSubset<T, ReferralFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Referral.
     * @param {ReferralCreateArgs} args - Arguments to create a Referral.
     * @example
     * // Create one Referral
     * const Referral = await prisma.referral.create({
     *   data: {
     *     // ... data to create a Referral
     *   }
     * })
     * 
     */
    create<T extends ReferralCreateArgs>(args: SelectSubset<T, ReferralCreateArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Referrals.
     * @param {ReferralCreateManyArgs} args - Arguments to create many Referrals.
     * @example
     * // Create many Referrals
     * const referral = await prisma.referral.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReferralCreateManyArgs>(args?: SelectSubset<T, ReferralCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Referrals and returns the data saved in the database.
     * @param {ReferralCreateManyAndReturnArgs} args - Arguments to create many Referrals.
     * @example
     * // Create many Referrals
     * const referral = await prisma.referral.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Referrals and only return the `id`
     * const referralWithIdOnly = await prisma.referral.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReferralCreateManyAndReturnArgs>(args?: SelectSubset<T, ReferralCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Referral.
     * @param {ReferralDeleteArgs} args - Arguments to delete one Referral.
     * @example
     * // Delete one Referral
     * const Referral = await prisma.referral.delete({
     *   where: {
     *     // ... filter to delete one Referral
     *   }
     * })
     * 
     */
    delete<T extends ReferralDeleteArgs>(args: SelectSubset<T, ReferralDeleteArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Referral.
     * @param {ReferralUpdateArgs} args - Arguments to update one Referral.
     * @example
     * // Update one Referral
     * const referral = await prisma.referral.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReferralUpdateArgs>(args: SelectSubset<T, ReferralUpdateArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Referrals.
     * @param {ReferralDeleteManyArgs} args - Arguments to filter Referrals to delete.
     * @example
     * // Delete a few Referrals
     * const { count } = await prisma.referral.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReferralDeleteManyArgs>(args?: SelectSubset<T, ReferralDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Referrals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReferralUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Referrals
     * const referral = await prisma.referral.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReferralUpdateManyArgs>(args: SelectSubset<T, ReferralUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Referrals and returns the data updated in the database.
     * @param {ReferralUpdateManyAndReturnArgs} args - Arguments to update many Referrals.
     * @example
     * // Update many Referrals
     * const referral = await prisma.referral.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Referrals and only return the `id`
     * const referralWithIdOnly = await prisma.referral.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReferralUpdateManyAndReturnArgs>(args: SelectSubset<T, ReferralUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Referral.
     * @param {ReferralUpsertArgs} args - Arguments to update or create a Referral.
     * @example
     * // Update or create a Referral
     * const referral = await prisma.referral.upsert({
     *   create: {
     *     // ... data to create a Referral
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Referral we want to update
     *   }
     * })
     */
    upsert<T extends ReferralUpsertArgs>(args: SelectSubset<T, ReferralUpsertArgs<ExtArgs>>): Prisma__ReferralClient<$Result.GetResult<Prisma.$ReferralPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Referrals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReferralCountArgs} args - Arguments to filter Referrals to count.
     * @example
     * // Count the number of Referrals
     * const count = await prisma.referral.count({
     *   where: {
     *     // ... the filter for the Referrals we want to count
     *   }
     * })
    **/
    count<T extends ReferralCountArgs>(
      args?: Subset<T, ReferralCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReferralCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Referral.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReferralAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReferralAggregateArgs>(args: Subset<T, ReferralAggregateArgs>): Prisma.PrismaPromise<GetReferralAggregateType<T>>

    /**
     * Group by Referral.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReferralGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReferralGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReferralGroupByArgs['orderBy'] }
        : { orderBy?: ReferralGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReferralGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReferralGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Referral model
   */
  readonly fields: ReferralFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Referral.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReferralClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    referrer<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    referred<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Referral model
   */
  interface ReferralFieldRefs {
    readonly id: FieldRef<"Referral", 'String'>
    readonly referrerId: FieldRef<"Referral", 'String'>
    readonly referredId: FieldRef<"Referral", 'String'>
    readonly points: FieldRef<"Referral", 'Int'>
    readonly createdAt: FieldRef<"Referral", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Referral findUnique
   */
  export type ReferralFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * Filter, which Referral to fetch.
     */
    where: ReferralWhereUniqueInput
  }

  /**
   * Referral findUniqueOrThrow
   */
  export type ReferralFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * Filter, which Referral to fetch.
     */
    where: ReferralWhereUniqueInput
  }

  /**
   * Referral findFirst
   */
  export type ReferralFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * Filter, which Referral to fetch.
     */
    where?: ReferralWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Referrals to fetch.
     */
    orderBy?: ReferralOrderByWithRelationInput | ReferralOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Referrals.
     */
    cursor?: ReferralWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Referrals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Referrals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Referrals.
     */
    distinct?: ReferralScalarFieldEnum | ReferralScalarFieldEnum[]
  }

  /**
   * Referral findFirstOrThrow
   */
  export type ReferralFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * Filter, which Referral to fetch.
     */
    where?: ReferralWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Referrals to fetch.
     */
    orderBy?: ReferralOrderByWithRelationInput | ReferralOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Referrals.
     */
    cursor?: ReferralWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Referrals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Referrals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Referrals.
     */
    distinct?: ReferralScalarFieldEnum | ReferralScalarFieldEnum[]
  }

  /**
   * Referral findMany
   */
  export type ReferralFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * Filter, which Referrals to fetch.
     */
    where?: ReferralWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Referrals to fetch.
     */
    orderBy?: ReferralOrderByWithRelationInput | ReferralOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Referrals.
     */
    cursor?: ReferralWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Referrals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Referrals.
     */
    skip?: number
    distinct?: ReferralScalarFieldEnum | ReferralScalarFieldEnum[]
  }

  /**
   * Referral create
   */
  export type ReferralCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * The data needed to create a Referral.
     */
    data: XOR<ReferralCreateInput, ReferralUncheckedCreateInput>
  }

  /**
   * Referral createMany
   */
  export type ReferralCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Referrals.
     */
    data: ReferralCreateManyInput | ReferralCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Referral createManyAndReturn
   */
  export type ReferralCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * The data used to create many Referrals.
     */
    data: ReferralCreateManyInput | ReferralCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Referral update
   */
  export type ReferralUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * The data needed to update a Referral.
     */
    data: XOR<ReferralUpdateInput, ReferralUncheckedUpdateInput>
    /**
     * Choose, which Referral to update.
     */
    where: ReferralWhereUniqueInput
  }

  /**
   * Referral updateMany
   */
  export type ReferralUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Referrals.
     */
    data: XOR<ReferralUpdateManyMutationInput, ReferralUncheckedUpdateManyInput>
    /**
     * Filter which Referrals to update
     */
    where?: ReferralWhereInput
    /**
     * Limit how many Referrals to update.
     */
    limit?: number
  }

  /**
   * Referral updateManyAndReturn
   */
  export type ReferralUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * The data used to update Referrals.
     */
    data: XOR<ReferralUpdateManyMutationInput, ReferralUncheckedUpdateManyInput>
    /**
     * Filter which Referrals to update
     */
    where?: ReferralWhereInput
    /**
     * Limit how many Referrals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Referral upsert
   */
  export type ReferralUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * The filter to search for the Referral to update in case it exists.
     */
    where: ReferralWhereUniqueInput
    /**
     * In case the Referral found by the `where` argument doesn't exist, create a new Referral with this data.
     */
    create: XOR<ReferralCreateInput, ReferralUncheckedCreateInput>
    /**
     * In case the Referral was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReferralUpdateInput, ReferralUncheckedUpdateInput>
  }

  /**
   * Referral delete
   */
  export type ReferralDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
    /**
     * Filter which Referral to delete.
     */
    where: ReferralWhereUniqueInput
  }

  /**
   * Referral deleteMany
   */
  export type ReferralDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Referrals to delete
     */
    where?: ReferralWhereInput
    /**
     * Limit how many Referrals to delete.
     */
    limit?: number
  }

  /**
   * Referral without action
   */
  export type ReferralDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Referral
     */
    select?: ReferralSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Referral
     */
    omit?: ReferralOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReferralInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CustodialWalletScalarFieldEnum: {
    id: 'id',
    address: 'address',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CustodialWalletScalarFieldEnum = (typeof CustodialWalletScalarFieldEnum)[keyof typeof CustodialWalletScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    wallet_address: 'wallet_address',
    custodial_wallet_id: 'custodial_wallet_id',
    sessionId: 'sessionId',
    siwe_message: 'siwe_message',
    siwe_signature: 'siwe_signature',
    siwe_expires_at: 'siwe_expires_at',
    totalPoints: 'totalPoints',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const WalletScalarFieldEnum: {
    custodialWalletId: 'custodialWalletId',
    address: 'address',
    encryptedPrivateKey: 'encryptedPrivateKey',
    createdAt: 'createdAt',
    balance: 'balance',
    lockedBalance: 'lockedBalance',
    lastUsed: 'lastUsed',
    createdAtTimestamp: 'createdAtTimestamp',
    updatedAt: 'updatedAt'
  };

  export type WalletScalarFieldEnum = (typeof WalletScalarFieldEnum)[keyof typeof WalletScalarFieldEnum]


  export const WalletTransactionScalarFieldEnum: {
    id: 'id',
    custodialWalletId: 'custodialWalletId',
    txHash: 'txHash',
    txType: 'txType',
    amount: 'amount',
    status: 'status',
    blockNumber: 'blockNumber',
    gasUsed: 'gasUsed',
    createdAt: 'createdAt',
    confirmedAt: 'confirmedAt'
  };

  export type WalletTransactionScalarFieldEnum = (typeof WalletTransactionScalarFieldEnum)[keyof typeof WalletTransactionScalarFieldEnum]


  export const BetScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    playerId: 'playerId',
    serverSeedHash: 'serverSeedHash',
    serverSeed: 'serverSeed',
    clientSeed: 'clientSeed',
    randomValue: 'randomValue',
    gameNumber: 'gameNumber',
    wager: 'wager',
    targetMultiplier: 'targetMultiplier',
    limboMultiplier: 'limboMultiplier',
    outcome: 'outcome',
    payout: 'payout',
    status: 'status',
    ethPriceUsd: 'ethPriceUsd',
    wagerUsd: 'wagerUsd',
    payoutUsd: 'payoutUsd',
    betSignature: 'betSignature',
    betMessage: 'betMessage',
    signature: 'signature',
    txHash: 'txHash',
    createdAt: 'createdAt',
    resolvedAt: 'resolvedAt'
  };

  export type BetScalarFieldEnum = (typeof BetScalarFieldEnum)[keyof typeof BetScalarFieldEnum]


  export const UserTaskScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    taskId: 'taskId',
    completed: 'completed',
    points: 'points',
    completedAt: 'completedAt',
    createdAt: 'createdAt'
  };

  export type UserTaskScalarFieldEnum = (typeof UserTaskScalarFieldEnum)[keyof typeof UserTaskScalarFieldEnum]


  export const ReferralScalarFieldEnum: {
    id: 'id',
    referrerId: 'referrerId',
    referredId: 'referredId',
    points: 'points',
    createdAt: 'createdAt'
  };

  export type ReferralScalarFieldEnum = (typeof ReferralScalarFieldEnum)[keyof typeof ReferralScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CustodialWalletWhereInput = {
    AND?: CustodialWalletWhereInput | CustodialWalletWhereInput[]
    OR?: CustodialWalletWhereInput[]
    NOT?: CustodialWalletWhereInput | CustodialWalletWhereInput[]
    id?: StringFilter<"CustodialWallet"> | string
    address?: StringFilter<"CustodialWallet"> | string
    createdAt?: DateTimeFilter<"CustodialWallet"> | Date | string
    updatedAt?: DateTimeFilter<"CustodialWallet"> | Date | string
    wallet?: XOR<WalletNullableScalarRelationFilter, WalletWhereInput> | null
    users?: UserListRelationFilter
  }

  export type CustodialWalletOrderByWithRelationInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    wallet?: WalletOrderByWithRelationInput
    users?: UserOrderByRelationAggregateInput
  }

  export type CustodialWalletWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    address?: string
    AND?: CustodialWalletWhereInput | CustodialWalletWhereInput[]
    OR?: CustodialWalletWhereInput[]
    NOT?: CustodialWalletWhereInput | CustodialWalletWhereInput[]
    createdAt?: DateTimeFilter<"CustodialWallet"> | Date | string
    updatedAt?: DateTimeFilter<"CustodialWallet"> | Date | string
    wallet?: XOR<WalletNullableScalarRelationFilter, WalletWhereInput> | null
    users?: UserListRelationFilter
  }, "id" | "address">

  export type CustodialWalletOrderByWithAggregationInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CustodialWalletCountOrderByAggregateInput
    _max?: CustodialWalletMaxOrderByAggregateInput
    _min?: CustodialWalletMinOrderByAggregateInput
  }

  export type CustodialWalletScalarWhereWithAggregatesInput = {
    AND?: CustodialWalletScalarWhereWithAggregatesInput | CustodialWalletScalarWhereWithAggregatesInput[]
    OR?: CustodialWalletScalarWhereWithAggregatesInput[]
    NOT?: CustodialWalletScalarWhereWithAggregatesInput | CustodialWalletScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CustodialWallet"> | string
    address?: StringWithAggregatesFilter<"CustodialWallet"> | string
    createdAt?: DateTimeWithAggregatesFilter<"CustodialWallet"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CustodialWallet"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    wallet_address?: StringFilter<"User"> | string
    custodial_wallet_id?: StringFilter<"User"> | string
    sessionId?: StringNullableFilter<"User"> | string | null
    siwe_message?: StringNullableFilter<"User"> | string | null
    siwe_signature?: StringNullableFilter<"User"> | string | null
    siwe_expires_at?: DateTimeNullableFilter<"User"> | Date | string | null
    totalPoints?: IntFilter<"User"> | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    custodialWallet?: XOR<CustodialWalletScalarRelationFilter, CustodialWalletWhereInput>
    bets?: BetListRelationFilter
    userTasks?: UserTaskListRelationFilter
    referralsGiven?: ReferralListRelationFilter
    referralsReceived?: ReferralListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    wallet_address?: SortOrder
    custodial_wallet_id?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    siwe_message?: SortOrderInput | SortOrder
    siwe_signature?: SortOrderInput | SortOrder
    siwe_expires_at?: SortOrderInput | SortOrder
    totalPoints?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    custodialWallet?: CustodialWalletOrderByWithRelationInput
    bets?: BetOrderByRelationAggregateInput
    userTasks?: UserTaskOrderByRelationAggregateInput
    referralsGiven?: ReferralOrderByRelationAggregateInput
    referralsReceived?: ReferralOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    wallet_address?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    custodial_wallet_id?: StringFilter<"User"> | string
    sessionId?: StringNullableFilter<"User"> | string | null
    siwe_message?: StringNullableFilter<"User"> | string | null
    siwe_signature?: StringNullableFilter<"User"> | string | null
    siwe_expires_at?: DateTimeNullableFilter<"User"> | Date | string | null
    totalPoints?: IntFilter<"User"> | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    custodialWallet?: XOR<CustodialWalletScalarRelationFilter, CustodialWalletWhereInput>
    bets?: BetListRelationFilter
    userTasks?: UserTaskListRelationFilter
    referralsGiven?: ReferralListRelationFilter
    referralsReceived?: ReferralListRelationFilter
  }, "id" | "wallet_address">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    wallet_address?: SortOrder
    custodial_wallet_id?: SortOrder
    sessionId?: SortOrderInput | SortOrder
    siwe_message?: SortOrderInput | SortOrder
    siwe_signature?: SortOrderInput | SortOrder
    siwe_expires_at?: SortOrderInput | SortOrder
    totalPoints?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    wallet_address?: StringWithAggregatesFilter<"User"> | string
    custodial_wallet_id?: StringWithAggregatesFilter<"User"> | string
    sessionId?: StringNullableWithAggregatesFilter<"User"> | string | null
    siwe_message?: StringNullableWithAggregatesFilter<"User"> | string | null
    siwe_signature?: StringNullableWithAggregatesFilter<"User"> | string | null
    siwe_expires_at?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    totalPoints?: IntWithAggregatesFilter<"User"> | number
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type WalletWhereInput = {
    AND?: WalletWhereInput | WalletWhereInput[]
    OR?: WalletWhereInput[]
    NOT?: WalletWhereInput | WalletWhereInput[]
    custodialWalletId?: StringFilter<"Wallet"> | string
    address?: StringFilter<"Wallet"> | string
    encryptedPrivateKey?: StringFilter<"Wallet"> | string
    createdAt?: BigIntFilter<"Wallet"> | bigint | number
    balance?: StringFilter<"Wallet"> | string
    lockedBalance?: StringFilter<"Wallet"> | string
    lastUsed?: BigIntNullableFilter<"Wallet"> | bigint | number | null
    createdAtTimestamp?: DateTimeFilter<"Wallet"> | Date | string
    updatedAt?: DateTimeFilter<"Wallet"> | Date | string
    custodialWallet?: XOR<CustodialWalletScalarRelationFilter, CustodialWalletWhereInput>
    transactions?: WalletTransactionListRelationFilter
  }

  export type WalletOrderByWithRelationInput = {
    custodialWalletId?: SortOrder
    address?: SortOrder
    encryptedPrivateKey?: SortOrder
    createdAt?: SortOrder
    balance?: SortOrder
    lockedBalance?: SortOrder
    lastUsed?: SortOrderInput | SortOrder
    createdAtTimestamp?: SortOrder
    updatedAt?: SortOrder
    custodialWallet?: CustodialWalletOrderByWithRelationInput
    transactions?: WalletTransactionOrderByRelationAggregateInput
  }

  export type WalletWhereUniqueInput = Prisma.AtLeast<{
    custodialWalletId?: string
    address?: string
    AND?: WalletWhereInput | WalletWhereInput[]
    OR?: WalletWhereInput[]
    NOT?: WalletWhereInput | WalletWhereInput[]
    encryptedPrivateKey?: StringFilter<"Wallet"> | string
    createdAt?: BigIntFilter<"Wallet"> | bigint | number
    balance?: StringFilter<"Wallet"> | string
    lockedBalance?: StringFilter<"Wallet"> | string
    lastUsed?: BigIntNullableFilter<"Wallet"> | bigint | number | null
    createdAtTimestamp?: DateTimeFilter<"Wallet"> | Date | string
    updatedAt?: DateTimeFilter<"Wallet"> | Date | string
    custodialWallet?: XOR<CustodialWalletScalarRelationFilter, CustodialWalletWhereInput>
    transactions?: WalletTransactionListRelationFilter
  }, "custodialWalletId" | "address">

  export type WalletOrderByWithAggregationInput = {
    custodialWalletId?: SortOrder
    address?: SortOrder
    encryptedPrivateKey?: SortOrder
    createdAt?: SortOrder
    balance?: SortOrder
    lockedBalance?: SortOrder
    lastUsed?: SortOrderInput | SortOrder
    createdAtTimestamp?: SortOrder
    updatedAt?: SortOrder
    _count?: WalletCountOrderByAggregateInput
    _avg?: WalletAvgOrderByAggregateInput
    _max?: WalletMaxOrderByAggregateInput
    _min?: WalletMinOrderByAggregateInput
    _sum?: WalletSumOrderByAggregateInput
  }

  export type WalletScalarWhereWithAggregatesInput = {
    AND?: WalletScalarWhereWithAggregatesInput | WalletScalarWhereWithAggregatesInput[]
    OR?: WalletScalarWhereWithAggregatesInput[]
    NOT?: WalletScalarWhereWithAggregatesInput | WalletScalarWhereWithAggregatesInput[]
    custodialWalletId?: StringWithAggregatesFilter<"Wallet"> | string
    address?: StringWithAggregatesFilter<"Wallet"> | string
    encryptedPrivateKey?: StringWithAggregatesFilter<"Wallet"> | string
    createdAt?: BigIntWithAggregatesFilter<"Wallet"> | bigint | number
    balance?: StringWithAggregatesFilter<"Wallet"> | string
    lockedBalance?: StringWithAggregatesFilter<"Wallet"> | string
    lastUsed?: BigIntNullableWithAggregatesFilter<"Wallet"> | bigint | number | null
    createdAtTimestamp?: DateTimeWithAggregatesFilter<"Wallet"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Wallet"> | Date | string
  }

  export type WalletTransactionWhereInput = {
    AND?: WalletTransactionWhereInput | WalletTransactionWhereInput[]
    OR?: WalletTransactionWhereInput[]
    NOT?: WalletTransactionWhereInput | WalletTransactionWhereInput[]
    id?: IntFilter<"WalletTransaction"> | number
    custodialWalletId?: StringFilter<"WalletTransaction"> | string
    txHash?: StringNullableFilter<"WalletTransaction"> | string | null
    txType?: StringFilter<"WalletTransaction"> | string
    amount?: StringFilter<"WalletTransaction"> | string
    status?: StringFilter<"WalletTransaction"> | string
    blockNumber?: BigIntNullableFilter<"WalletTransaction"> | bigint | number | null
    gasUsed?: StringNullableFilter<"WalletTransaction"> | string | null
    createdAt?: DateTimeFilter<"WalletTransaction"> | Date | string
    confirmedAt?: DateTimeNullableFilter<"WalletTransaction"> | Date | string | null
    wallet?: XOR<WalletScalarRelationFilter, WalletWhereInput>
  }

  export type WalletTransactionOrderByWithRelationInput = {
    id?: SortOrder
    custodialWalletId?: SortOrder
    txHash?: SortOrderInput | SortOrder
    txType?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    blockNumber?: SortOrderInput | SortOrder
    gasUsed?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    wallet?: WalletOrderByWithRelationInput
  }

  export type WalletTransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: WalletTransactionWhereInput | WalletTransactionWhereInput[]
    OR?: WalletTransactionWhereInput[]
    NOT?: WalletTransactionWhereInput | WalletTransactionWhereInput[]
    custodialWalletId?: StringFilter<"WalletTransaction"> | string
    txHash?: StringNullableFilter<"WalletTransaction"> | string | null
    txType?: StringFilter<"WalletTransaction"> | string
    amount?: StringFilter<"WalletTransaction"> | string
    status?: StringFilter<"WalletTransaction"> | string
    blockNumber?: BigIntNullableFilter<"WalletTransaction"> | bigint | number | null
    gasUsed?: StringNullableFilter<"WalletTransaction"> | string | null
    createdAt?: DateTimeFilter<"WalletTransaction"> | Date | string
    confirmedAt?: DateTimeNullableFilter<"WalletTransaction"> | Date | string | null
    wallet?: XOR<WalletScalarRelationFilter, WalletWhereInput>
  }, "id">

  export type WalletTransactionOrderByWithAggregationInput = {
    id?: SortOrder
    custodialWalletId?: SortOrder
    txHash?: SortOrderInput | SortOrder
    txType?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    blockNumber?: SortOrderInput | SortOrder
    gasUsed?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    _count?: WalletTransactionCountOrderByAggregateInput
    _avg?: WalletTransactionAvgOrderByAggregateInput
    _max?: WalletTransactionMaxOrderByAggregateInput
    _min?: WalletTransactionMinOrderByAggregateInput
    _sum?: WalletTransactionSumOrderByAggregateInput
  }

  export type WalletTransactionScalarWhereWithAggregatesInput = {
    AND?: WalletTransactionScalarWhereWithAggregatesInput | WalletTransactionScalarWhereWithAggregatesInput[]
    OR?: WalletTransactionScalarWhereWithAggregatesInput[]
    NOT?: WalletTransactionScalarWhereWithAggregatesInput | WalletTransactionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"WalletTransaction"> | number
    custodialWalletId?: StringWithAggregatesFilter<"WalletTransaction"> | string
    txHash?: StringNullableWithAggregatesFilter<"WalletTransaction"> | string | null
    txType?: StringWithAggregatesFilter<"WalletTransaction"> | string
    amount?: StringWithAggregatesFilter<"WalletTransaction"> | string
    status?: StringWithAggregatesFilter<"WalletTransaction"> | string
    blockNumber?: BigIntNullableWithAggregatesFilter<"WalletTransaction"> | bigint | number | null
    gasUsed?: StringNullableWithAggregatesFilter<"WalletTransaction"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"WalletTransaction"> | Date | string
    confirmedAt?: DateTimeNullableWithAggregatesFilter<"WalletTransaction"> | Date | string | null
  }

  export type BetWhereInput = {
    AND?: BetWhereInput | BetWhereInput[]
    OR?: BetWhereInput[]
    NOT?: BetWhereInput | BetWhereInput[]
    id?: StringFilter<"Bet"> | string
    userId?: StringFilter<"Bet"> | string
    playerId?: StringFilter<"Bet"> | string
    serverSeedHash?: StringFilter<"Bet"> | string
    serverSeed?: StringNullableFilter<"Bet"> | string | null
    clientSeed?: StringNullableFilter<"Bet"> | string | null
    randomValue?: StringFilter<"Bet"> | string
    gameNumber?: StringFilter<"Bet"> | string
    wager?: StringFilter<"Bet"> | string
    targetMultiplier?: StringFilter<"Bet"> | string
    limboMultiplier?: StringNullableFilter<"Bet"> | string | null
    outcome?: StringFilter<"Bet"> | string
    payout?: StringFilter<"Bet"> | string
    status?: StringFilter<"Bet"> | string
    ethPriceUsd?: StringNullableFilter<"Bet"> | string | null
    wagerUsd?: StringNullableFilter<"Bet"> | string | null
    payoutUsd?: StringNullableFilter<"Bet"> | string | null
    betSignature?: StringNullableFilter<"Bet"> | string | null
    betMessage?: StringNullableFilter<"Bet"> | string | null
    signature?: StringNullableFilter<"Bet"> | string | null
    txHash?: StringNullableFilter<"Bet"> | string | null
    createdAt?: DateTimeFilter<"Bet"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"Bet"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type BetOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    playerId?: SortOrder
    serverSeedHash?: SortOrder
    serverSeed?: SortOrderInput | SortOrder
    clientSeed?: SortOrderInput | SortOrder
    randomValue?: SortOrder
    gameNumber?: SortOrder
    wager?: SortOrder
    targetMultiplier?: SortOrder
    limboMultiplier?: SortOrderInput | SortOrder
    outcome?: SortOrder
    payout?: SortOrder
    status?: SortOrder
    ethPriceUsd?: SortOrderInput | SortOrder
    wagerUsd?: SortOrderInput | SortOrder
    payoutUsd?: SortOrderInput | SortOrder
    betSignature?: SortOrderInput | SortOrder
    betMessage?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    txHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type BetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BetWhereInput | BetWhereInput[]
    OR?: BetWhereInput[]
    NOT?: BetWhereInput | BetWhereInput[]
    userId?: StringFilter<"Bet"> | string
    playerId?: StringFilter<"Bet"> | string
    serverSeedHash?: StringFilter<"Bet"> | string
    serverSeed?: StringNullableFilter<"Bet"> | string | null
    clientSeed?: StringNullableFilter<"Bet"> | string | null
    randomValue?: StringFilter<"Bet"> | string
    gameNumber?: StringFilter<"Bet"> | string
    wager?: StringFilter<"Bet"> | string
    targetMultiplier?: StringFilter<"Bet"> | string
    limboMultiplier?: StringNullableFilter<"Bet"> | string | null
    outcome?: StringFilter<"Bet"> | string
    payout?: StringFilter<"Bet"> | string
    status?: StringFilter<"Bet"> | string
    ethPriceUsd?: StringNullableFilter<"Bet"> | string | null
    wagerUsd?: StringNullableFilter<"Bet"> | string | null
    payoutUsd?: StringNullableFilter<"Bet"> | string | null
    betSignature?: StringNullableFilter<"Bet"> | string | null
    betMessage?: StringNullableFilter<"Bet"> | string | null
    signature?: StringNullableFilter<"Bet"> | string | null
    txHash?: StringNullableFilter<"Bet"> | string | null
    createdAt?: DateTimeFilter<"Bet"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"Bet"> | Date | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type BetOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    playerId?: SortOrder
    serverSeedHash?: SortOrder
    serverSeed?: SortOrderInput | SortOrder
    clientSeed?: SortOrderInput | SortOrder
    randomValue?: SortOrder
    gameNumber?: SortOrder
    wager?: SortOrder
    targetMultiplier?: SortOrder
    limboMultiplier?: SortOrderInput | SortOrder
    outcome?: SortOrder
    payout?: SortOrder
    status?: SortOrder
    ethPriceUsd?: SortOrderInput | SortOrder
    wagerUsd?: SortOrderInput | SortOrder
    payoutUsd?: SortOrderInput | SortOrder
    betSignature?: SortOrderInput | SortOrder
    betMessage?: SortOrderInput | SortOrder
    signature?: SortOrderInput | SortOrder
    txHash?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    _count?: BetCountOrderByAggregateInput
    _max?: BetMaxOrderByAggregateInput
    _min?: BetMinOrderByAggregateInput
  }

  export type BetScalarWhereWithAggregatesInput = {
    AND?: BetScalarWhereWithAggregatesInput | BetScalarWhereWithAggregatesInput[]
    OR?: BetScalarWhereWithAggregatesInput[]
    NOT?: BetScalarWhereWithAggregatesInput | BetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Bet"> | string
    userId?: StringWithAggregatesFilter<"Bet"> | string
    playerId?: StringWithAggregatesFilter<"Bet"> | string
    serverSeedHash?: StringWithAggregatesFilter<"Bet"> | string
    serverSeed?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    clientSeed?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    randomValue?: StringWithAggregatesFilter<"Bet"> | string
    gameNumber?: StringWithAggregatesFilter<"Bet"> | string
    wager?: StringWithAggregatesFilter<"Bet"> | string
    targetMultiplier?: StringWithAggregatesFilter<"Bet"> | string
    limboMultiplier?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    outcome?: StringWithAggregatesFilter<"Bet"> | string
    payout?: StringWithAggregatesFilter<"Bet"> | string
    status?: StringWithAggregatesFilter<"Bet"> | string
    ethPriceUsd?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    wagerUsd?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    payoutUsd?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    betSignature?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    betMessage?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    signature?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    txHash?: StringNullableWithAggregatesFilter<"Bet"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Bet"> | Date | string
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"Bet"> | Date | string | null
  }

  export type UserTaskWhereInput = {
    AND?: UserTaskWhereInput | UserTaskWhereInput[]
    OR?: UserTaskWhereInput[]
    NOT?: UserTaskWhereInput | UserTaskWhereInput[]
    id?: StringFilter<"UserTask"> | string
    userId?: StringFilter<"UserTask"> | string
    taskId?: StringFilter<"UserTask"> | string
    completed?: BoolFilter<"UserTask"> | boolean
    points?: IntFilter<"UserTask"> | number
    completedAt?: DateTimeNullableFilter<"UserTask"> | Date | string | null
    createdAt?: DateTimeFilter<"UserTask"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserTaskOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    taskId?: SortOrder
    completed?: SortOrder
    points?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserTaskWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_taskId?: UserTaskUserIdTaskIdCompoundUniqueInput
    AND?: UserTaskWhereInput | UserTaskWhereInput[]
    OR?: UserTaskWhereInput[]
    NOT?: UserTaskWhereInput | UserTaskWhereInput[]
    userId?: StringFilter<"UserTask"> | string
    taskId?: StringFilter<"UserTask"> | string
    completed?: BoolFilter<"UserTask"> | boolean
    points?: IntFilter<"UserTask"> | number
    completedAt?: DateTimeNullableFilter<"UserTask"> | Date | string | null
    createdAt?: DateTimeFilter<"UserTask"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_taskId">

  export type UserTaskOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    taskId?: SortOrder
    completed?: SortOrder
    points?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: UserTaskCountOrderByAggregateInput
    _avg?: UserTaskAvgOrderByAggregateInput
    _max?: UserTaskMaxOrderByAggregateInput
    _min?: UserTaskMinOrderByAggregateInput
    _sum?: UserTaskSumOrderByAggregateInput
  }

  export type UserTaskScalarWhereWithAggregatesInput = {
    AND?: UserTaskScalarWhereWithAggregatesInput | UserTaskScalarWhereWithAggregatesInput[]
    OR?: UserTaskScalarWhereWithAggregatesInput[]
    NOT?: UserTaskScalarWhereWithAggregatesInput | UserTaskScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserTask"> | string
    userId?: StringWithAggregatesFilter<"UserTask"> | string
    taskId?: StringWithAggregatesFilter<"UserTask"> | string
    completed?: BoolWithAggregatesFilter<"UserTask"> | boolean
    points?: IntWithAggregatesFilter<"UserTask"> | number
    completedAt?: DateTimeNullableWithAggregatesFilter<"UserTask"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserTask"> | Date | string
  }

  export type ReferralWhereInput = {
    AND?: ReferralWhereInput | ReferralWhereInput[]
    OR?: ReferralWhereInput[]
    NOT?: ReferralWhereInput | ReferralWhereInput[]
    id?: StringFilter<"Referral"> | string
    referrerId?: StringFilter<"Referral"> | string
    referredId?: StringFilter<"Referral"> | string
    points?: IntFilter<"Referral"> | number
    createdAt?: DateTimeFilter<"Referral"> | Date | string
    referrer?: XOR<UserScalarRelationFilter, UserWhereInput>
    referred?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type ReferralOrderByWithRelationInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
    referrer?: UserOrderByWithRelationInput
    referred?: UserOrderByWithRelationInput
  }

  export type ReferralWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    referrerId_referredId?: ReferralReferrerIdReferredIdCompoundUniqueInput
    AND?: ReferralWhereInput | ReferralWhereInput[]
    OR?: ReferralWhereInput[]
    NOT?: ReferralWhereInput | ReferralWhereInput[]
    referrerId?: StringFilter<"Referral"> | string
    referredId?: StringFilter<"Referral"> | string
    points?: IntFilter<"Referral"> | number
    createdAt?: DateTimeFilter<"Referral"> | Date | string
    referrer?: XOR<UserScalarRelationFilter, UserWhereInput>
    referred?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "referrerId_referredId">

  export type ReferralOrderByWithAggregationInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
    _count?: ReferralCountOrderByAggregateInput
    _avg?: ReferralAvgOrderByAggregateInput
    _max?: ReferralMaxOrderByAggregateInput
    _min?: ReferralMinOrderByAggregateInput
    _sum?: ReferralSumOrderByAggregateInput
  }

  export type ReferralScalarWhereWithAggregatesInput = {
    AND?: ReferralScalarWhereWithAggregatesInput | ReferralScalarWhereWithAggregatesInput[]
    OR?: ReferralScalarWhereWithAggregatesInput[]
    NOT?: ReferralScalarWhereWithAggregatesInput | ReferralScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Referral"> | string
    referrerId?: StringWithAggregatesFilter<"Referral"> | string
    referredId?: StringWithAggregatesFilter<"Referral"> | string
    points?: IntWithAggregatesFilter<"Referral"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Referral"> | Date | string
  }

  export type CustodialWalletCreateInput = {
    id?: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    wallet?: WalletCreateNestedOneWithoutCustodialWalletInput
    users?: UserCreateNestedManyWithoutCustodialWalletInput
  }

  export type CustodialWalletUncheckedCreateInput = {
    id?: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    wallet?: WalletUncheckedCreateNestedOneWithoutCustodialWalletInput
    users?: UserUncheckedCreateNestedManyWithoutCustodialWalletInput
  }

  export type CustodialWalletUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wallet?: WalletUpdateOneWithoutCustodialWalletNestedInput
    users?: UserUpdateManyWithoutCustodialWalletNestedInput
  }

  export type CustodialWalletUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wallet?: WalletUncheckedUpdateOneWithoutCustodialWalletNestedInput
    users?: UserUncheckedUpdateManyWithoutCustodialWalletNestedInput
  }

  export type CustodialWalletCreateManyInput = {
    id?: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CustodialWalletUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CustodialWalletUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    custodialWallet: CustodialWalletCreateNestedOneWithoutUsersInput
    bets?: BetCreateNestedManyWithoutUserInput
    userTasks?: UserTaskCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralCreateNestedManyWithoutReferredInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    wallet_address: string
    custodial_wallet_id: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bets?: BetUncheckedCreateNestedManyWithoutUserInput
    userTasks?: UserTaskUncheckedCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralUncheckedCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralUncheckedCreateNestedManyWithoutReferredInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    custodialWallet?: CustodialWalletUpdateOneRequiredWithoutUsersNestedInput
    bets?: BetUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUpdateManyWithoutReferredNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    custodial_wallet_id?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bets?: BetUncheckedUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUncheckedUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUncheckedUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUncheckedUpdateManyWithoutReferredNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    wallet_address: string
    custodial_wallet_id: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    custodial_wallet_id?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WalletCreateInput = {
    address: string
    encryptedPrivateKey: string
    createdAt: bigint | number
    balance?: string
    lockedBalance?: string
    lastUsed?: bigint | number | null
    createdAtTimestamp?: Date | string
    updatedAt?: Date | string
    custodialWallet: CustodialWalletCreateNestedOneWithoutWalletInput
    transactions?: WalletTransactionCreateNestedManyWithoutWalletInput
  }

  export type WalletUncheckedCreateInput = {
    custodialWalletId: string
    address: string
    encryptedPrivateKey: string
    createdAt: bigint | number
    balance?: string
    lockedBalance?: string
    lastUsed?: bigint | number | null
    createdAtTimestamp?: Date | string
    updatedAt?: Date | string
    transactions?: WalletTransactionUncheckedCreateNestedManyWithoutWalletInput
  }

  export type WalletUpdateInput = {
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    custodialWallet?: CustodialWalletUpdateOneRequiredWithoutWalletNestedInput
    transactions?: WalletTransactionUpdateManyWithoutWalletNestedInput
  }

  export type WalletUncheckedUpdateInput = {
    custodialWalletId?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: WalletTransactionUncheckedUpdateManyWithoutWalletNestedInput
  }

  export type WalletCreateManyInput = {
    custodialWalletId: string
    address: string
    encryptedPrivateKey: string
    createdAt: bigint | number
    balance?: string
    lockedBalance?: string
    lastUsed?: bigint | number | null
    createdAtTimestamp?: Date | string
    updatedAt?: Date | string
  }

  export type WalletUpdateManyMutationInput = {
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WalletUncheckedUpdateManyInput = {
    custodialWalletId?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WalletTransactionCreateInput = {
    txHash?: string | null
    txType: string
    amount: string
    status: string
    blockNumber?: bigint | number | null
    gasUsed?: string | null
    createdAt?: Date | string
    confirmedAt?: Date | string | null
    wallet: WalletCreateNestedOneWithoutTransactionsInput
  }

  export type WalletTransactionUncheckedCreateInput = {
    id?: number
    custodialWalletId: string
    txHash?: string | null
    txType: string
    amount: string
    status: string
    blockNumber?: bigint | number | null
    gasUsed?: string | null
    createdAt?: Date | string
    confirmedAt?: Date | string | null
  }

  export type WalletTransactionUpdateInput = {
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    txType?: StringFieldUpdateOperationsInput | string
    amount?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    blockNumber?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    gasUsed?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    wallet?: WalletUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type WalletTransactionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    custodialWalletId?: StringFieldUpdateOperationsInput | string
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    txType?: StringFieldUpdateOperationsInput | string
    amount?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    blockNumber?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    gasUsed?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WalletTransactionCreateManyInput = {
    id?: number
    custodialWalletId: string
    txHash?: string | null
    txType: string
    amount: string
    status: string
    blockNumber?: bigint | number | null
    gasUsed?: string | null
    createdAt?: Date | string
    confirmedAt?: Date | string | null
  }

  export type WalletTransactionUpdateManyMutationInput = {
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    txType?: StringFieldUpdateOperationsInput | string
    amount?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    blockNumber?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    gasUsed?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WalletTransactionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    custodialWalletId?: StringFieldUpdateOperationsInput | string
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    txType?: StringFieldUpdateOperationsInput | string
    amount?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    blockNumber?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    gasUsed?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BetCreateInput = {
    id?: string
    playerId: string
    serverSeedHash: string
    serverSeed?: string | null
    clientSeed?: string | null
    randomValue: string
    gameNumber: string
    wager: string
    targetMultiplier: string
    limboMultiplier?: string | null
    outcome: string
    payout: string
    status: string
    ethPriceUsd?: string | null
    wagerUsd?: string | null
    payoutUsd?: string | null
    betSignature?: string | null
    betMessage?: string | null
    signature?: string | null
    txHash?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
    user: UserCreateNestedOneWithoutBetsInput
  }

  export type BetUncheckedCreateInput = {
    id?: string
    userId: string
    playerId: string
    serverSeedHash: string
    serverSeed?: string | null
    clientSeed?: string | null
    randomValue: string
    gameNumber: string
    wager: string
    targetMultiplier: string
    limboMultiplier?: string | null
    outcome: string
    payout: string
    status: string
    ethPriceUsd?: string | null
    wagerUsd?: string | null
    payoutUsd?: string | null
    betSignature?: string | null
    betMessage?: string | null
    signature?: string | null
    txHash?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    serverSeedHash?: StringFieldUpdateOperationsInput | string
    serverSeed?: NullableStringFieldUpdateOperationsInput | string | null
    clientSeed?: NullableStringFieldUpdateOperationsInput | string | null
    randomValue?: StringFieldUpdateOperationsInput | string
    gameNumber?: StringFieldUpdateOperationsInput | string
    wager?: StringFieldUpdateOperationsInput | string
    targetMultiplier?: StringFieldUpdateOperationsInput | string
    limboMultiplier?: NullableStringFieldUpdateOperationsInput | string | null
    outcome?: StringFieldUpdateOperationsInput | string
    payout?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    ethPriceUsd?: NullableStringFieldUpdateOperationsInput | string | null
    wagerUsd?: NullableStringFieldUpdateOperationsInput | string | null
    payoutUsd?: NullableStringFieldUpdateOperationsInput | string | null
    betSignature?: NullableStringFieldUpdateOperationsInput | string | null
    betMessage?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutBetsNestedInput
  }

  export type BetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    serverSeedHash?: StringFieldUpdateOperationsInput | string
    serverSeed?: NullableStringFieldUpdateOperationsInput | string | null
    clientSeed?: NullableStringFieldUpdateOperationsInput | string | null
    randomValue?: StringFieldUpdateOperationsInput | string
    gameNumber?: StringFieldUpdateOperationsInput | string
    wager?: StringFieldUpdateOperationsInput | string
    targetMultiplier?: StringFieldUpdateOperationsInput | string
    limboMultiplier?: NullableStringFieldUpdateOperationsInput | string | null
    outcome?: StringFieldUpdateOperationsInput | string
    payout?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    ethPriceUsd?: NullableStringFieldUpdateOperationsInput | string | null
    wagerUsd?: NullableStringFieldUpdateOperationsInput | string | null
    payoutUsd?: NullableStringFieldUpdateOperationsInput | string | null
    betSignature?: NullableStringFieldUpdateOperationsInput | string | null
    betMessage?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BetCreateManyInput = {
    id?: string
    userId: string
    playerId: string
    serverSeedHash: string
    serverSeed?: string | null
    clientSeed?: string | null
    randomValue: string
    gameNumber: string
    wager: string
    targetMultiplier: string
    limboMultiplier?: string | null
    outcome: string
    payout: string
    status: string
    ethPriceUsd?: string | null
    wagerUsd?: string | null
    payoutUsd?: string | null
    betSignature?: string | null
    betMessage?: string | null
    signature?: string | null
    txHash?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    serverSeedHash?: StringFieldUpdateOperationsInput | string
    serverSeed?: NullableStringFieldUpdateOperationsInput | string | null
    clientSeed?: NullableStringFieldUpdateOperationsInput | string | null
    randomValue?: StringFieldUpdateOperationsInput | string
    gameNumber?: StringFieldUpdateOperationsInput | string
    wager?: StringFieldUpdateOperationsInput | string
    targetMultiplier?: StringFieldUpdateOperationsInput | string
    limboMultiplier?: NullableStringFieldUpdateOperationsInput | string | null
    outcome?: StringFieldUpdateOperationsInput | string
    payout?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    ethPriceUsd?: NullableStringFieldUpdateOperationsInput | string | null
    wagerUsd?: NullableStringFieldUpdateOperationsInput | string | null
    payoutUsd?: NullableStringFieldUpdateOperationsInput | string | null
    betSignature?: NullableStringFieldUpdateOperationsInput | string | null
    betMessage?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    serverSeedHash?: StringFieldUpdateOperationsInput | string
    serverSeed?: NullableStringFieldUpdateOperationsInput | string | null
    clientSeed?: NullableStringFieldUpdateOperationsInput | string | null
    randomValue?: StringFieldUpdateOperationsInput | string
    gameNumber?: StringFieldUpdateOperationsInput | string
    wager?: StringFieldUpdateOperationsInput | string
    targetMultiplier?: StringFieldUpdateOperationsInput | string
    limboMultiplier?: NullableStringFieldUpdateOperationsInput | string | null
    outcome?: StringFieldUpdateOperationsInput | string
    payout?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    ethPriceUsd?: NullableStringFieldUpdateOperationsInput | string | null
    wagerUsd?: NullableStringFieldUpdateOperationsInput | string | null
    payoutUsd?: NullableStringFieldUpdateOperationsInput | string | null
    betSignature?: NullableStringFieldUpdateOperationsInput | string | null
    betMessage?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserTaskCreateInput = {
    id?: string
    taskId: string
    completed?: boolean
    points?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutUserTasksInput
  }

  export type UserTaskUncheckedCreateInput = {
    id?: string
    userId: string
    taskId: string
    completed?: boolean
    points?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type UserTaskUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutUserTasksNestedInput
  }

  export type UserTaskUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTaskCreateManyInput = {
    id?: string
    userId: string
    taskId: string
    completed?: boolean
    points?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type UserTaskUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTaskUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReferralCreateInput = {
    id?: string
    points?: number
    createdAt?: Date | string
    referrer: UserCreateNestedOneWithoutReferralsGivenInput
    referred: UserCreateNestedOneWithoutReferralsReceivedInput
  }

  export type ReferralUncheckedCreateInput = {
    id?: string
    referrerId: string
    referredId: string
    points?: number
    createdAt?: Date | string
  }

  export type ReferralUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: UserUpdateOneRequiredWithoutReferralsGivenNestedInput
    referred?: UserUpdateOneRequiredWithoutReferralsReceivedNestedInput
  }

  export type ReferralUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReferralCreateManyInput = {
    id?: string
    referrerId: string
    referredId: string
    points?: number
    createdAt?: Date | string
  }

  export type ReferralUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReferralUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type WalletNullableScalarRelationFilter = {
    is?: WalletWhereInput | null
    isNot?: WalletWhereInput | null
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CustodialWalletCountOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustodialWalletMaxOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CustodialWalletMinOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type CustodialWalletScalarRelationFilter = {
    is?: CustodialWalletWhereInput
    isNot?: CustodialWalletWhereInput
  }

  export type BetListRelationFilter = {
    every?: BetWhereInput
    some?: BetWhereInput
    none?: BetWhereInput
  }

  export type UserTaskListRelationFilter = {
    every?: UserTaskWhereInput
    some?: UserTaskWhereInput
    none?: UserTaskWhereInput
  }

  export type ReferralListRelationFilter = {
    every?: ReferralWhereInput
    some?: ReferralWhereInput
    none?: ReferralWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTaskOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReferralOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    wallet_address?: SortOrder
    custodial_wallet_id?: SortOrder
    sessionId?: SortOrder
    siwe_message?: SortOrder
    siwe_signature?: SortOrder
    siwe_expires_at?: SortOrder
    totalPoints?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    totalPoints?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    wallet_address?: SortOrder
    custodial_wallet_id?: SortOrder
    sessionId?: SortOrder
    siwe_message?: SortOrder
    siwe_signature?: SortOrder
    siwe_expires_at?: SortOrder
    totalPoints?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    wallet_address?: SortOrder
    custodial_wallet_id?: SortOrder
    sessionId?: SortOrder
    siwe_message?: SortOrder
    siwe_signature?: SortOrder
    siwe_expires_at?: SortOrder
    totalPoints?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    totalPoints?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type WalletTransactionListRelationFilter = {
    every?: WalletTransactionWhereInput
    some?: WalletTransactionWhereInput
    none?: WalletTransactionWhereInput
  }

  export type WalletTransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WalletCountOrderByAggregateInput = {
    custodialWalletId?: SortOrder
    address?: SortOrder
    encryptedPrivateKey?: SortOrder
    createdAt?: SortOrder
    balance?: SortOrder
    lockedBalance?: SortOrder
    lastUsed?: SortOrder
    createdAtTimestamp?: SortOrder
    updatedAt?: SortOrder
  }

  export type WalletAvgOrderByAggregateInput = {
    createdAt?: SortOrder
    lastUsed?: SortOrder
  }

  export type WalletMaxOrderByAggregateInput = {
    custodialWalletId?: SortOrder
    address?: SortOrder
    encryptedPrivateKey?: SortOrder
    createdAt?: SortOrder
    balance?: SortOrder
    lockedBalance?: SortOrder
    lastUsed?: SortOrder
    createdAtTimestamp?: SortOrder
    updatedAt?: SortOrder
  }

  export type WalletMinOrderByAggregateInput = {
    custodialWalletId?: SortOrder
    address?: SortOrder
    encryptedPrivateKey?: SortOrder
    createdAt?: SortOrder
    balance?: SortOrder
    lockedBalance?: SortOrder
    lastUsed?: SortOrder
    createdAtTimestamp?: SortOrder
    updatedAt?: SortOrder
  }

  export type WalletSumOrderByAggregateInput = {
    createdAt?: SortOrder
    lastUsed?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type WalletScalarRelationFilter = {
    is?: WalletWhereInput
    isNot?: WalletWhereInput
  }

  export type WalletTransactionCountOrderByAggregateInput = {
    id?: SortOrder
    custodialWalletId?: SortOrder
    txHash?: SortOrder
    txType?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    blockNumber?: SortOrder
    gasUsed?: SortOrder
    createdAt?: SortOrder
    confirmedAt?: SortOrder
  }

  export type WalletTransactionAvgOrderByAggregateInput = {
    id?: SortOrder
    blockNumber?: SortOrder
  }

  export type WalletTransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    custodialWalletId?: SortOrder
    txHash?: SortOrder
    txType?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    blockNumber?: SortOrder
    gasUsed?: SortOrder
    createdAt?: SortOrder
    confirmedAt?: SortOrder
  }

  export type WalletTransactionMinOrderByAggregateInput = {
    id?: SortOrder
    custodialWalletId?: SortOrder
    txHash?: SortOrder
    txType?: SortOrder
    amount?: SortOrder
    status?: SortOrder
    blockNumber?: SortOrder
    gasUsed?: SortOrder
    createdAt?: SortOrder
    confirmedAt?: SortOrder
  }

  export type WalletTransactionSumOrderByAggregateInput = {
    id?: SortOrder
    blockNumber?: SortOrder
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type BetCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    playerId?: SortOrder
    serverSeedHash?: SortOrder
    serverSeed?: SortOrder
    clientSeed?: SortOrder
    randomValue?: SortOrder
    gameNumber?: SortOrder
    wager?: SortOrder
    targetMultiplier?: SortOrder
    limboMultiplier?: SortOrder
    outcome?: SortOrder
    payout?: SortOrder
    status?: SortOrder
    ethPriceUsd?: SortOrder
    wagerUsd?: SortOrder
    payoutUsd?: SortOrder
    betSignature?: SortOrder
    betMessage?: SortOrder
    signature?: SortOrder
    txHash?: SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type BetMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    playerId?: SortOrder
    serverSeedHash?: SortOrder
    serverSeed?: SortOrder
    clientSeed?: SortOrder
    randomValue?: SortOrder
    gameNumber?: SortOrder
    wager?: SortOrder
    targetMultiplier?: SortOrder
    limboMultiplier?: SortOrder
    outcome?: SortOrder
    payout?: SortOrder
    status?: SortOrder
    ethPriceUsd?: SortOrder
    wagerUsd?: SortOrder
    payoutUsd?: SortOrder
    betSignature?: SortOrder
    betMessage?: SortOrder
    signature?: SortOrder
    txHash?: SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type BetMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    playerId?: SortOrder
    serverSeedHash?: SortOrder
    serverSeed?: SortOrder
    clientSeed?: SortOrder
    randomValue?: SortOrder
    gameNumber?: SortOrder
    wager?: SortOrder
    targetMultiplier?: SortOrder
    limboMultiplier?: SortOrder
    outcome?: SortOrder
    payout?: SortOrder
    status?: SortOrder
    ethPriceUsd?: SortOrder
    wagerUsd?: SortOrder
    payoutUsd?: SortOrder
    betSignature?: SortOrder
    betMessage?: SortOrder
    signature?: SortOrder
    txHash?: SortOrder
    createdAt?: SortOrder
    resolvedAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UserTaskUserIdTaskIdCompoundUniqueInput = {
    userId: string
    taskId: string
  }

  export type UserTaskCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    taskId?: SortOrder
    completed?: SortOrder
    points?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type UserTaskAvgOrderByAggregateInput = {
    points?: SortOrder
  }

  export type UserTaskMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    taskId?: SortOrder
    completed?: SortOrder
    points?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type UserTaskMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    taskId?: SortOrder
    completed?: SortOrder
    points?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type UserTaskSumOrderByAggregateInput = {
    points?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ReferralReferrerIdReferredIdCompoundUniqueInput = {
    referrerId: string
    referredId: string
  }

  export type ReferralCountOrderByAggregateInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
  }

  export type ReferralAvgOrderByAggregateInput = {
    points?: SortOrder
  }

  export type ReferralMaxOrderByAggregateInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
  }

  export type ReferralMinOrderByAggregateInput = {
    id?: SortOrder
    referrerId?: SortOrder
    referredId?: SortOrder
    points?: SortOrder
    createdAt?: SortOrder
  }

  export type ReferralSumOrderByAggregateInput = {
    points?: SortOrder
  }

  export type WalletCreateNestedOneWithoutCustodialWalletInput = {
    create?: XOR<WalletCreateWithoutCustodialWalletInput, WalletUncheckedCreateWithoutCustodialWalletInput>
    connectOrCreate?: WalletCreateOrConnectWithoutCustodialWalletInput
    connect?: WalletWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutCustodialWalletInput = {
    create?: XOR<UserCreateWithoutCustodialWalletInput, UserUncheckedCreateWithoutCustodialWalletInput> | UserCreateWithoutCustodialWalletInput[] | UserUncheckedCreateWithoutCustodialWalletInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCustodialWalletInput | UserCreateOrConnectWithoutCustodialWalletInput[]
    createMany?: UserCreateManyCustodialWalletInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type WalletUncheckedCreateNestedOneWithoutCustodialWalletInput = {
    create?: XOR<WalletCreateWithoutCustodialWalletInput, WalletUncheckedCreateWithoutCustodialWalletInput>
    connectOrCreate?: WalletCreateOrConnectWithoutCustodialWalletInput
    connect?: WalletWhereUniqueInput
  }

  export type UserUncheckedCreateNestedManyWithoutCustodialWalletInput = {
    create?: XOR<UserCreateWithoutCustodialWalletInput, UserUncheckedCreateWithoutCustodialWalletInput> | UserCreateWithoutCustodialWalletInput[] | UserUncheckedCreateWithoutCustodialWalletInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCustodialWalletInput | UserCreateOrConnectWithoutCustodialWalletInput[]
    createMany?: UserCreateManyCustodialWalletInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type WalletUpdateOneWithoutCustodialWalletNestedInput = {
    create?: XOR<WalletCreateWithoutCustodialWalletInput, WalletUncheckedCreateWithoutCustodialWalletInput>
    connectOrCreate?: WalletCreateOrConnectWithoutCustodialWalletInput
    upsert?: WalletUpsertWithoutCustodialWalletInput
    disconnect?: WalletWhereInput | boolean
    delete?: WalletWhereInput | boolean
    connect?: WalletWhereUniqueInput
    update?: XOR<XOR<WalletUpdateToOneWithWhereWithoutCustodialWalletInput, WalletUpdateWithoutCustodialWalletInput>, WalletUncheckedUpdateWithoutCustodialWalletInput>
  }

  export type UserUpdateManyWithoutCustodialWalletNestedInput = {
    create?: XOR<UserCreateWithoutCustodialWalletInput, UserUncheckedCreateWithoutCustodialWalletInput> | UserCreateWithoutCustodialWalletInput[] | UserUncheckedCreateWithoutCustodialWalletInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCustodialWalletInput | UserCreateOrConnectWithoutCustodialWalletInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCustodialWalletInput | UserUpsertWithWhereUniqueWithoutCustodialWalletInput[]
    createMany?: UserCreateManyCustodialWalletInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCustodialWalletInput | UserUpdateWithWhereUniqueWithoutCustodialWalletInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCustodialWalletInput | UserUpdateManyWithWhereWithoutCustodialWalletInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type WalletUncheckedUpdateOneWithoutCustodialWalletNestedInput = {
    create?: XOR<WalletCreateWithoutCustodialWalletInput, WalletUncheckedCreateWithoutCustodialWalletInput>
    connectOrCreate?: WalletCreateOrConnectWithoutCustodialWalletInput
    upsert?: WalletUpsertWithoutCustodialWalletInput
    disconnect?: WalletWhereInput | boolean
    delete?: WalletWhereInput | boolean
    connect?: WalletWhereUniqueInput
    update?: XOR<XOR<WalletUpdateToOneWithWhereWithoutCustodialWalletInput, WalletUpdateWithoutCustodialWalletInput>, WalletUncheckedUpdateWithoutCustodialWalletInput>
  }

  export type UserUncheckedUpdateManyWithoutCustodialWalletNestedInput = {
    create?: XOR<UserCreateWithoutCustodialWalletInput, UserUncheckedCreateWithoutCustodialWalletInput> | UserCreateWithoutCustodialWalletInput[] | UserUncheckedCreateWithoutCustodialWalletInput[]
    connectOrCreate?: UserCreateOrConnectWithoutCustodialWalletInput | UserCreateOrConnectWithoutCustodialWalletInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutCustodialWalletInput | UserUpsertWithWhereUniqueWithoutCustodialWalletInput[]
    createMany?: UserCreateManyCustodialWalletInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutCustodialWalletInput | UserUpdateWithWhereUniqueWithoutCustodialWalletInput[]
    updateMany?: UserUpdateManyWithWhereWithoutCustodialWalletInput | UserUpdateManyWithWhereWithoutCustodialWalletInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type CustodialWalletCreateNestedOneWithoutUsersInput = {
    create?: XOR<CustodialWalletCreateWithoutUsersInput, CustodialWalletUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CustodialWalletCreateOrConnectWithoutUsersInput
    connect?: CustodialWalletWhereUniqueInput
  }

  export type BetCreateNestedManyWithoutUserInput = {
    create?: XOR<BetCreateWithoutUserInput, BetUncheckedCreateWithoutUserInput> | BetCreateWithoutUserInput[] | BetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BetCreateOrConnectWithoutUserInput | BetCreateOrConnectWithoutUserInput[]
    createMany?: BetCreateManyUserInputEnvelope
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
  }

  export type UserTaskCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTaskCreateWithoutUserInput, UserTaskUncheckedCreateWithoutUserInput> | UserTaskCreateWithoutUserInput[] | UserTaskUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTaskCreateOrConnectWithoutUserInput | UserTaskCreateOrConnectWithoutUserInput[]
    createMany?: UserTaskCreateManyUserInputEnvelope
    connect?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
  }

  export type ReferralCreateNestedManyWithoutReferrerInput = {
    create?: XOR<ReferralCreateWithoutReferrerInput, ReferralUncheckedCreateWithoutReferrerInput> | ReferralCreateWithoutReferrerInput[] | ReferralUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferrerInput | ReferralCreateOrConnectWithoutReferrerInput[]
    createMany?: ReferralCreateManyReferrerInputEnvelope
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
  }

  export type ReferralCreateNestedManyWithoutReferredInput = {
    create?: XOR<ReferralCreateWithoutReferredInput, ReferralUncheckedCreateWithoutReferredInput> | ReferralCreateWithoutReferredInput[] | ReferralUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferredInput | ReferralCreateOrConnectWithoutReferredInput[]
    createMany?: ReferralCreateManyReferredInputEnvelope
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
  }

  export type BetUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<BetCreateWithoutUserInput, BetUncheckedCreateWithoutUserInput> | BetCreateWithoutUserInput[] | BetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BetCreateOrConnectWithoutUserInput | BetCreateOrConnectWithoutUserInput[]
    createMany?: BetCreateManyUserInputEnvelope
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
  }

  export type UserTaskUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTaskCreateWithoutUserInput, UserTaskUncheckedCreateWithoutUserInput> | UserTaskCreateWithoutUserInput[] | UserTaskUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTaskCreateOrConnectWithoutUserInput | UserTaskCreateOrConnectWithoutUserInput[]
    createMany?: UserTaskCreateManyUserInputEnvelope
    connect?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
  }

  export type ReferralUncheckedCreateNestedManyWithoutReferrerInput = {
    create?: XOR<ReferralCreateWithoutReferrerInput, ReferralUncheckedCreateWithoutReferrerInput> | ReferralCreateWithoutReferrerInput[] | ReferralUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferrerInput | ReferralCreateOrConnectWithoutReferrerInput[]
    createMany?: ReferralCreateManyReferrerInputEnvelope
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
  }

  export type ReferralUncheckedCreateNestedManyWithoutReferredInput = {
    create?: XOR<ReferralCreateWithoutReferredInput, ReferralUncheckedCreateWithoutReferredInput> | ReferralCreateWithoutReferredInput[] | ReferralUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferredInput | ReferralCreateOrConnectWithoutReferredInput[]
    createMany?: ReferralCreateManyReferredInputEnvelope
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CustodialWalletUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<CustodialWalletCreateWithoutUsersInput, CustodialWalletUncheckedCreateWithoutUsersInput>
    connectOrCreate?: CustodialWalletCreateOrConnectWithoutUsersInput
    upsert?: CustodialWalletUpsertWithoutUsersInput
    connect?: CustodialWalletWhereUniqueInput
    update?: XOR<XOR<CustodialWalletUpdateToOneWithWhereWithoutUsersInput, CustodialWalletUpdateWithoutUsersInput>, CustodialWalletUncheckedUpdateWithoutUsersInput>
  }

  export type BetUpdateManyWithoutUserNestedInput = {
    create?: XOR<BetCreateWithoutUserInput, BetUncheckedCreateWithoutUserInput> | BetCreateWithoutUserInput[] | BetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BetCreateOrConnectWithoutUserInput | BetCreateOrConnectWithoutUserInput[]
    upsert?: BetUpsertWithWhereUniqueWithoutUserInput | BetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BetCreateManyUserInputEnvelope
    set?: BetWhereUniqueInput | BetWhereUniqueInput[]
    disconnect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    delete?: BetWhereUniqueInput | BetWhereUniqueInput[]
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    update?: BetUpdateWithWhereUniqueWithoutUserInput | BetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BetUpdateManyWithWhereWithoutUserInput | BetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BetScalarWhereInput | BetScalarWhereInput[]
  }

  export type UserTaskUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTaskCreateWithoutUserInput, UserTaskUncheckedCreateWithoutUserInput> | UserTaskCreateWithoutUserInput[] | UserTaskUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTaskCreateOrConnectWithoutUserInput | UserTaskCreateOrConnectWithoutUserInput[]
    upsert?: UserTaskUpsertWithWhereUniqueWithoutUserInput | UserTaskUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTaskCreateManyUserInputEnvelope
    set?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    disconnect?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    delete?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    connect?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    update?: UserTaskUpdateWithWhereUniqueWithoutUserInput | UserTaskUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTaskUpdateManyWithWhereWithoutUserInput | UserTaskUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTaskScalarWhereInput | UserTaskScalarWhereInput[]
  }

  export type ReferralUpdateManyWithoutReferrerNestedInput = {
    create?: XOR<ReferralCreateWithoutReferrerInput, ReferralUncheckedCreateWithoutReferrerInput> | ReferralCreateWithoutReferrerInput[] | ReferralUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferrerInput | ReferralCreateOrConnectWithoutReferrerInput[]
    upsert?: ReferralUpsertWithWhereUniqueWithoutReferrerInput | ReferralUpsertWithWhereUniqueWithoutReferrerInput[]
    createMany?: ReferralCreateManyReferrerInputEnvelope
    set?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    disconnect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    delete?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    update?: ReferralUpdateWithWhereUniqueWithoutReferrerInput | ReferralUpdateWithWhereUniqueWithoutReferrerInput[]
    updateMany?: ReferralUpdateManyWithWhereWithoutReferrerInput | ReferralUpdateManyWithWhereWithoutReferrerInput[]
    deleteMany?: ReferralScalarWhereInput | ReferralScalarWhereInput[]
  }

  export type ReferralUpdateManyWithoutReferredNestedInput = {
    create?: XOR<ReferralCreateWithoutReferredInput, ReferralUncheckedCreateWithoutReferredInput> | ReferralCreateWithoutReferredInput[] | ReferralUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferredInput | ReferralCreateOrConnectWithoutReferredInput[]
    upsert?: ReferralUpsertWithWhereUniqueWithoutReferredInput | ReferralUpsertWithWhereUniqueWithoutReferredInput[]
    createMany?: ReferralCreateManyReferredInputEnvelope
    set?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    disconnect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    delete?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    update?: ReferralUpdateWithWhereUniqueWithoutReferredInput | ReferralUpdateWithWhereUniqueWithoutReferredInput[]
    updateMany?: ReferralUpdateManyWithWhereWithoutReferredInput | ReferralUpdateManyWithWhereWithoutReferredInput[]
    deleteMany?: ReferralScalarWhereInput | ReferralScalarWhereInput[]
  }

  export type BetUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<BetCreateWithoutUserInput, BetUncheckedCreateWithoutUserInput> | BetCreateWithoutUserInput[] | BetUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BetCreateOrConnectWithoutUserInput | BetCreateOrConnectWithoutUserInput[]
    upsert?: BetUpsertWithWhereUniqueWithoutUserInput | BetUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BetCreateManyUserInputEnvelope
    set?: BetWhereUniqueInput | BetWhereUniqueInput[]
    disconnect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    delete?: BetWhereUniqueInput | BetWhereUniqueInput[]
    connect?: BetWhereUniqueInput | BetWhereUniqueInput[]
    update?: BetUpdateWithWhereUniqueWithoutUserInput | BetUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BetUpdateManyWithWhereWithoutUserInput | BetUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BetScalarWhereInput | BetScalarWhereInput[]
  }

  export type UserTaskUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTaskCreateWithoutUserInput, UserTaskUncheckedCreateWithoutUserInput> | UserTaskCreateWithoutUserInput[] | UserTaskUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTaskCreateOrConnectWithoutUserInput | UserTaskCreateOrConnectWithoutUserInput[]
    upsert?: UserTaskUpsertWithWhereUniqueWithoutUserInput | UserTaskUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTaskCreateManyUserInputEnvelope
    set?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    disconnect?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    delete?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    connect?: UserTaskWhereUniqueInput | UserTaskWhereUniqueInput[]
    update?: UserTaskUpdateWithWhereUniqueWithoutUserInput | UserTaskUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTaskUpdateManyWithWhereWithoutUserInput | UserTaskUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTaskScalarWhereInput | UserTaskScalarWhereInput[]
  }

  export type ReferralUncheckedUpdateManyWithoutReferrerNestedInput = {
    create?: XOR<ReferralCreateWithoutReferrerInput, ReferralUncheckedCreateWithoutReferrerInput> | ReferralCreateWithoutReferrerInput[] | ReferralUncheckedCreateWithoutReferrerInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferrerInput | ReferralCreateOrConnectWithoutReferrerInput[]
    upsert?: ReferralUpsertWithWhereUniqueWithoutReferrerInput | ReferralUpsertWithWhereUniqueWithoutReferrerInput[]
    createMany?: ReferralCreateManyReferrerInputEnvelope
    set?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    disconnect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    delete?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    update?: ReferralUpdateWithWhereUniqueWithoutReferrerInput | ReferralUpdateWithWhereUniqueWithoutReferrerInput[]
    updateMany?: ReferralUpdateManyWithWhereWithoutReferrerInput | ReferralUpdateManyWithWhereWithoutReferrerInput[]
    deleteMany?: ReferralScalarWhereInput | ReferralScalarWhereInput[]
  }

  export type ReferralUncheckedUpdateManyWithoutReferredNestedInput = {
    create?: XOR<ReferralCreateWithoutReferredInput, ReferralUncheckedCreateWithoutReferredInput> | ReferralCreateWithoutReferredInput[] | ReferralUncheckedCreateWithoutReferredInput[]
    connectOrCreate?: ReferralCreateOrConnectWithoutReferredInput | ReferralCreateOrConnectWithoutReferredInput[]
    upsert?: ReferralUpsertWithWhereUniqueWithoutReferredInput | ReferralUpsertWithWhereUniqueWithoutReferredInput[]
    createMany?: ReferralCreateManyReferredInputEnvelope
    set?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    disconnect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    delete?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    connect?: ReferralWhereUniqueInput | ReferralWhereUniqueInput[]
    update?: ReferralUpdateWithWhereUniqueWithoutReferredInput | ReferralUpdateWithWhereUniqueWithoutReferredInput[]
    updateMany?: ReferralUpdateManyWithWhereWithoutReferredInput | ReferralUpdateManyWithWhereWithoutReferredInput[]
    deleteMany?: ReferralScalarWhereInput | ReferralScalarWhereInput[]
  }

  export type CustodialWalletCreateNestedOneWithoutWalletInput = {
    create?: XOR<CustodialWalletCreateWithoutWalletInput, CustodialWalletUncheckedCreateWithoutWalletInput>
    connectOrCreate?: CustodialWalletCreateOrConnectWithoutWalletInput
    connect?: CustodialWalletWhereUniqueInput
  }

  export type WalletTransactionCreateNestedManyWithoutWalletInput = {
    create?: XOR<WalletTransactionCreateWithoutWalletInput, WalletTransactionUncheckedCreateWithoutWalletInput> | WalletTransactionCreateWithoutWalletInput[] | WalletTransactionUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: WalletTransactionCreateOrConnectWithoutWalletInput | WalletTransactionCreateOrConnectWithoutWalletInput[]
    createMany?: WalletTransactionCreateManyWalletInputEnvelope
    connect?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
  }

  export type WalletTransactionUncheckedCreateNestedManyWithoutWalletInput = {
    create?: XOR<WalletTransactionCreateWithoutWalletInput, WalletTransactionUncheckedCreateWithoutWalletInput> | WalletTransactionCreateWithoutWalletInput[] | WalletTransactionUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: WalletTransactionCreateOrConnectWithoutWalletInput | WalletTransactionCreateOrConnectWithoutWalletInput[]
    createMany?: WalletTransactionCreateManyWalletInputEnvelope
    connect?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type CustodialWalletUpdateOneRequiredWithoutWalletNestedInput = {
    create?: XOR<CustodialWalletCreateWithoutWalletInput, CustodialWalletUncheckedCreateWithoutWalletInput>
    connectOrCreate?: CustodialWalletCreateOrConnectWithoutWalletInput
    upsert?: CustodialWalletUpsertWithoutWalletInput
    connect?: CustodialWalletWhereUniqueInput
    update?: XOR<XOR<CustodialWalletUpdateToOneWithWhereWithoutWalletInput, CustodialWalletUpdateWithoutWalletInput>, CustodialWalletUncheckedUpdateWithoutWalletInput>
  }

  export type WalletTransactionUpdateManyWithoutWalletNestedInput = {
    create?: XOR<WalletTransactionCreateWithoutWalletInput, WalletTransactionUncheckedCreateWithoutWalletInput> | WalletTransactionCreateWithoutWalletInput[] | WalletTransactionUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: WalletTransactionCreateOrConnectWithoutWalletInput | WalletTransactionCreateOrConnectWithoutWalletInput[]
    upsert?: WalletTransactionUpsertWithWhereUniqueWithoutWalletInput | WalletTransactionUpsertWithWhereUniqueWithoutWalletInput[]
    createMany?: WalletTransactionCreateManyWalletInputEnvelope
    set?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    disconnect?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    delete?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    connect?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    update?: WalletTransactionUpdateWithWhereUniqueWithoutWalletInput | WalletTransactionUpdateWithWhereUniqueWithoutWalletInput[]
    updateMany?: WalletTransactionUpdateManyWithWhereWithoutWalletInput | WalletTransactionUpdateManyWithWhereWithoutWalletInput[]
    deleteMany?: WalletTransactionScalarWhereInput | WalletTransactionScalarWhereInput[]
  }

  export type WalletTransactionUncheckedUpdateManyWithoutWalletNestedInput = {
    create?: XOR<WalletTransactionCreateWithoutWalletInput, WalletTransactionUncheckedCreateWithoutWalletInput> | WalletTransactionCreateWithoutWalletInput[] | WalletTransactionUncheckedCreateWithoutWalletInput[]
    connectOrCreate?: WalletTransactionCreateOrConnectWithoutWalletInput | WalletTransactionCreateOrConnectWithoutWalletInput[]
    upsert?: WalletTransactionUpsertWithWhereUniqueWithoutWalletInput | WalletTransactionUpsertWithWhereUniqueWithoutWalletInput[]
    createMany?: WalletTransactionCreateManyWalletInputEnvelope
    set?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    disconnect?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    delete?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    connect?: WalletTransactionWhereUniqueInput | WalletTransactionWhereUniqueInput[]
    update?: WalletTransactionUpdateWithWhereUniqueWithoutWalletInput | WalletTransactionUpdateWithWhereUniqueWithoutWalletInput[]
    updateMany?: WalletTransactionUpdateManyWithWhereWithoutWalletInput | WalletTransactionUpdateManyWithWhereWithoutWalletInput[]
    deleteMany?: WalletTransactionScalarWhereInput | WalletTransactionScalarWhereInput[]
  }

  export type WalletCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<WalletCreateWithoutTransactionsInput, WalletUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: WalletCreateOrConnectWithoutTransactionsInput
    connect?: WalletWhereUniqueInput
  }

  export type WalletUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<WalletCreateWithoutTransactionsInput, WalletUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: WalletCreateOrConnectWithoutTransactionsInput
    upsert?: WalletUpsertWithoutTransactionsInput
    connect?: WalletWhereUniqueInput
    update?: XOR<XOR<WalletUpdateToOneWithWhereWithoutTransactionsInput, WalletUpdateWithoutTransactionsInput>, WalletUncheckedUpdateWithoutTransactionsInput>
  }

  export type UserCreateNestedOneWithoutBetsInput = {
    create?: XOR<UserCreateWithoutBetsInput, UserUncheckedCreateWithoutBetsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBetsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutBetsNestedInput = {
    create?: XOR<UserCreateWithoutBetsInput, UserUncheckedCreateWithoutBetsInput>
    connectOrCreate?: UserCreateOrConnectWithoutBetsInput
    upsert?: UserUpsertWithoutBetsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutBetsInput, UserUpdateWithoutBetsInput>, UserUncheckedUpdateWithoutBetsInput>
  }

  export type UserCreateNestedOneWithoutUserTasksInput = {
    create?: XOR<UserCreateWithoutUserTasksInput, UserUncheckedCreateWithoutUserTasksInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserTasksInput
    connect?: UserWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutUserTasksNestedInput = {
    create?: XOR<UserCreateWithoutUserTasksInput, UserUncheckedCreateWithoutUserTasksInput>
    connectOrCreate?: UserCreateOrConnectWithoutUserTasksInput
    upsert?: UserUpsertWithoutUserTasksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutUserTasksInput, UserUpdateWithoutUserTasksInput>, UserUncheckedUpdateWithoutUserTasksInput>
  }

  export type UserCreateNestedOneWithoutReferralsGivenInput = {
    create?: XOR<UserCreateWithoutReferralsGivenInput, UserUncheckedCreateWithoutReferralsGivenInput>
    connectOrCreate?: UserCreateOrConnectWithoutReferralsGivenInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutReferralsReceivedInput = {
    create?: XOR<UserCreateWithoutReferralsReceivedInput, UserUncheckedCreateWithoutReferralsReceivedInput>
    connectOrCreate?: UserCreateOrConnectWithoutReferralsReceivedInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutReferralsGivenNestedInput = {
    create?: XOR<UserCreateWithoutReferralsGivenInput, UserUncheckedCreateWithoutReferralsGivenInput>
    connectOrCreate?: UserCreateOrConnectWithoutReferralsGivenInput
    upsert?: UserUpsertWithoutReferralsGivenInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReferralsGivenInput, UserUpdateWithoutReferralsGivenInput>, UserUncheckedUpdateWithoutReferralsGivenInput>
  }

  export type UserUpdateOneRequiredWithoutReferralsReceivedNestedInput = {
    create?: XOR<UserCreateWithoutReferralsReceivedInput, UserUncheckedCreateWithoutReferralsReceivedInput>
    connectOrCreate?: UserCreateOrConnectWithoutReferralsReceivedInput
    upsert?: UserUpsertWithoutReferralsReceivedInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReferralsReceivedInput, UserUpdateWithoutReferralsReceivedInput>, UserUncheckedUpdateWithoutReferralsReceivedInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type WalletCreateWithoutCustodialWalletInput = {
    address: string
    encryptedPrivateKey: string
    createdAt: bigint | number
    balance?: string
    lockedBalance?: string
    lastUsed?: bigint | number | null
    createdAtTimestamp?: Date | string
    updatedAt?: Date | string
    transactions?: WalletTransactionCreateNestedManyWithoutWalletInput
  }

  export type WalletUncheckedCreateWithoutCustodialWalletInput = {
    address: string
    encryptedPrivateKey: string
    createdAt: bigint | number
    balance?: string
    lockedBalance?: string
    lastUsed?: bigint | number | null
    createdAtTimestamp?: Date | string
    updatedAt?: Date | string
    transactions?: WalletTransactionUncheckedCreateNestedManyWithoutWalletInput
  }

  export type WalletCreateOrConnectWithoutCustodialWalletInput = {
    where: WalletWhereUniqueInput
    create: XOR<WalletCreateWithoutCustodialWalletInput, WalletUncheckedCreateWithoutCustodialWalletInput>
  }

  export type UserCreateWithoutCustodialWalletInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bets?: BetCreateNestedManyWithoutUserInput
    userTasks?: UserTaskCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralCreateNestedManyWithoutReferredInput
  }

  export type UserUncheckedCreateWithoutCustodialWalletInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bets?: BetUncheckedCreateNestedManyWithoutUserInput
    userTasks?: UserTaskUncheckedCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralUncheckedCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralUncheckedCreateNestedManyWithoutReferredInput
  }

  export type UserCreateOrConnectWithoutCustodialWalletInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCustodialWalletInput, UserUncheckedCreateWithoutCustodialWalletInput>
  }

  export type UserCreateManyCustodialWalletInputEnvelope = {
    data: UserCreateManyCustodialWalletInput | UserCreateManyCustodialWalletInput[]
    skipDuplicates?: boolean
  }

  export type WalletUpsertWithoutCustodialWalletInput = {
    update: XOR<WalletUpdateWithoutCustodialWalletInput, WalletUncheckedUpdateWithoutCustodialWalletInput>
    create: XOR<WalletCreateWithoutCustodialWalletInput, WalletUncheckedCreateWithoutCustodialWalletInput>
    where?: WalletWhereInput
  }

  export type WalletUpdateToOneWithWhereWithoutCustodialWalletInput = {
    where?: WalletWhereInput
    data: XOR<WalletUpdateWithoutCustodialWalletInput, WalletUncheckedUpdateWithoutCustodialWalletInput>
  }

  export type WalletUpdateWithoutCustodialWalletInput = {
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: WalletTransactionUpdateManyWithoutWalletNestedInput
  }

  export type WalletUncheckedUpdateWithoutCustodialWalletInput = {
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: WalletTransactionUncheckedUpdateManyWithoutWalletNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutCustodialWalletInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutCustodialWalletInput, UserUncheckedUpdateWithoutCustodialWalletInput>
    create: XOR<UserCreateWithoutCustodialWalletInput, UserUncheckedCreateWithoutCustodialWalletInput>
  }

  export type UserUpdateWithWhereUniqueWithoutCustodialWalletInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutCustodialWalletInput, UserUncheckedUpdateWithoutCustodialWalletInput>
  }

  export type UserUpdateManyWithWhereWithoutCustodialWalletInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutCustodialWalletInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    wallet_address?: StringFilter<"User"> | string
    custodial_wallet_id?: StringFilter<"User"> | string
    sessionId?: StringNullableFilter<"User"> | string | null
    siwe_message?: StringNullableFilter<"User"> | string | null
    siwe_signature?: StringNullableFilter<"User"> | string | null
    siwe_expires_at?: DateTimeNullableFilter<"User"> | Date | string | null
    totalPoints?: IntFilter<"User"> | number
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type CustodialWalletCreateWithoutUsersInput = {
    id?: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    wallet?: WalletCreateNestedOneWithoutCustodialWalletInput
  }

  export type CustodialWalletUncheckedCreateWithoutUsersInput = {
    id?: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    wallet?: WalletUncheckedCreateNestedOneWithoutCustodialWalletInput
  }

  export type CustodialWalletCreateOrConnectWithoutUsersInput = {
    where: CustodialWalletWhereUniqueInput
    create: XOR<CustodialWalletCreateWithoutUsersInput, CustodialWalletUncheckedCreateWithoutUsersInput>
  }

  export type BetCreateWithoutUserInput = {
    id?: string
    playerId: string
    serverSeedHash: string
    serverSeed?: string | null
    clientSeed?: string | null
    randomValue: string
    gameNumber: string
    wager: string
    targetMultiplier: string
    limboMultiplier?: string | null
    outcome: string
    payout: string
    status: string
    ethPriceUsd?: string | null
    wagerUsd?: string | null
    payoutUsd?: string | null
    betSignature?: string | null
    betMessage?: string | null
    signature?: string | null
    txHash?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BetUncheckedCreateWithoutUserInput = {
    id?: string
    playerId: string
    serverSeedHash: string
    serverSeed?: string | null
    clientSeed?: string | null
    randomValue: string
    gameNumber: string
    wager: string
    targetMultiplier: string
    limboMultiplier?: string | null
    outcome: string
    payout: string
    status: string
    ethPriceUsd?: string | null
    wagerUsd?: string | null
    payoutUsd?: string | null
    betSignature?: string | null
    betMessage?: string | null
    signature?: string | null
    txHash?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type BetCreateOrConnectWithoutUserInput = {
    where: BetWhereUniqueInput
    create: XOR<BetCreateWithoutUserInput, BetUncheckedCreateWithoutUserInput>
  }

  export type BetCreateManyUserInputEnvelope = {
    data: BetCreateManyUserInput | BetCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserTaskCreateWithoutUserInput = {
    id?: string
    taskId: string
    completed?: boolean
    points?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type UserTaskUncheckedCreateWithoutUserInput = {
    id?: string
    taskId: string
    completed?: boolean
    points?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type UserTaskCreateOrConnectWithoutUserInput = {
    where: UserTaskWhereUniqueInput
    create: XOR<UserTaskCreateWithoutUserInput, UserTaskUncheckedCreateWithoutUserInput>
  }

  export type UserTaskCreateManyUserInputEnvelope = {
    data: UserTaskCreateManyUserInput | UserTaskCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ReferralCreateWithoutReferrerInput = {
    id?: string
    points?: number
    createdAt?: Date | string
    referred: UserCreateNestedOneWithoutReferralsReceivedInput
  }

  export type ReferralUncheckedCreateWithoutReferrerInput = {
    id?: string
    referredId: string
    points?: number
    createdAt?: Date | string
  }

  export type ReferralCreateOrConnectWithoutReferrerInput = {
    where: ReferralWhereUniqueInput
    create: XOR<ReferralCreateWithoutReferrerInput, ReferralUncheckedCreateWithoutReferrerInput>
  }

  export type ReferralCreateManyReferrerInputEnvelope = {
    data: ReferralCreateManyReferrerInput | ReferralCreateManyReferrerInput[]
    skipDuplicates?: boolean
  }

  export type ReferralCreateWithoutReferredInput = {
    id?: string
    points?: number
    createdAt?: Date | string
    referrer: UserCreateNestedOneWithoutReferralsGivenInput
  }

  export type ReferralUncheckedCreateWithoutReferredInput = {
    id?: string
    referrerId: string
    points?: number
    createdAt?: Date | string
  }

  export type ReferralCreateOrConnectWithoutReferredInput = {
    where: ReferralWhereUniqueInput
    create: XOR<ReferralCreateWithoutReferredInput, ReferralUncheckedCreateWithoutReferredInput>
  }

  export type ReferralCreateManyReferredInputEnvelope = {
    data: ReferralCreateManyReferredInput | ReferralCreateManyReferredInput[]
    skipDuplicates?: boolean
  }

  export type CustodialWalletUpsertWithoutUsersInput = {
    update: XOR<CustodialWalletUpdateWithoutUsersInput, CustodialWalletUncheckedUpdateWithoutUsersInput>
    create: XOR<CustodialWalletCreateWithoutUsersInput, CustodialWalletUncheckedCreateWithoutUsersInput>
    where?: CustodialWalletWhereInput
  }

  export type CustodialWalletUpdateToOneWithWhereWithoutUsersInput = {
    where?: CustodialWalletWhereInput
    data: XOR<CustodialWalletUpdateWithoutUsersInput, CustodialWalletUncheckedUpdateWithoutUsersInput>
  }

  export type CustodialWalletUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wallet?: WalletUpdateOneWithoutCustodialWalletNestedInput
  }

  export type CustodialWalletUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    wallet?: WalletUncheckedUpdateOneWithoutCustodialWalletNestedInput
  }

  export type BetUpsertWithWhereUniqueWithoutUserInput = {
    where: BetWhereUniqueInput
    update: XOR<BetUpdateWithoutUserInput, BetUncheckedUpdateWithoutUserInput>
    create: XOR<BetCreateWithoutUserInput, BetUncheckedCreateWithoutUserInput>
  }

  export type BetUpdateWithWhereUniqueWithoutUserInput = {
    where: BetWhereUniqueInput
    data: XOR<BetUpdateWithoutUserInput, BetUncheckedUpdateWithoutUserInput>
  }

  export type BetUpdateManyWithWhereWithoutUserInput = {
    where: BetScalarWhereInput
    data: XOR<BetUpdateManyMutationInput, BetUncheckedUpdateManyWithoutUserInput>
  }

  export type BetScalarWhereInput = {
    AND?: BetScalarWhereInput | BetScalarWhereInput[]
    OR?: BetScalarWhereInput[]
    NOT?: BetScalarWhereInput | BetScalarWhereInput[]
    id?: StringFilter<"Bet"> | string
    userId?: StringFilter<"Bet"> | string
    playerId?: StringFilter<"Bet"> | string
    serverSeedHash?: StringFilter<"Bet"> | string
    serverSeed?: StringNullableFilter<"Bet"> | string | null
    clientSeed?: StringNullableFilter<"Bet"> | string | null
    randomValue?: StringFilter<"Bet"> | string
    gameNumber?: StringFilter<"Bet"> | string
    wager?: StringFilter<"Bet"> | string
    targetMultiplier?: StringFilter<"Bet"> | string
    limboMultiplier?: StringNullableFilter<"Bet"> | string | null
    outcome?: StringFilter<"Bet"> | string
    payout?: StringFilter<"Bet"> | string
    status?: StringFilter<"Bet"> | string
    ethPriceUsd?: StringNullableFilter<"Bet"> | string | null
    wagerUsd?: StringNullableFilter<"Bet"> | string | null
    payoutUsd?: StringNullableFilter<"Bet"> | string | null
    betSignature?: StringNullableFilter<"Bet"> | string | null
    betMessage?: StringNullableFilter<"Bet"> | string | null
    signature?: StringNullableFilter<"Bet"> | string | null
    txHash?: StringNullableFilter<"Bet"> | string | null
    createdAt?: DateTimeFilter<"Bet"> | Date | string
    resolvedAt?: DateTimeNullableFilter<"Bet"> | Date | string | null
  }

  export type UserTaskUpsertWithWhereUniqueWithoutUserInput = {
    where: UserTaskWhereUniqueInput
    update: XOR<UserTaskUpdateWithoutUserInput, UserTaskUncheckedUpdateWithoutUserInput>
    create: XOR<UserTaskCreateWithoutUserInput, UserTaskUncheckedCreateWithoutUserInput>
  }

  export type UserTaskUpdateWithWhereUniqueWithoutUserInput = {
    where: UserTaskWhereUniqueInput
    data: XOR<UserTaskUpdateWithoutUserInput, UserTaskUncheckedUpdateWithoutUserInput>
  }

  export type UserTaskUpdateManyWithWhereWithoutUserInput = {
    where: UserTaskScalarWhereInput
    data: XOR<UserTaskUpdateManyMutationInput, UserTaskUncheckedUpdateManyWithoutUserInput>
  }

  export type UserTaskScalarWhereInput = {
    AND?: UserTaskScalarWhereInput | UserTaskScalarWhereInput[]
    OR?: UserTaskScalarWhereInput[]
    NOT?: UserTaskScalarWhereInput | UserTaskScalarWhereInput[]
    id?: StringFilter<"UserTask"> | string
    userId?: StringFilter<"UserTask"> | string
    taskId?: StringFilter<"UserTask"> | string
    completed?: BoolFilter<"UserTask"> | boolean
    points?: IntFilter<"UserTask"> | number
    completedAt?: DateTimeNullableFilter<"UserTask"> | Date | string | null
    createdAt?: DateTimeFilter<"UserTask"> | Date | string
  }

  export type ReferralUpsertWithWhereUniqueWithoutReferrerInput = {
    where: ReferralWhereUniqueInput
    update: XOR<ReferralUpdateWithoutReferrerInput, ReferralUncheckedUpdateWithoutReferrerInput>
    create: XOR<ReferralCreateWithoutReferrerInput, ReferralUncheckedCreateWithoutReferrerInput>
  }

  export type ReferralUpdateWithWhereUniqueWithoutReferrerInput = {
    where: ReferralWhereUniqueInput
    data: XOR<ReferralUpdateWithoutReferrerInput, ReferralUncheckedUpdateWithoutReferrerInput>
  }

  export type ReferralUpdateManyWithWhereWithoutReferrerInput = {
    where: ReferralScalarWhereInput
    data: XOR<ReferralUpdateManyMutationInput, ReferralUncheckedUpdateManyWithoutReferrerInput>
  }

  export type ReferralScalarWhereInput = {
    AND?: ReferralScalarWhereInput | ReferralScalarWhereInput[]
    OR?: ReferralScalarWhereInput[]
    NOT?: ReferralScalarWhereInput | ReferralScalarWhereInput[]
    id?: StringFilter<"Referral"> | string
    referrerId?: StringFilter<"Referral"> | string
    referredId?: StringFilter<"Referral"> | string
    points?: IntFilter<"Referral"> | number
    createdAt?: DateTimeFilter<"Referral"> | Date | string
  }

  export type ReferralUpsertWithWhereUniqueWithoutReferredInput = {
    where: ReferralWhereUniqueInput
    update: XOR<ReferralUpdateWithoutReferredInput, ReferralUncheckedUpdateWithoutReferredInput>
    create: XOR<ReferralCreateWithoutReferredInput, ReferralUncheckedCreateWithoutReferredInput>
  }

  export type ReferralUpdateWithWhereUniqueWithoutReferredInput = {
    where: ReferralWhereUniqueInput
    data: XOR<ReferralUpdateWithoutReferredInput, ReferralUncheckedUpdateWithoutReferredInput>
  }

  export type ReferralUpdateManyWithWhereWithoutReferredInput = {
    where: ReferralScalarWhereInput
    data: XOR<ReferralUpdateManyMutationInput, ReferralUncheckedUpdateManyWithoutReferredInput>
  }

  export type CustodialWalletCreateWithoutWalletInput = {
    id?: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutCustodialWalletInput
  }

  export type CustodialWalletUncheckedCreateWithoutWalletInput = {
    id?: string
    address: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutCustodialWalletInput
  }

  export type CustodialWalletCreateOrConnectWithoutWalletInput = {
    where: CustodialWalletWhereUniqueInput
    create: XOR<CustodialWalletCreateWithoutWalletInput, CustodialWalletUncheckedCreateWithoutWalletInput>
  }

  export type WalletTransactionCreateWithoutWalletInput = {
    txHash?: string | null
    txType: string
    amount: string
    status: string
    blockNumber?: bigint | number | null
    gasUsed?: string | null
    createdAt?: Date | string
    confirmedAt?: Date | string | null
  }

  export type WalletTransactionUncheckedCreateWithoutWalletInput = {
    id?: number
    txHash?: string | null
    txType: string
    amount: string
    status: string
    blockNumber?: bigint | number | null
    gasUsed?: string | null
    createdAt?: Date | string
    confirmedAt?: Date | string | null
  }

  export type WalletTransactionCreateOrConnectWithoutWalletInput = {
    where: WalletTransactionWhereUniqueInput
    create: XOR<WalletTransactionCreateWithoutWalletInput, WalletTransactionUncheckedCreateWithoutWalletInput>
  }

  export type WalletTransactionCreateManyWalletInputEnvelope = {
    data: WalletTransactionCreateManyWalletInput | WalletTransactionCreateManyWalletInput[]
    skipDuplicates?: boolean
  }

  export type CustodialWalletUpsertWithoutWalletInput = {
    update: XOR<CustodialWalletUpdateWithoutWalletInput, CustodialWalletUncheckedUpdateWithoutWalletInput>
    create: XOR<CustodialWalletCreateWithoutWalletInput, CustodialWalletUncheckedCreateWithoutWalletInput>
    where?: CustodialWalletWhereInput
  }

  export type CustodialWalletUpdateToOneWithWhereWithoutWalletInput = {
    where?: CustodialWalletWhereInput
    data: XOR<CustodialWalletUpdateWithoutWalletInput, CustodialWalletUncheckedUpdateWithoutWalletInput>
  }

  export type CustodialWalletUpdateWithoutWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutCustodialWalletNestedInput
  }

  export type CustodialWalletUncheckedUpdateWithoutWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutCustodialWalletNestedInput
  }

  export type WalletTransactionUpsertWithWhereUniqueWithoutWalletInput = {
    where: WalletTransactionWhereUniqueInput
    update: XOR<WalletTransactionUpdateWithoutWalletInput, WalletTransactionUncheckedUpdateWithoutWalletInput>
    create: XOR<WalletTransactionCreateWithoutWalletInput, WalletTransactionUncheckedCreateWithoutWalletInput>
  }

  export type WalletTransactionUpdateWithWhereUniqueWithoutWalletInput = {
    where: WalletTransactionWhereUniqueInput
    data: XOR<WalletTransactionUpdateWithoutWalletInput, WalletTransactionUncheckedUpdateWithoutWalletInput>
  }

  export type WalletTransactionUpdateManyWithWhereWithoutWalletInput = {
    where: WalletTransactionScalarWhereInput
    data: XOR<WalletTransactionUpdateManyMutationInput, WalletTransactionUncheckedUpdateManyWithoutWalletInput>
  }

  export type WalletTransactionScalarWhereInput = {
    AND?: WalletTransactionScalarWhereInput | WalletTransactionScalarWhereInput[]
    OR?: WalletTransactionScalarWhereInput[]
    NOT?: WalletTransactionScalarWhereInput | WalletTransactionScalarWhereInput[]
    id?: IntFilter<"WalletTransaction"> | number
    custodialWalletId?: StringFilter<"WalletTransaction"> | string
    txHash?: StringNullableFilter<"WalletTransaction"> | string | null
    txType?: StringFilter<"WalletTransaction"> | string
    amount?: StringFilter<"WalletTransaction"> | string
    status?: StringFilter<"WalletTransaction"> | string
    blockNumber?: BigIntNullableFilter<"WalletTransaction"> | bigint | number | null
    gasUsed?: StringNullableFilter<"WalletTransaction"> | string | null
    createdAt?: DateTimeFilter<"WalletTransaction"> | Date | string
    confirmedAt?: DateTimeNullableFilter<"WalletTransaction"> | Date | string | null
  }

  export type WalletCreateWithoutTransactionsInput = {
    address: string
    encryptedPrivateKey: string
    createdAt: bigint | number
    balance?: string
    lockedBalance?: string
    lastUsed?: bigint | number | null
    createdAtTimestamp?: Date | string
    updatedAt?: Date | string
    custodialWallet: CustodialWalletCreateNestedOneWithoutWalletInput
  }

  export type WalletUncheckedCreateWithoutTransactionsInput = {
    custodialWalletId: string
    address: string
    encryptedPrivateKey: string
    createdAt: bigint | number
    balance?: string
    lockedBalance?: string
    lastUsed?: bigint | number | null
    createdAtTimestamp?: Date | string
    updatedAt?: Date | string
  }

  export type WalletCreateOrConnectWithoutTransactionsInput = {
    where: WalletWhereUniqueInput
    create: XOR<WalletCreateWithoutTransactionsInput, WalletUncheckedCreateWithoutTransactionsInput>
  }

  export type WalletUpsertWithoutTransactionsInput = {
    update: XOR<WalletUpdateWithoutTransactionsInput, WalletUncheckedUpdateWithoutTransactionsInput>
    create: XOR<WalletCreateWithoutTransactionsInput, WalletUncheckedCreateWithoutTransactionsInput>
    where?: WalletWhereInput
  }

  export type WalletUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: WalletWhereInput
    data: XOR<WalletUpdateWithoutTransactionsInput, WalletUncheckedUpdateWithoutTransactionsInput>
  }

  export type WalletUpdateWithoutTransactionsInput = {
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    custodialWallet?: CustodialWalletUpdateOneRequiredWithoutWalletNestedInput
  }

  export type WalletUncheckedUpdateWithoutTransactionsInput = {
    custodialWalletId?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    encryptedPrivateKey?: StringFieldUpdateOperationsInput | string
    createdAt?: BigIntFieldUpdateOperationsInput | bigint | number
    balance?: StringFieldUpdateOperationsInput | string
    lockedBalance?: StringFieldUpdateOperationsInput | string
    lastUsed?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    createdAtTimestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutBetsInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    custodialWallet: CustodialWalletCreateNestedOneWithoutUsersInput
    userTasks?: UserTaskCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralCreateNestedManyWithoutReferredInput
  }

  export type UserUncheckedCreateWithoutBetsInput = {
    id?: string
    wallet_address: string
    custodial_wallet_id: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    userTasks?: UserTaskUncheckedCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralUncheckedCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralUncheckedCreateNestedManyWithoutReferredInput
  }

  export type UserCreateOrConnectWithoutBetsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutBetsInput, UserUncheckedCreateWithoutBetsInput>
  }

  export type UserUpsertWithoutBetsInput = {
    update: XOR<UserUpdateWithoutBetsInput, UserUncheckedUpdateWithoutBetsInput>
    create: XOR<UserCreateWithoutBetsInput, UserUncheckedCreateWithoutBetsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutBetsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutBetsInput, UserUncheckedUpdateWithoutBetsInput>
  }

  export type UserUpdateWithoutBetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    custodialWallet?: CustodialWalletUpdateOneRequiredWithoutUsersNestedInput
    userTasks?: UserTaskUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUpdateManyWithoutReferredNestedInput
  }

  export type UserUncheckedUpdateWithoutBetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    custodial_wallet_id?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userTasks?: UserTaskUncheckedUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUncheckedUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUncheckedUpdateManyWithoutReferredNestedInput
  }

  export type UserCreateWithoutUserTasksInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    custodialWallet: CustodialWalletCreateNestedOneWithoutUsersInput
    bets?: BetCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralCreateNestedManyWithoutReferredInput
  }

  export type UserUncheckedCreateWithoutUserTasksInput = {
    id?: string
    wallet_address: string
    custodial_wallet_id: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bets?: BetUncheckedCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralUncheckedCreateNestedManyWithoutReferrerInput
    referralsReceived?: ReferralUncheckedCreateNestedManyWithoutReferredInput
  }

  export type UserCreateOrConnectWithoutUserTasksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutUserTasksInput, UserUncheckedCreateWithoutUserTasksInput>
  }

  export type UserUpsertWithoutUserTasksInput = {
    update: XOR<UserUpdateWithoutUserTasksInput, UserUncheckedUpdateWithoutUserTasksInput>
    create: XOR<UserCreateWithoutUserTasksInput, UserUncheckedCreateWithoutUserTasksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutUserTasksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutUserTasksInput, UserUncheckedUpdateWithoutUserTasksInput>
  }

  export type UserUpdateWithoutUserTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    custodialWallet?: CustodialWalletUpdateOneRequiredWithoutUsersNestedInput
    bets?: BetUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUpdateManyWithoutReferredNestedInput
  }

  export type UserUncheckedUpdateWithoutUserTasksInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    custodial_wallet_id?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bets?: BetUncheckedUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUncheckedUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUncheckedUpdateManyWithoutReferredNestedInput
  }

  export type UserCreateWithoutReferralsGivenInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    custodialWallet: CustodialWalletCreateNestedOneWithoutUsersInput
    bets?: BetCreateNestedManyWithoutUserInput
    userTasks?: UserTaskCreateNestedManyWithoutUserInput
    referralsReceived?: ReferralCreateNestedManyWithoutReferredInput
  }

  export type UserUncheckedCreateWithoutReferralsGivenInput = {
    id?: string
    wallet_address: string
    custodial_wallet_id: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bets?: BetUncheckedCreateNestedManyWithoutUserInput
    userTasks?: UserTaskUncheckedCreateNestedManyWithoutUserInput
    referralsReceived?: ReferralUncheckedCreateNestedManyWithoutReferredInput
  }

  export type UserCreateOrConnectWithoutReferralsGivenInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReferralsGivenInput, UserUncheckedCreateWithoutReferralsGivenInput>
  }

  export type UserCreateWithoutReferralsReceivedInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    custodialWallet: CustodialWalletCreateNestedOneWithoutUsersInput
    bets?: BetCreateNestedManyWithoutUserInput
    userTasks?: UserTaskCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralCreateNestedManyWithoutReferrerInput
  }

  export type UserUncheckedCreateWithoutReferralsReceivedInput = {
    id?: string
    wallet_address: string
    custodial_wallet_id: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bets?: BetUncheckedCreateNestedManyWithoutUserInput
    userTasks?: UserTaskUncheckedCreateNestedManyWithoutUserInput
    referralsGiven?: ReferralUncheckedCreateNestedManyWithoutReferrerInput
  }

  export type UserCreateOrConnectWithoutReferralsReceivedInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReferralsReceivedInput, UserUncheckedCreateWithoutReferralsReceivedInput>
  }

  export type UserUpsertWithoutReferralsGivenInput = {
    update: XOR<UserUpdateWithoutReferralsGivenInput, UserUncheckedUpdateWithoutReferralsGivenInput>
    create: XOR<UserCreateWithoutReferralsGivenInput, UserUncheckedCreateWithoutReferralsGivenInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReferralsGivenInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReferralsGivenInput, UserUncheckedUpdateWithoutReferralsGivenInput>
  }

  export type UserUpdateWithoutReferralsGivenInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    custodialWallet?: CustodialWalletUpdateOneRequiredWithoutUsersNestedInput
    bets?: BetUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUpdateManyWithoutUserNestedInput
    referralsReceived?: ReferralUpdateManyWithoutReferredNestedInput
  }

  export type UserUncheckedUpdateWithoutReferralsGivenInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    custodial_wallet_id?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bets?: BetUncheckedUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUncheckedUpdateManyWithoutUserNestedInput
    referralsReceived?: ReferralUncheckedUpdateManyWithoutReferredNestedInput
  }

  export type UserUpsertWithoutReferralsReceivedInput = {
    update: XOR<UserUpdateWithoutReferralsReceivedInput, UserUncheckedUpdateWithoutReferralsReceivedInput>
    create: XOR<UserCreateWithoutReferralsReceivedInput, UserUncheckedCreateWithoutReferralsReceivedInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReferralsReceivedInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReferralsReceivedInput, UserUncheckedUpdateWithoutReferralsReceivedInput>
  }

  export type UserUpdateWithoutReferralsReceivedInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    custodialWallet?: CustodialWalletUpdateOneRequiredWithoutUsersNestedInput
    bets?: BetUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUpdateManyWithoutReferrerNestedInput
  }

  export type UserUncheckedUpdateWithoutReferralsReceivedInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    custodial_wallet_id?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bets?: BetUncheckedUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUncheckedUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUncheckedUpdateManyWithoutReferrerNestedInput
  }

  export type UserCreateManyCustodialWalletInput = {
    id?: string
    wallet_address: string
    sessionId?: string | null
    siwe_message?: string | null
    siwe_signature?: string | null
    siwe_expires_at?: Date | string | null
    totalPoints?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutCustodialWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bets?: BetUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUpdateManyWithoutReferredNestedInput
  }

  export type UserUncheckedUpdateWithoutCustodialWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bets?: BetUncheckedUpdateManyWithoutUserNestedInput
    userTasks?: UserTaskUncheckedUpdateManyWithoutUserNestedInput
    referralsGiven?: ReferralUncheckedUpdateManyWithoutReferrerNestedInput
    referralsReceived?: ReferralUncheckedUpdateManyWithoutReferredNestedInput
  }

  export type UserUncheckedUpdateManyWithoutCustodialWalletInput = {
    id?: StringFieldUpdateOperationsInput | string
    wallet_address?: StringFieldUpdateOperationsInput | string
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_message?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_signature?: NullableStringFieldUpdateOperationsInput | string | null
    siwe_expires_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalPoints?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BetCreateManyUserInput = {
    id?: string
    playerId: string
    serverSeedHash: string
    serverSeed?: string | null
    clientSeed?: string | null
    randomValue: string
    gameNumber: string
    wager: string
    targetMultiplier: string
    limboMultiplier?: string | null
    outcome: string
    payout: string
    status: string
    ethPriceUsd?: string | null
    wagerUsd?: string | null
    payoutUsd?: string | null
    betSignature?: string | null
    betMessage?: string | null
    signature?: string | null
    txHash?: string | null
    createdAt?: Date | string
    resolvedAt?: Date | string | null
  }

  export type UserTaskCreateManyUserInput = {
    id?: string
    taskId: string
    completed?: boolean
    points?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type ReferralCreateManyReferrerInput = {
    id?: string
    referredId: string
    points?: number
    createdAt?: Date | string
  }

  export type ReferralCreateManyReferredInput = {
    id?: string
    referrerId: string
    points?: number
    createdAt?: Date | string
  }

  export type BetUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    serverSeedHash?: StringFieldUpdateOperationsInput | string
    serverSeed?: NullableStringFieldUpdateOperationsInput | string | null
    clientSeed?: NullableStringFieldUpdateOperationsInput | string | null
    randomValue?: StringFieldUpdateOperationsInput | string
    gameNumber?: StringFieldUpdateOperationsInput | string
    wager?: StringFieldUpdateOperationsInput | string
    targetMultiplier?: StringFieldUpdateOperationsInput | string
    limboMultiplier?: NullableStringFieldUpdateOperationsInput | string | null
    outcome?: StringFieldUpdateOperationsInput | string
    payout?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    ethPriceUsd?: NullableStringFieldUpdateOperationsInput | string | null
    wagerUsd?: NullableStringFieldUpdateOperationsInput | string | null
    payoutUsd?: NullableStringFieldUpdateOperationsInput | string | null
    betSignature?: NullableStringFieldUpdateOperationsInput | string | null
    betMessage?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BetUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    serverSeedHash?: StringFieldUpdateOperationsInput | string
    serverSeed?: NullableStringFieldUpdateOperationsInput | string | null
    clientSeed?: NullableStringFieldUpdateOperationsInput | string | null
    randomValue?: StringFieldUpdateOperationsInput | string
    gameNumber?: StringFieldUpdateOperationsInput | string
    wager?: StringFieldUpdateOperationsInput | string
    targetMultiplier?: StringFieldUpdateOperationsInput | string
    limboMultiplier?: NullableStringFieldUpdateOperationsInput | string | null
    outcome?: StringFieldUpdateOperationsInput | string
    payout?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    ethPriceUsd?: NullableStringFieldUpdateOperationsInput | string | null
    wagerUsd?: NullableStringFieldUpdateOperationsInput | string | null
    payoutUsd?: NullableStringFieldUpdateOperationsInput | string | null
    betSignature?: NullableStringFieldUpdateOperationsInput | string | null
    betMessage?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BetUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    playerId?: StringFieldUpdateOperationsInput | string
    serverSeedHash?: StringFieldUpdateOperationsInput | string
    serverSeed?: NullableStringFieldUpdateOperationsInput | string | null
    clientSeed?: NullableStringFieldUpdateOperationsInput | string | null
    randomValue?: StringFieldUpdateOperationsInput | string
    gameNumber?: StringFieldUpdateOperationsInput | string
    wager?: StringFieldUpdateOperationsInput | string
    targetMultiplier?: StringFieldUpdateOperationsInput | string
    limboMultiplier?: NullableStringFieldUpdateOperationsInput | string | null
    outcome?: StringFieldUpdateOperationsInput | string
    payout?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    ethPriceUsd?: NullableStringFieldUpdateOperationsInput | string | null
    wagerUsd?: NullableStringFieldUpdateOperationsInput | string | null
    payoutUsd?: NullableStringFieldUpdateOperationsInput | string | null
    betSignature?: NullableStringFieldUpdateOperationsInput | string | null
    betMessage?: NullableStringFieldUpdateOperationsInput | string | null
    signature?: NullableStringFieldUpdateOperationsInput | string | null
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UserTaskUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTaskUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserTaskUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    taskId?: StringFieldUpdateOperationsInput | string
    completed?: BoolFieldUpdateOperationsInput | boolean
    points?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReferralUpdateWithoutReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referred?: UserUpdateOneRequiredWithoutReferralsReceivedNestedInput
  }

  export type ReferralUncheckedUpdateWithoutReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReferralUncheckedUpdateManyWithoutReferrerInput = {
    id?: StringFieldUpdateOperationsInput | string
    referredId?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReferralUpdateWithoutReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    referrer?: UserUpdateOneRequiredWithoutReferralsGivenNestedInput
  }

  export type ReferralUncheckedUpdateWithoutReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReferralUncheckedUpdateManyWithoutReferredInput = {
    id?: StringFieldUpdateOperationsInput | string
    referrerId?: StringFieldUpdateOperationsInput | string
    points?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WalletTransactionCreateManyWalletInput = {
    id?: number
    txHash?: string | null
    txType: string
    amount: string
    status: string
    blockNumber?: bigint | number | null
    gasUsed?: string | null
    createdAt?: Date | string
    confirmedAt?: Date | string | null
  }

  export type WalletTransactionUpdateWithoutWalletInput = {
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    txType?: StringFieldUpdateOperationsInput | string
    amount?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    blockNumber?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    gasUsed?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WalletTransactionUncheckedUpdateWithoutWalletInput = {
    id?: IntFieldUpdateOperationsInput | number
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    txType?: StringFieldUpdateOperationsInput | string
    amount?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    blockNumber?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    gasUsed?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WalletTransactionUncheckedUpdateManyWithoutWalletInput = {
    id?: IntFieldUpdateOperationsInput | number
    txHash?: NullableStringFieldUpdateOperationsInput | string | null
    txType?: StringFieldUpdateOperationsInput | string
    amount?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    blockNumber?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    gasUsed?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}