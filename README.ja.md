# graphql-builder

**参照管理**と**Thunk**のないGraphQLスキーマビルダー

## Install

deno:

```bash
deno add jsr:@miyauci/graphql-builder
```

## Usage

`SchemaBuilder`は、`GraphQLNamedType`を構築するための中間表現（定義）を管理するクラスです。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { GraphQLSchema, GraphQLString } from "graphql";

const builder = new SchemaBuilder();

const definition = builder.objectType({
  name: "Folder",
  fields: {
    name: { type: GraphQLString },
    parent: {
      type: builder.objectType("Folder"),
    },
  },
});
const types = builder.types();
const schema = new GraphQLSchema({ types });
```

### SchemaBuilderの初期化

`SchemaBuilder`は初期化時に、外部のGraphQLインスタンスを取り込むことができます。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { GraphQLObjectType, GraphQLObjectTypeConfig } from "graphql";
import { assertStrictEquals } from "@std/assert";
declare const config: GraphQLObjectTypeConfig<unknown, unknown>;

const post = new GraphQLObjectType({ ...config, name: "Post" });
const builder = new SchemaBuilder({ types: [post] });
const definition = builder.objectType("Post");

assertStrictEquals(definition.type, post);
```

### ファクトリ

`SchemaBuilder`はファクトリメソッドとして以下を提供します。

- `objectType`
- `inputObjectType`
- `enumType`
- `unionType`
- `interfaceType`
- `scalarType`

これらはそれぞれのGraphQL型の遅延表現を作成します。

それぞれのメソッドは、[graphql-js](https://github.com/graphql/graphql-js)の各GraphQLコンストラクタと同等の引数を受け取ります。
それに加えて、遅延表現を受け入れます。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { GraphQLString } from "graphql";
declare const builder: SchemaBuilder;

builder.objectType({
  name: "Post",
  fields: {
    title: { type: GraphQLString },
    author: {
      type: builder.objectType("User"),
    },
  },
});
```

### 📝 遅延表現の取得とバインド

各ファクトリメソッドが返すオブジェクトは、遅延表現です。

#### 遅延表現の取得

名前を指定すると、遅延表現を取得します。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
declare const builder: SchemaBuilder;

builder.objectType("Post");
```

#### Configのバインド

最終的にその遅延表現をGraphQLのインスタンスとして評価するためには、必ずConfigをバインドする必要があります。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
declare const builder: SchemaBuilder;

builder.objectType({ name: "Post", fields: {} });
```

#### Utility

遅延表現を`GraphQLList`や`GraphQLNonNull`として表現するためのユーティリティを提供しています。

```ts
import { list, nonNull, SchemaBuilder } from "@miyauci/graphql-builder";
declare const builder: SchemaBuilder;

list(nonNull(builder.scalarType("Ip")));
```

#### 評価

GraphQLのインスタンスを得るには２つの方法があります。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { assert, assertStrictEquals } from "@std/assert";
import { isObjectType } from "graphql";
declare const builder: SchemaBuilder;

const definition = builder.objectType({ name: "Post", fields: {} });

assert(isObjectType(definition.type));
assertStrictEquals(builder.types()[0], definition.type);
```

#### ランタイムエラー

ランタイムエラーは、ファクトリの呼び出し時および、評価時に発生する可能性があります。

ランタイムエラーは、可能な限り早期(ファクトリの呼び出し時)に発生します。

##### 名前空間の重複

遅延表現は、SchemaBuilderによって管理されます。遅延表現は名前空間を持ち、同一名称の遅延表現は一つのファクトリタイプでしか取得できません。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { assertThrows } from "@std/assert";
declare const builder: SchemaBuilder;

builder.objectType("Post");
assertThrows(() => builder.inputObjectType("Post"));
```

##### 重複バインド

同じ名前空間に対する重複バインドはできません。

```ts
import type { ObjectTypeConfig, SchemaBuilder } from "@miyauci/graphql-builder";
import { assertThrows } from "@std/assert";
declare const builder: SchemaBuilder;
declare const config: ObjectTypeConfig<unknown, unknown>;

builder.objectType({ ...config, name: "Post" });
assertThrows(() => builder.objectType({ ...config, name: "Post" }));
```

##### 未バインド

評価する際に、未バインドの遅延表現はエラーになります。

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { assertThrows } from "@std/assert";
declare const builder: SchemaBuilder;

const definition = builder.objectType("Post");
assertThrows(() => definition.type);
```

## License

[MIT](LICENSE)
