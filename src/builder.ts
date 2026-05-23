// deno-lint-ignore-file no-explicit-any
import {
  type GraphQLEnumType,
  type GraphQLEnumTypeConfig,
  type GraphQLInputObjectType,
  type GraphQLInterfaceType,
  GraphQLList,
  type GraphQLNamedType,
  GraphQLNonNull,
  type GraphQLObjectType,
  type GraphQLScalarType,
  type GraphQLScalarTypeConfig,
  type GraphQLUnionType,
} from "graphql";
import type {
  EnumType,
  InputObjectType,
  InputObjectTypeConfig,
  InterfaceType,
  InterfaceTypeConfig,
  List,
  NonNull,
  ObjectType,
  ObjectTypeConfig,
  ScalarType,
  Type,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  createEnum,
  createInputObject,
  createInterface,
  createObject,
  createScalar,
  createUnion,
  EnumTypeBuilder,
  InputObjectTypeBuilder,
  InterfaceTypeBuilder,
  ObjectTypeBuilder,
  Registry,
  ScalarTypeBuilder,
  UnionTypeBuilder,
} from "./factory.ts";

class Scope {
  #map: Map<
    string,
    {
      registry: Registry<any, GraphQLNamedType>;
      group: string;
      get type(): GraphQLNamedType;
    }
  > = new Map();

  getOrInsert<T extends Registry<unknown, GraphQLNamedType>>(
    name: string,
    group: string,
    registry: T,
    create: (registry: T) => GraphQLNamedType,
  ): T {
    if (this.#map.has(name)) {
      const pair = this.#map.get(name)!;

      if (group === pair.group) {
        return pair.registry as T;
      }

      throw new Error(`"${name}" is already defined as "${group}"`);
    } else {
      this.#map.set(name, {
        registry,
        group,
        get type() {
          return create(registry);
        },
      });
      return registry;
    }
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]();
  }
}

export class SchemaBuilder {
  #registry = new Scope();

  scalar(name: string): ScalarType;
  scalar<T, U>(config: GraphQLScalarTypeConfig<T, U>): ScalarType<T, U>;
  scalar(
    nameOrConfig: string | GraphQLScalarTypeConfig<unknown, unknown>,
  ): ScalarType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "scalar",
      new Registry<
        GraphQLScalarTypeConfig<unknown, unknown>,
        GraphQLScalarType
      >(),
      createScalar,
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    return new ScalarTypeBuilder(registry);
  }

  objectType<T, U, A = unknown>(
    config: ObjectTypeConfig<T, U, A>,
  ): ObjectType<T, U>;
  objectType(name: string): ObjectType<unknown, unknown>;
  objectType(
    nameOrConfig: string | ObjectTypeConfig<unknown, unknown>,
  ): ObjectType<unknown, unknown> {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "object",
      new Registry<
        ObjectTypeConfig<unknown, unknown>,
        GraphQLObjectType<unknown, unknown>
      >(),
      createObject,
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    return new ObjectTypeBuilder(registry);
  }

  inputObjectType(name: string): InputObjectType;
  inputObjectType(config: InputObjectTypeConfig): InputObjectType;
  inputObjectType(
    nameOrConfig: string | InputObjectTypeConfig,
  ): InputObjectType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "input-object",
      new Registry<InputObjectTypeConfig, GraphQLInputObjectType>(),
      createInputObject,
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const inputObjectType = new InputObjectTypeBuilder(registry);

    return inputObjectType;
  }

  unionType(name: string): UnionType;
  unionType<T, U>(config: UnionTypeConfig<T, U>): UnionType;
  unionType(
    nameOrConfig: string | UnionTypeConfig<unknown, unknown>,
  ): UnionType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "union",
      new Registry<UnionTypeConfig<unknown, unknown>, GraphQLUnionType>(),
      createUnion,
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const union = new UnionTypeBuilder(registry);

    return union;
  }

  enumType(name: string): EnumType;
  enumType(config: GraphQLEnumTypeConfig): EnumType;
  enumType(nameOrConfig: string | GraphQLEnumTypeConfig): EnumType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "enum",
      new Registry<GraphQLEnumTypeConfig, GraphQLEnumType>(),
      createEnum,
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const type = new EnumTypeBuilder(registry);

    return type;
  }

  interfaceType(name: string): InterfaceType;
  interfaceType<T, U>(config: InterfaceTypeConfig<T, U>): InterfaceType;
  interfaceType(
    nameOrConfig: string | InterfaceTypeConfig<unknown, unknown>,
  ): InterfaceType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "interface",
      new Registry<
        InterfaceTypeConfig<unknown, unknown>,
        GraphQLInterfaceType
      >(),
      createInterface,
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const type = new InterfaceTypeBuilder(registry);

    return type;
  }

  types(): GraphQLNamedType[] {
    const array = [...this.#registry].map(([_, { type }]) => type);

    return array;
  }
}

type NameOrNamed = string | Named;

interface Named {
  name: string;
}

function normalizeName(nameOrNamed: NameOrNamed): string {
  return typeof nameOrNamed === "string" ? nameOrNamed : nameOrNamed.name;
}

export function list(type: Type): List {
  return {
    type: "list",
    get definition() {
      const instance = type.definition;

      return new GraphQLList(instance);
    },
  };
}

export function nonNull(type: Type): NonNull {
  return {
    type: "non-null",
    get definition() {
      const instance = type.definition;

      return new GraphQLNonNull(instance);
    },
  };
}
