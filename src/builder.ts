import { GraphQLEnumTypeConfig, GraphQLScalarTypeConfig } from "graphql";
import type {
  EnumType,
  InputObjectType,
  InputObjectTypeConfig,
  InterfaceType,
  InterfaceTypeConfig,
  ObjectRef,
  ObjectType,
  ObjectTypeConfig,
  RefType,
  Registry,
  ScalarType,
  Type,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  EnumTypeBuilder,
  InputObjectTypeBuilder,
  InterfaceTypeBuilder,
  ObjectRefTypeBuilder,
  ObjectTypeBuilder,
  RefTypeBuilder,
  ScalarTypeBuilder,
  UnionTypeBuilder,
} from "./factory.ts";

export class SchemaBuilder {
  #registry: Registry = new Map();

  scalar<T, U>(config: GraphQLScalarTypeConfig<T, U>): ScalarType<T, U> {
    this.#assertExist(config.name);

    const scalar = new ScalarTypeBuilder(config);

    this.#registry.set(config.name, scalar);

    return scalar;
  }

  objectType<T, U>(config: ObjectTypeConfig<T, U>): ObjectType<T, U> {
    this.#assertExist(config.name);

    const objectType = new ObjectTypeBuilder(config);

    this.#registry.set(config.name, objectType);

    return objectType;
  }

  inputObjectType(config: InputObjectTypeConfig): InputObjectType {
    this.#assertExist(config.name);

    const inputObjectType = new InputObjectTypeBuilder(config);

    this.#registry.set(config.name, inputObjectType);

    return inputObjectType;
  }

  ref(name: string): RefType {
    const registry = this.#registry;

    const builder = new RefTypeBuilder(registry, name);

    return builder;
  }

  objectRef(name: string): ObjectRef<unknown, unknown> {
    const registry = this.#registry;
    const builder = new ObjectRefTypeBuilder(registry, name);

    return builder;
  }

  unionType(config: UnionTypeConfig): UnionType {
    const union = new UnionTypeBuilder(config);

    return union;
  }

  enumType(config: GraphQLEnumTypeConfig): EnumType {
    const type = new EnumTypeBuilder(config);

    this.#registry.set(config.name, type);

    return type;
  }

  interfaceType<T, U>(config: InterfaceTypeConfig<T, U>): InterfaceType {
    const type = new InterfaceTypeBuilder(config);

    return type;
  }

  types(): Type[] {
    return this.#registry.values().toArray();
  }

  #assertExist(name: string): void {
    if (this.#registry.has(name)) {
      throw new Error(`Already exists "${name}"`);
    }
  }
}
