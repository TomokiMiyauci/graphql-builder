import { GraphQLEnumTypeConfig, GraphQLScalarTypeConfig } from "graphql";
import type {
  EnumType,
  InterfaceType,
  InterfaceTypeConfig,
  ObjectRef,
  ObjectType,
  ObjectTypeConfig,
  Ref,
  ScalarType,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  EnumTypeBuilder,
  InterfaceTypeBuilder,
  ObjectTypeBuilder,
  ScalarTypeBuilder,
  UnionTypeBuilder,
} from "./factory.ts";

export class SchemaBuilder {
  #registry: Map<string, ScalarType | ObjectType<any, any> | EnumType> =
    new Map();

  scalar<Y, Z>(config: GraphQLScalarTypeConfig<Y, Z>): ScalarType {
    const scalar = new ScalarTypeBuilder(config);
    const type = this.#registry.getOrInsert(config.name, scalar);

    if (type.type !== "scalar") throw new Error();

    return type;
  }

  objectType<T, U>(config: ObjectTypeConfig<T, U>): ObjectType<T, U> {
    const objectType = new ObjectTypeBuilder(config);
    const type = this.#registry.getOrInsert(config.name, objectType);

    if (type.type !== "object") throw new Error();

    return type;
  }

  list() {}

  ref(name: string): Ref {
    const registry = this.#registry;

    return {
      type: "ref",
      get definition() {
        const result = registry.get(name);

        if (!result) throw new Error();

        return result.definition;
      },
    };
  }

  objectRef(name: string): ObjectRef<unknown, unknown> {
    const registry = this.#registry;

    return {
      type: "ref",
      get definition() {
        const result = registry.get(name);

        if (!result) throw new Error();
        if (result.type !== "object") throw new Error();

        return result.definition;
      },
    };
  }

  unionType<T, U>(config: UnionTypeConfig): UnionType {
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
}
