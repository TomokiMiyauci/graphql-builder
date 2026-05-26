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
  BaseNamedType,
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

class UnoverwritableMap<T, U> extends Map<T, U> {
  /**
   * @throws {Error} If the item already exists.
   */
  override set(key: T, value: U): this {
    if (this.has(key)) {
      throw new Error(`"${key}" is already defined`);
    }

    return super.set(key, value);
  }
}

export class SchemaBuilder {
  constructor() {
  }
  #lock = new Scope();

  #registry: Map<string, BaseNamedType> = new UnoverwritableMap();

  scalar<T, U>(config: GraphQLScalarTypeConfig<T, U>): ScalarType<T, U>;
  scalar(name: string): ScalarType;
  scalar(
    nameOrConfig: string | GraphQLScalarTypeConfig<unknown, unknown>,
  ): ScalarType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#lock.getOrInsert(
      name,
      "scalar",
      new Registry<
        GraphQLScalarTypeConfig<unknown, unknown>,
        GraphQLScalarType
      >(),
      createScalar,
    );
    const builder = new ScalarTypeBuilder(registry);

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
      this.#set(name, builder);
    }

    return builder;
  }

  objectType<T, U, A = unknown>(
    config: ObjectTypeConfig<T, U, A>,
  ): ObjectType<T, U>;
  objectType(name: string): ObjectType<unknown, unknown>;
  objectType(
    nameOrConfig: string | ObjectTypeConfig<unknown, unknown>,
  ): ObjectType<unknown, unknown> {
    const name = normalizeName(nameOrConfig);
    const registry = this.#lock.getOrInsert(
      name,
      "object",
      new Registry<
        ObjectTypeConfig<unknown, unknown>,
        GraphQLObjectType<unknown, unknown>
      >(),
      createObject,
    );
    const builder = new ObjectTypeBuilder(registry);

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
      this.#set(name, builder);
    }

    return builder;
  }

  inputObjectType(config: InputObjectTypeConfig): InputObjectType;
  inputObjectType(name: string): InputObjectType;
  inputObjectType(
    nameOrConfig: string | InputObjectTypeConfig,
  ): InputObjectType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#lock.getOrInsert(
      name,
      "input-object",
      new Registry<InputObjectTypeConfig, GraphQLInputObjectType>(),
      createInputObject,
    );
    const builder = new InputObjectTypeBuilder(registry);

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
      this.#set(name, builder);
    }

    return builder;
  }

  unionType<T, U>(config: UnionTypeConfig<T, U>): UnionType;
  unionType(name: string): UnionType;
  unionType(
    nameOrConfig: string | UnionTypeConfig<unknown, unknown>,
  ): UnionType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#lock.getOrInsert(
      name,
      "union",
      new Registry<UnionTypeConfig<unknown, unknown>, GraphQLUnionType>(),
      createUnion,
    );
    const builder = new UnionTypeBuilder(registry);

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
      this.#set(name, builder);
    }

    return builder;
  }

  enumType(config: GraphQLEnumTypeConfig): EnumType;
  enumType(name: string): EnumType;
  enumType(nameOrConfig: string | GraphQLEnumTypeConfig): EnumType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#lock.getOrInsert(
      name,
      "enum",
      new Registry<GraphQLEnumTypeConfig, GraphQLEnumType>(),
      createEnum,
    );
    const builder = new EnumTypeBuilder(registry);

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
      this.#set(name, builder);
    }

    return builder;
  }

  interfaceType<T, U>(config: InterfaceTypeConfig<T, U>): InterfaceType;
  interfaceType(name: string): InterfaceType;
  interfaceType(
    nameOrConfig: string | InterfaceTypeConfig<unknown, unknown>,
  ): InterfaceType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#lock.getOrInsert(
      name,
      "interface",
      new Registry<
        InterfaceTypeConfig<unknown, unknown>,
        GraphQLInterfaceType
      >(),
      createInterface,
    );
    const builder = new InterfaceTypeBuilder(registry);

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
      this.#set(name, builder);
    }

    return builder;
  }

  types(): GraphQLNamedType[] {
    const array = this.#registry.values().map(({ type }) => type).toArray();

    return array;
  }

  /**
   * @throws {Error}
   */
  #set(name: string, type: BaseNamedType): void {
    try {
      this.#registry.set(name, type);
    } catch {
      throw new Error(`"${name}" is already defined`);
    }
  }
}

type NameOrNamed = string | Named;

interface Named {
  name: string;
}

function normalizeName(nameOrNamed: NameOrNamed): string {
  return typeof nameOrNamed === "string" ? nameOrNamed : nameOrNamed.name;
}

export function list<T extends Type>(type: T): List<T["type"]> {
  return {
    get type() {
      const instance = type.type;

      return new GraphQLList(instance);
    },
  };
}

export function nonNull<T extends Type>(type: T): NonNull<T["type"]> {
  return {
    get type() {
      const instance = type.type;

      return new GraphQLNonNull(instance);
    },
  };
}
