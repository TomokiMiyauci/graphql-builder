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

    return this.#register(config.name, scalar);
  }

  objectType<T, U>(config: ObjectTypeConfig<T, U>): ObjectType<T, U> {
    this.#assertExist(config.name);

    const objectType = new ObjectTypeBuilder(config);

    return this.#register(config.name, objectType);
  }

  inputObjectType(config: InputObjectTypeConfig): InputObjectType {
    this.#assertExist(config.name);

    const inputObjectType = new InputObjectTypeBuilder(config);

    return this.#register(config.name, inputObjectType);
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
    this.#assertExist(config.name);

    const union = new UnionTypeBuilder(config);

    return this.#register(config.name, union);
  }

  enumType(config: GraphQLEnumTypeConfig): EnumType {
    this.#assertExist(config.name);

    const type = new EnumTypeBuilder(config);

    return this.#register(config.name, type);
  }

  interfaceType<T, U>(config: InterfaceTypeConfig<T, U>): InterfaceType {
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
