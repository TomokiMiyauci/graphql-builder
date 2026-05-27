import {
  type GraphQLEnumTypeConfig,
  GraphQLList,
  type GraphQLNamedType,
  GraphQLNonNull,
  type GraphQLScalarTypeConfig,
  isScalarType,
} from "graphql";
import type {
  BaseNamedType,
  Builder,
  EnumType,
  InputObjectType,
  InputObjectTypeConfig,
  InterfaceType,
  InterfaceTypeConfig,
  List,
  NonNull,
  ObjectType,
  ObjectTypeConfig,
  ScalarType,
  Type,
  UnionType,
  UnionTypeConfig,
} from "./type.ts";
import {
  EnumTypeBuilder,
  InputObjectTypeBuilder,
  InterfaceTypeBuilder,
  ObjectTypeBuilder,
  ScalarTypeBuilder,
  UnionTypeBuilder,
} from "./factory.ts";
import {
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType,
} from "graphql";
import { UnoverwriteableMap } from "./util.ts";

export interface BuilderOptions {
  types?: GraphQLNamedType[];
}

export class SchemaBuilder {
  constructor(options?: BuilderOptions) {
    if (options?.types) {
      for (const type of options.types) {
        this.#set(type.name, {
          build() {
            return type;
          },
        });
      }
    }
  }

  #get(name: string): GraphQLNamedType {
    const builder = this.#map.get(name);

    if (builder) {
      return builder.type;
    }

    throw new Error(`"${name}" is referenced but not implemented`);
  }

  /**
   * @throws {Error}
   */
  #set(name: string, builder: Builder): void {
    const cached = this.#cache;
    const definition = {
      get type() {
        const instance = cached.get(name);

        if (instance) return instance;

        const type = builder.build();

        cached.set(name, type);

        return type;
      },
    };

    try {
      this.#map.set(name, definition);
    } catch {
      throw new Error(`"${name}" already exists`);
    }
  }

  #map: Map<string, BaseNamedType> = new UnoverwriteableMap();
  #cache: Map<string, GraphQLNamedType> = new Map();

  scalar<T, U>(config: GraphQLScalarTypeConfig<T, U>): ScalarType<T, U>;
  scalar(name: string): ScalarType;
  scalar(
    nameOrConfig: string | GraphQLScalarTypeConfig<unknown, unknown>,
  ): ScalarType {
    const name = normalizeName(nameOrConfig);
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(name, new ScalarTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        const type = get(name);

        if (isScalarType(type)) return type;

        throw new Error();
      },
    };
  }

  objectType<T, U, A = unknown>(
    config: ObjectTypeConfig<T, U, A>,
  ): ObjectType<T, U>;
  objectType(name: string): ObjectType<unknown, unknown>;
  objectType(
    nameOrConfig: string | ObjectTypeConfig<unknown, unknown>,
  ): ObjectType<unknown, unknown> {
    const name = normalizeName(nameOrConfig);
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(name, new ObjectTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        const type = get(name);

        if (isObjectType(type)) return type;

        throw new Error();
      },
    };
  }

  inputObjectType(config: InputObjectTypeConfig): InputObjectType;
  inputObjectType(name: string): InputObjectType;
  inputObjectType(
    nameOrConfig: string | InputObjectTypeConfig,
  ): InputObjectType {
    const name = normalizeName(nameOrConfig);
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(name, new InputObjectTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        const type = get(name);

        if (isInputObjectType(type)) return type;

        throw new Error();
      },
    };
  }

  unionType<T, U>(config: UnionTypeConfig<T, U>): UnionType;
  unionType(name: string): UnionType;
  unionType(
    nameOrConfig: string | UnionTypeConfig<unknown, unknown>,
  ): UnionType {
    const name = normalizeName(nameOrConfig);
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(name, new UnionTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        const type = get(name);

        if (isUnionType(type)) return type;

        throw new Error();
      },
    };
  }

  enumType(config: GraphQLEnumTypeConfig): EnumType;
  enumType(name: string): EnumType;
  enumType(nameOrConfig: string | GraphQLEnumTypeConfig): EnumType {
    const name = normalizeName(nameOrConfig);
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(name, new EnumTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        const type = get(name);

        if (isEnumType(type)) return type;

        throw new Error();
      },
    };
  }

  interfaceType<T, U>(config: InterfaceTypeConfig<T, U>): InterfaceType;
  interfaceType(name: string): InterfaceType;
  interfaceType(
    nameOrConfig: string | InterfaceTypeConfig<unknown, unknown>,
  ): InterfaceType {
    const name = normalizeName(nameOrConfig);
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(name, new InterfaceTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        const type = get(name);

        if (isInterfaceType(type)) return type;

        throw new Error();
      },
    };
  }

  types(): GraphQLNamedType[] {
    return this.#map.values().map((builder) => builder.type).toArray();
  }
}

type NameOrNamed = string | Named;

interface Named {
  name: string;
}

function normalizeName(nameOrNamed: NameOrNamed): string {
  return typeof nameOrNamed === "string" ? nameOrNamed : nameOrNamed.name;
}

export function list<T extends Type>(type: T): List<T["type"]> {
  return {
    get type() {
      const instance = type.type;

      return new GraphQLList(instance);
    },
  };
}

export function nonNull<T extends Type>(type: T): NonNull<T["type"]> {
  return {
    get type() {
      const instance = type.type;

      return new GraphQLNonNull(instance);
    },
  };
}

function isNamed(nameOrNamed: NameOrNamed): nameOrNamed is Named {
  return typeof nameOrNamed === "object";
}
