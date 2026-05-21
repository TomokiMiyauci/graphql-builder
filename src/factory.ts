import type {
  ArgumentConfig,
  EnumType,
  FieldConfig,
  InputFieldConfig,
  InputObjectType,
  InputObjectTypeConfig,
  InterfaceType,
  ObjectRef,
  ObjectType,
  ObjectTypeConfig,
  RefOrObject,
  RefType,
  Registry,
  ScalarType,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  GraphQLArgumentConfig,
  GraphQLEnumType,
  GraphQLEnumTypeConfig,
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
  GraphQLUnionType,
  GraphQLUnionTypeConfig,
  isInputType,
  isObjectType,
  isOutputType,
} from "graphql";
import { mapValues } from "@std/collections";
import { memo } from "./util.ts";

export class ScalarTypeBuilder<T, U> implements ScalarType {
  type = "scalar" as const;

  constructor(private config: GraphQLScalarTypeConfig<T, U>) {}

  @memo
  get definition() {
    const type = new GraphQLScalarType(this.config);

    return type;
  }
}

export class ObjectTypeBuilder<T, U> implements ObjectType<T, U> {
  constructor(
    private config: ObjectTypeConfig<T, U>,
  ) {
  }

  type = "object" as const;

  @memo
  get definition(): GraphQLObjectType<T, U> {
    const config = toObjectTypeConfig(this.config);
    const type = new GraphQLObjectType(config);

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

  if (!isInputType(type)) throw new Error();

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

  if (!isOutputType(type)) {
    throw new Error();
  }

  const args = mapValues(config.args ?? {}, toArgumentConfig);

  return {
    type,
    resolve: config.resolve,
    args,
  };
}

function toArgumentConfig(config: ArgumentConfig): GraphQLArgumentConfig {
  const type = config.type.definition;

  if (!isInputType(type)) throw new Error();

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

function toType<T, U>(objectType: RefOrObject<T, U>): GraphQLObjectType<T, U> {
  return objectType.definition;
}

export class RefTypeBuilder implements RefType {
  type = "ref" as const;
  constructor(private registry: Registry, private key: string) {}

  @memo
  get definition() {
    const result = this.registry.get(this.key);

    if (!result) throw new Error();

    return result.definition;
  }
}

export class ObjectRefTypeBuilder<T, U> extends RefTypeBuilder
  implements ObjectRef<T, U> {
  @memo
  override get definition(): GraphQLObjectType<T, U> {
    const result = super.definition;

    if (!isObjectType(result)) throw new Error();

    return result;
  }
}
