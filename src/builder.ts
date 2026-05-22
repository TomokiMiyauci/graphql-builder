// deno-lint-ignore-file no-explicit-any
import type {
  GraphQLEnumType,
  GraphQLEnumTypeConfig,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
  GraphQLUnionType,
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

export class SchemaBuilder {
  #registries: {
    scalar: Map<
      string,
      Registry<GraphQLScalarTypeConfig<unknown, unknown>, GraphQLScalarType>
    >;
    object: Map<
      string,
      Registry<ObjectTypeConfig<any, any>, GraphQLObjectType>
    >;
    inputObject: Map<
      string,
      Registry<InputObjectTypeConfig, GraphQLInputObjectType>
    >;
    union: Map<
      string,
      Registry<UnionTypeConfig, GraphQLUnionType>
    >;
    enum: Map<
      string,
      Registry<GraphQLEnumTypeConfig, GraphQLEnumType>
    >;
    interface: Map<
      string,
      Registry<InterfaceTypeConfig<unknown, unknown>, GraphQLInterfaceType>
    >;
  } = {
    scalar: new Map(),
    object: new Map(),
    inputObject: new Map(),
    union: new Map(),
    enum: new Map(),
    interface: new Map(),
  };

  scalar<T, U>(
    symbolOrConfig: string | GraphQLScalarTypeConfig<T, U>,
  ): ScalarType {
    const name = typeof symbolOrConfig === "string"
      ? symbolOrConfig
      : symbolOrConfig.name;
    const registry = this.#registries.scalar.getOrInsert(
      name,
      new Registry(),
    );

    if (typeof symbolOrConfig === "object") {
      registry.config.set(symbolOrConfig);
    }

    return new ScalarTypeBuilder(registry);
  }

  objectType<T, U>(
    symbolOrConfig: string | ObjectTypeConfig<T, U>,
  ): ObjectType<T, U> {
    const name = typeof symbolOrConfig === "string"
      ? symbolOrConfig
      : symbolOrConfig.name;
    const registry = this.#registries.object.getOrInsert(
      name,
      new Registry(),
    );

    if (typeof symbolOrConfig === "object") {
      registry.config.set(symbolOrConfig);
    }

    return new ObjectTypeBuilder(registry);
  }

  inputObjectType(
    symbolOrConfig: string | InputObjectTypeConfig,
  ): InputObjectType {
    const name = typeof symbolOrConfig === "string"
      ? symbolOrConfig
      : symbolOrConfig.name;
    const registry = this.#registries.inputObject.getOrInsert(
      name,
      new Registry(),
    );

    if (typeof symbolOrConfig === "object") {
      registry.config.set(symbolOrConfig);
    }

    const inputObjectType = new InputObjectTypeBuilder(registry);

    return inputObjectType;
  }

  unionType(symbolOrConfig: string | UnionTypeConfig): UnionType {
    const name = typeof symbolOrConfig === "string"
      ? symbolOrConfig
      : symbolOrConfig.name;

    const registry = this.#registries.union.getOrInsert(name, new Registry());

    if (typeof symbolOrConfig === "object") {
      registry.config.set(symbolOrConfig);
    }

    const union = new UnionTypeBuilder(registry);

    return union;
  }

  enumType(symbolOrConfig: string | GraphQLEnumTypeConfig): EnumType {
    const name = typeof symbolOrConfig === "string"
      ? symbolOrConfig
      : symbolOrConfig.name;
    const registry = this.#registries.enum.getOrInsert(name, new Registry());

    if (typeof symbolOrConfig === "object") {
      registry.config.set(symbolOrConfig);
    }

    const type = new EnumTypeBuilder(registry);

    return type;
  }

  interfaceType<T, U>(
    symbolOrConfig: string | InterfaceTypeConfig<T, U>,
  ): InterfaceType {
    const name = typeof symbolOrConfig === "string"
      ? symbolOrConfig
      : symbolOrConfig.name;
    const registry = this.#registries.interface.getOrInsert(
      name,
      new Registry(),
    );

    if (typeof symbolOrConfig === "object") {
      registry.config.set(symbolOrConfig);
    }

    const type = new InterfaceTypeBuilder(registry);

    return type;
  }
}
