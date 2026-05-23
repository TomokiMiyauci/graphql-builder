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
  Type,
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
  type GraphQLType,
  GraphQLUnionType,
  type GraphQLUnionTypeConfig,
} from "graphql";
import { mapValues } from "@std/collections";
import { evolve } from "./util.ts";

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
  constructor(
    private registry: Registry<
      GraphQLScalarTypeConfig<T, U>,
      GraphQLScalarType
    >,
  ) {}

  get type() {
    return createScalar(this.registry);
  }
}

export class ObjectTypeBuilder<T, U> implements ObjectType<T, U> {
  constructor(
    private registry: Registry<ObjectTypeConfig<T, U>, GraphQLObjectType<T, U>>,
  ) {
  }

  get type(): GraphQLObjectType<T, U> {
    return createObject(this.registry);
  }
}

function toObjectTypeConfig<T, U>(
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

export class InputObjectTypeBuilder implements InputObjectType {
  constructor(
    private registry: Registry<InputObjectTypeConfig, GraphQLInputObjectType>,
  ) {}

  get type() {
    return createInputObject(this.registry);
  }
}

function toInputObjectTypeConfig(
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

export class UnionTypeBuilder<T, U> implements UnionType {
  constructor(
    private registry: Registry<UnionTypeConfig<T, U>, GraphQLUnionType>,
  ) {}

  get type() {
    return createUnion(this.registry);
  }
}

export class EnumTypeBuilder implements EnumType {
  constructor(
    private registry: Registry<GraphQLEnumTypeConfig, GraphQLEnumType>,
  ) {}

  get type() {
    return createEnum(this.registry);
  }
}

export class InterfaceTypeBuilder<T, U> implements InterfaceType {
  constructor(
    private registry: Registry<ObjectTypeConfig<T, U>, GraphQLInterfaceType>,
  ) {
  }

  get type() {
    return createInterface(this.registry);
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

function toUnionTypeConfig<T, U>(
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

export function createScalar(
  registry: Registry<
    GraphQLScalarTypeConfig<unknown, unknown>,
    GraphQLScalarType
  >,
): GraphQLScalarType {
  const instance = registry.instance.value;

  if (instance) return instance;

  const config = registry.config.value;

  if (!config) throw new Error(`not found`);

  const type = new GraphQLScalarType(config);

  registry.instance.set(type);

  return type;
}

export function createObject<T, U>(
  registry: Registry<ObjectTypeConfig<T, U>, GraphQLObjectType<T, U>>,
): GraphQLObjectType<T, U> {
  const instance = registry.instance.value;

  if (instance) return instance;

  const raw = registry.config.value;

  if (!raw) throw new Error(`not found`);

  const config = toObjectTypeConfig(raw);
  const type = new GraphQLObjectType(config);

  registry.instance.set(type);

  return type;
}

export function createInputObject(
  registry: Registry<InputObjectTypeConfig, GraphQLInputObjectType>,
): GraphQLInputObjectType {
  const instance = registry.instance.value;

  if (instance) return instance;

  const raw = registry.config.value;

  if (!raw) throw new Error();

  const config = toInputObjectTypeConfig(raw);
  const type = new GraphQLInputObjectType(config);

  registry.instance.set(type);

  return type;
}

export function createUnion<T, U>(
  registry: Registry<UnionTypeConfig<T, U>, GraphQLUnionType>,
) {
  const instance = registry.instance.value;

  if (instance) return instance;

  const raw = registry.config.value;

  if (!raw) throw new Error();

  const config = toUnionTypeConfig(raw);
  const type = new GraphQLUnionType(config);

  registry.instance.set(type);

  return type;
}

export function createEnum(
  registry: Registry<GraphQLEnumTypeConfig, GraphQLEnumType>,
) {
  const instance = registry.instance.value;

  if (instance) return instance;

  const config = registry.config.value;

  if (!config) throw new Error();

  const type = new GraphQLEnumType(config);
  registry.instance.set(type);

  return type;
}

export function createInterface<T, U>(
  registry: Registry<ObjectTypeConfig<T, U>, GraphQLInterfaceType>,
) {
  const instance = registry.instance.value;

  if (instance) return instance;

  const config = registry.config.value;

  if (!config) throw new Error(`not found`);

  const type = new GraphQLInterfaceType({
    name: config.name,
    fields: () => {
      const fields = mapValues(
        config.fields,
        toFieldConfig,
      );

      return fields;
    },
  });
  registry.instance.set(type);

  return type;
}

function type<T extends Type | GraphQLType>(
  value: T,
): T extends Type ? T["type"] : T {
  // deno-lint-ignore no-explicit-any
  return "type" in value ? value.type as any : value as any;
}
