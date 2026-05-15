import type {
  EnumType,
  FieldConfig,
  InterfaceType,
  ObjectType,
  ObjectTypeConfig,
  RefOrObject,
  ScalarType,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  GraphQLEnumType,
  GraphQLEnumTypeConfig,
  GraphQLFieldConfig,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
  GraphQLUnionType,
  GraphQLUnionTypeConfig,
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

export class UnionTypeBuilder<T, U> implements UnionType {
  constructor(private config: UnionTypeConfig) {}

  type = "union" as const;

  @memo
  get definition(): GraphQLOutputType {
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
