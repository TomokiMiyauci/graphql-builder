import type {
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
  GraphQLEnumType,
  GraphQLEnumTypeConfig,
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInterfaceType,
  GraphQLObjectType,
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
    const type = new GraphQLObjectType({
      name: this.config.name,
      fields: () => {
        const fields = mapValues(
          this.config.fields,
          fieldConfigTo,
        );

        return fields;
      },
    });

    return type;
  }
}

export class InputObjectTypeBuilder implements InputObjectType {
  constructor(private config: InputObjectTypeConfig) {}
  type = "input-object" as const;

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

  get definition() {
    const type = new GraphQLInterfaceType({
      name: this.config.name,
      fields: () => {
        const fields = mapValues(
          this.config.fields,
          fieldConfigTo,
        );

        return fields;
      },
    });

    return type;
  }
}

function fieldConfigTo<T, U>(
  config: FieldConfig<T, U>,
): GraphQLFieldConfig<T, U> {
  const type = config.type.definition;

  if (!isOutputType(type)) {
    throw new Error();
  }

  return {
    type,
    resolve: config.resolve,
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
