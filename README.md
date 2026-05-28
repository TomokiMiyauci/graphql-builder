# graphql-builder

A name-based GraphQL schema builder that resolves circular references

## Install

deno:

```bash
deno add jsr:@miyauci/graphql-builder
```

## Usage

`SchemaBuilder` is a class that manages intermediate representations that are
used to construct `GraphQLNamedType`s.

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

### Initializing SchemaBuilder

`SchemaBuilder` can incorporate existing external GraphQL instances during
initialization.

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { GraphQLObjectType, type GraphQLObjectTypeConfig } from "graphql";
import { assertStrictEquals } from "@std/assert";
declare const config: GraphQLObjectTypeConfig<unknown, unknown>;

const post = new GraphQLObjectType({ ...config, name: "Post" });
const builder = new SchemaBuilder({ types: [post] });
const definition = builder.objectType("Post");

assertStrictEquals(definition.type, post);
```

### Factories

`SchemaBuilder` provides the following factory methods:

- `objectType`
- `inputObjectType`
- `enumType`
- `unionType`
- `interfaceType`
- `scalarType`

These methods create lazy representations of their respective GraphQL types.

Each method accepts arguments equivalent to the
[graphql-js](https://github.com/graphql/graphql-js) constructors, but also
accepts lazy representations as types for fields or arguments.

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

### Lazy Representation and Binding

The objects returned by the factory methods are lazy representations.

#### Retrieving a Representation

You can retrieve a representation by specifying a name.

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
declare const builder: SchemaBuilder;

builder.objectType("Post");
```

#### Binding Configuration

To evaluate a representation as a GraphQL instance, you must bind a
configuration to it.

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
declare const builder: SchemaBuilder;

builder.objectType({ name: "Post", fields: {} });
```

#### Utilities

Utilities are provided to wrap lazy representations in `GraphQLList` or
`GraphQLNonNull`.

```ts
import { list, nonNull, SchemaBuilder } from "@miyauci/graphql-builder";
declare const builder: SchemaBuilder;

list(nonNull(builder.scalarType("Ip")));
```

#### Evaluation

There are two ways to obtain a GraphQL instance.

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { assert, assertStrictEquals } from "@std/assert";
import { isObjectType } from "graphql";
declare const builder: SchemaBuilder;

const definition = builder.objectType({ name: "Post", fields: {} });

assert(isObjectType(definition.type));
assertStrictEquals(builder.types()[0], definition.type);
```

#### Runtime Errors

Runtime errors may occur during factory calls or during evaluation. Errors are
thrown as early as possible.

##### Namespace Collisions

Lazy representations are managed by the `SchemaBuilder` within a shared
namespace. A name can only be associated with one factory type.

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { assertThrows } from "@std/assert";
declare const builder: SchemaBuilder;

builder.objectType("Post");
assertThrows(() => builder.inputObjectType("Post"));
```

##### Duplicate Binding

A configuration cannot be bound to the same name more than once.

```ts
import type { ObjectTypeConfig, SchemaBuilder } from "@miyauci/graphql-builder";
import { assertThrows } from "@std/assert";
declare const builder: SchemaBuilder;
declare const config: ObjectTypeConfig<unknown, unknown>;

builder.objectType({ ...config, name: "Post" });
assertThrows(() => builder.objectType({ ...config, name: "Post" }));
```

##### Unbound Representations

If config is unbound when evaluating a lazy representations, an error will
occur.

```ts
import { SchemaBuilder } from "@miyauci/graphql-builder";
import { assertThrows } from "@std/assert";
declare const builder: SchemaBuilder;

const definition = builder.objectType("Post");
assertThrows(() => definition.type);
```

## License

[MIT](LICENSE)
