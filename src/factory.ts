import type {
  ArgumentConfig,
  EnumType,
  FieldConfig,
  InputFieldConfig,
  InputObjectType,
  InputObjectTypeConfig,
  InterfaceType,
  ObjectType,
  ObjectTypeConfig,
  ScalarType,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  type GraphQLArgumentConfig,
  GraphQLEnumType,
  type GraphQLEnumTypeConfig,
  type GraphQLFieldConfig,
  type GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  type GraphQLInputObjectTypeConfig,
  GraphQLInterfaceType,
  GraphQLObjectType,
  type GraphQLObjectTypeConfig,
  GraphQLScalarType,
  type GraphQLScalarTypeConfig,
  GraphQLUnionType,
  type GraphQLUnionTypeConfig,
} from "graphql";
import { mapValues } from "@std/collections";
import { memo } from "./util.ts";

class Box<T> {
  #value: T | undefined;
  get value(): T | undefined {
    return this.#value;
  }
  set(value: T): void {
    this.#value = value;
  }
}

export class Registry<T, U> {
  config: Box<T> = new Box();
  instance: Box<U> = new Box();
}

export class ScalarTypeBuilder<T, U> implements ScalarType {
  type = "scalar" as const;

  constructor(
    private registry: Registry<
      GraphQLScalarTypeConfig<T, U>,
      GraphQLScalarType
    >,
  ) {}

  get definition() {
    const instance = this.registry.instance.value;

    if (instance) return instance;

    const config = this.registry.config.value;

    if (!config) throw new Error(`not found`);

    const type = new GraphQLScalarType(config);

    this.registry.instance.set(type);

    return type;
  }
}

export class ObjectTypeBuilder<T, U> implements ObjectType<T, U> {
  constructor(
    private registry: Registry<ObjectTypeConfig<T, U>, GraphQLObjectType<T, U>>,
  ) {
  }

  type = "object" as const;

  get definition(): GraphQLObjectType<T, U> {
    const instance = this.registry.instance.value;

    if (instance) return instance;

    const raw = this.registry.config.value;

    if (!raw) throw new Error(`not found`);

    const config = toObjectTypeConfig(raw);
    const type = new GraphQLObjectType(config);

    this.registry.instance.set(type);

    return type;
  }
}

function toObjectTypeConfig<T, U>(
  config: ObjectTypeConfig<T, U>,
): GraphQLObjectTypeConfig<T, U> {
  return {
    name: config.name,
    fields: () => {
      const fields = mapValues(
        config.fields,
        toFieldConfig,
      );

      return fields;
    },
    description: config.description,
  };
}

export class InputObjectTypeBuilder implements InputObjectType {
  constructor(private config: InputObjectTypeConfig) {}
  type = "input-object" as const;

  @memo
  get definition() {
    const config = toInputObjectTypeConfig(this.config);
    const type = new GraphQLInputObjectType(config);

    return type;
  }
}

function toInputObjectTypeConfig(
  config: InputObjectTypeConfig,
): GraphQLInputObjectTypeConfig {
  const fields = mapValues(config.fields, toInputFieldConfig);

  return {
    name: config.name,
    fields,
  };
}

function toInputFieldConfig(
  config: InputFieldConfig,
): GraphQLInputFieldConfig {
  const type = config.type.definition;

  return {
    defaultValue: config.defaultValue,
    deprecationReason: config.deprecationReason,
    description: config.description,
    type,
  };
}

export class UnionTypeBuilder implements UnionType {
  constructor(private config: UnionTypeConfig) {}

  type = "union" as const;

  @memo
  get definition() {
    const config = toUnionTypeConfig(this.config);
    const type = new GraphQLUnionType(config);

    return type;
  }
}

export class EnumTypeBuilder implements EnumType {
  constructor(private config: GraphQLEnumTypeConfig) {}
  type = "enum" as const;

  @memo
  get definition() {
    const type = new GraphQLEnumType(this.config);

    return type;
  }
}

export class InterfaceTypeBuilder<T, U> implements InterfaceType {
  constructor(
    private config: ObjectTypeConfig<T, U>,
  ) {
  }

  type = "interface" as const;

  @memo
  get definition() {
    const type = new GraphQLInterfaceType({
      name: this.config.name,
      fields: () => {
        const fields = mapValues(
          this.config.fields,
          toFieldConfig,
        );

        return fields;
      },
    });

    return type;
  }
}

function toFieldConfig<T, U>(
  config: FieldConfig<T, U>,
): GraphQLFieldConfig<T, U> {
  const type = config.type.definition;

  const args = mapValues(config.args ?? {}, toArgumentConfig);

  return {
    type,
    resolve: config.resolve,
    args,
  };
}

function toArgumentConfig(config: ArgumentConfig): GraphQLArgumentConfig {
  const type = config.type.definition;

  return {
    type,
    defaultValue: config.defaultValue,
    deprecationReason: config.deprecationReason,
    description: config.description,
  };
}

function toUnionTypeConfig(
  config: UnionTypeConfig,
): GraphQLUnionTypeConfig<unknown, unknown> {
  const types = config.types.map(toType);

  return {
    name: config.name,
    types,
    description: config.description,
  };
}

function toType<T, U>(objectType: ObjectType<T, U>): GraphQLObjectType<T, U> {
  return objectType.definition;
}
