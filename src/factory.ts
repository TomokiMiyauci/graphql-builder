import type {
  ArgumentConfig,
  Builder,
  FieldConfig,
  InputFieldConfig,
  InputObjectTypeConfig,
  InterfaceTypeConfig,
  ObjectTypeConfig,
  Type,
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
  type GraphQLInterfaceTypeConfig,
  GraphQLObjectType,
  type GraphQLObjectTypeConfig,
  GraphQLScalarType,
  type GraphQLScalarTypeConfig,
  type GraphQLType,
  GraphQLUnionType,
  type GraphQLUnionTypeConfig,
} from "graphql";
import { mapValues } from "@std/collections/map-values";
import { evolve } from "./util.ts";

export class ScalarTypeBuilder<T, U> implements Builder {
  #config: GraphQLScalarTypeConfig<T, U>;

  constructor(
    config: GraphQLScalarTypeConfig<T, U>,
  ) {
    this.#config = config;
  }

  build(): GraphQLScalarType {
    return new GraphQLScalarType(this.#config);
  }
}

export class ObjectTypeBuilder<T, U> implements Builder {
  #config: GraphQLObjectTypeConfig<T, U>;

  constructor(
    config: ObjectTypeConfig<T, U>,
  ) {
    this.#config = toObjectTypeConfig(config);
  }

  build(): GraphQLObjectType<T, U> {
    return new GraphQLObjectType(this.#config);
  }
}

export function toObjectTypeConfig<T, U>(
  config: ObjectTypeConfig<T, U>,
): GraphQLObjectTypeConfig<T, U> {
  return evolve(config, {
    fields: (fields) => () =>
      mapValues(
        fields,
        toFieldConfig,
      ),
  });
}

export class InputObjectTypeBuilder implements Builder {
  #config: GraphQLInputObjectTypeConfig;

  constructor(config: InputObjectTypeConfig) {
    this.#config = toInputObjectTypeConfig(config);
  }

  build(): GraphQLInputObjectType {
    return new GraphQLInputObjectType(this.#config);
  }
}

export function toInputObjectTypeConfig(
  config: InputObjectTypeConfig,
): GraphQLInputObjectTypeConfig {
  return evolve(config, {
    fields: (fields) => () => mapValues(fields, toInputFieldConfig),
  });
}

function toInputFieldConfig(
  config: InputFieldConfig,
): GraphQLInputFieldConfig {
  return evolve(config, {
    type,
  });
}

export class UnionTypeBuilder<T, U> implements Builder {
  #config: GraphQLUnionTypeConfig<T, U>;

  constructor(
    config: UnionTypeConfig<T, U>,
  ) {
    this.#config = toUnionTypeConfig(config);
  }

  build(): GraphQLUnionType {
    return new GraphQLUnionType(this.#config);
  }
}

export class EnumTypeBuilder implements Builder {
  #config: GraphQLEnumTypeConfig;

  constructor(
    config: GraphQLEnumTypeConfig,
  ) {
    this.#config = config;
  }

  build(): GraphQLEnumType {
    return new GraphQLEnumType(this.#config);
  }
}

export class InterfaceTypeBuilder<T, U> implements Builder {
  #config: GraphQLInterfaceTypeConfig<T, U>;

  constructor(config: InterfaceTypeConfig<T, U>) {
    this.#config = toInterfaceTypeConfig(config);
  }

  build(): GraphQLInterfaceType {
    return new GraphQLInterfaceType(this.#config);
  }
}

function toFieldConfig<T, U>(
  config: FieldConfig<T, U>,
): GraphQLFieldConfig<T, U> {
  return evolve(config, {
    type,
    args: (args) => mapValues(args ?? {}, toArgumentConfig),
  });
}

function toArgumentConfig(config: ArgumentConfig): GraphQLArgumentConfig {
  return evolve(config, { type });
}

export function toUnionTypeConfig<T, U>(
  config: UnionTypeConfig<T, U>,
): GraphQLUnionTypeConfig<T, U> {
  const types = config.types.map((type) => {
    if ("type" in type) {
      return type.type;
    } else {
      return type;
    }
  });

  return {
    name: config.name,
    types,
    description: config.description,
  };
}

export function toInterfaceTypeConfig<T, U>(
  config: InterfaceTypeConfig<T, U>,
): GraphQLInterfaceTypeConfig<T, U> {
  return {
    name: config.name,
    fields: () => {
      const fields = mapValues(
        config.fields,
        toFieldConfig,
      );

      return fields;
    },
  };
}

function type<T extends Type | GraphQLType>(
  value: T,
): T extends Type ? T["type"] : T {
  // deno-lint-ignore no-explicit-any
  return "type" in value ? value.type as any : value as any;
}
