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

class Scope {
  #map: Map<string, { registry: Registry<any, any>; group: string }> =
    new Map();

  getOrInsert<T, U>(
    name: string,
    group: string,
    registry: Registry<T, U>,
  ): Registry<T, U> {
    if (this.#map.has(name)) {
      const pair = this.#map.get(name)!;

      if (group === pair.group) {
        return pair.registry;
      }

      throw new Error(`"${name}" is already defined as "${group}"`);
    } else {
      this.#map.set(name, { registry, group });
      return registry;
    }
  }
}

export class SchemaBuilder {
  #registry = new Scope();

  scalar<T, U>(
    nameOrConfig: string | GraphQLScalarTypeConfig<T, U>,
  ): ScalarType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "scalar",
      new Registry<GraphQLScalarTypeConfig<T, U>, GraphQLScalarType>(),
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    return new ScalarTypeBuilder(registry);
  }

  objectType<T, U>(
    nameOrConfig: string | ObjectTypeConfig<T, U>,
  ): ObjectType<T, U> {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "object",
      new Registry<ObjectTypeConfig<T, U>, GraphQLObjectType<T, U>>(),
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    return new ObjectTypeBuilder(registry);
  }

  inputObjectType(
    nameOrConfig: string | InputObjectTypeConfig,
  ): InputObjectType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "input-object",
      new Registry<InputObjectTypeConfig, GraphQLInputObjectType>(),
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const inputObjectType = new InputObjectTypeBuilder(registry);

    return inputObjectType;
  }

  unionType(nameOrConfig: string | UnionTypeConfig): UnionType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "union",
      new Registry<UnionTypeConfig, GraphQLUnionType>(),
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const union = new UnionTypeBuilder(registry);

    return union;
  }

  enumType(nameOrConfig: string | GraphQLEnumTypeConfig): EnumType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "enum",
      new Registry<GraphQLEnumTypeConfig, GraphQLEnumType>(),
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const type = new EnumTypeBuilder(registry);

    return type;
  }

  interfaceType<T, U>(
    nameOrConfig: string | InterfaceTypeConfig<T, U>,
  ): InterfaceType {
    const name = normalizeName(nameOrConfig);
    const registry = this.#registry.getOrInsert(
      name,
      "interface",
      new Registry<InterfaceTypeConfig<T, U>, GraphQLInterfaceType>(),
    );

    if (typeof nameOrConfig === "object") {
      registry.config.set(nameOrConfig);
    }

    const type = new InterfaceTypeBuilder(registry);

    return type;
  }
}

type NameOrNamed = string | Named;

interface Named {
  name: string;
}

function normalizeName(nameOrNamed: NameOrNamed): string {
  return typeof nameOrNamed === "string" ? nameOrNamed : nameOrNamed.name;
}
