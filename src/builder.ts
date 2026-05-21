// deno-lint-ignore-file no-explicit-any
import type {
  GraphQLEnumTypeConfig,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type {
  EnumType,
  InputObjectType,
  InputObjectTypeConfig,
  InterfaceType,
  InterfaceTypeConfig,
  ObjectType,
  ObjectTypeConfig,
  ScalarType,
  Type,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  EnumTypeBuilder,
  InputObjectTypeBuilder,
  InterfaceTypeBuilder,
  ObjectTypeBuilder,
  Registry,
  ScalarTypeBuilder,
  UnionTypeBuilder,
} from "./factory.ts";

interface Name {
  name?: string;
}

export type ObjectTypeConfigOptions<T, U> =
  & Omit<ObjectTypeConfig<T, U>, "name">
  & Name;

export type GraphQLScalarTypeConfigOptions<T, U> =
  & Omit<GraphQLScalarTypeConfig<T, U>, "name">
  & Name;

export class SchemaBuilder {
  #registry = new Map();

  #h: Map<
    string,
    Registry<GraphQLScalarTypeConfig<unknown, unknown>, GraphQLScalarType>
  > = new Map();
  #y: Map<
    string,
    Registry<ObjectTypeConfig<any, any>, GraphQLObjectType>
  > = new Map();

  scalar<T, U>(
    symbol: string,
    options?: GraphQLScalarTypeConfigOptions<T, U>,
  ): ScalarType {
    const registry = this.#h.getOrInsert(symbol, new Registry());

    if (options) {
      const config = {
        ...options,
        name: options.name ?? symbol,
      } satisfies GraphQLScalarTypeConfig<T, U>;
      registry.config.set(config);
    }

    return new ScalarTypeBuilder(registry);
  }

  objectType<T, U>(
    symbol: string,
    options?: ObjectTypeConfigOptions<T, U>,
  ): ObjectType<T, U> {
    const registry = this.#y.getOrInsert(symbol, new Registry());

    if (options) {
      const config = {
        ...options,
        name: options.name ?? symbol,
      } satisfies ObjectTypeConfig<any, any>;

      registry.config.set(config);
    }

    return new ObjectTypeBuilder(registry);
  }

  inputObjectType(
    config: InputObjectTypeConfig,
  ): InputObjectType {
    this.#assertExist(config.name);

    const inputObjectType = new InputObjectTypeBuilder(config);

    return this.#register(config.name, inputObjectType);
  }

  unionType(config: UnionTypeConfig): UnionType {
    this.#assertExist(config.name);

    const union = new UnionTypeBuilder(config);

    return this.#register(config.name, union);
  }

  enumType(config: GraphQLEnumTypeConfig): EnumType {
    this.#assertExist(config.name);

    const type = new EnumTypeBuilder(config);

    return this.#register(config.name, type);
  }

  interfaceType<T, U>(
    config: InterfaceTypeConfig<T, U>,
  ): InterfaceType {
    this.#assertExist(config.name);

    const type = new InterfaceTypeBuilder(config);

    return this.#register(config.name, type);
  }

  types(): Type[] {
    return this.#registry.values().toArray();
  }

  #assertExist(name: string): void {
    if (this.#registry.has(name)) {
      throw new Error(`Already exists "${name}"`);
    }
  }

  #register<T extends Type>(name: string, type: T): T {
    this.#registry.set(name, type);

    return type;
  }
}
