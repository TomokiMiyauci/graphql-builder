import {
  GraphQLEnumType,
  type GraphQLEnumTypeConfig,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  type GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  type GraphQLScalarTypeConfig,
  GraphQLUnionType,
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

export interface BuilderOptions {
  types?: GraphQLNamedType[];
}

interface TypeMap {
  object: GraphQLObjectType;
  scalar: GraphQLScalarType;
  enum: GraphQLEnumType;
  union: GraphQLUnionType;
  inputObject: GraphQLInputObjectType;
  interface: GraphQLInterfaceType;
}

type TypeKey = keyof TypeMap;

interface Lock<T extends TypeKey> {
  readonly name: string;
  readonly typeKey: T;
}

function getType(named: GraphQLNamedType): TypeKey {
  if (named instanceof GraphQLObjectType) return "object";
  if (named instanceof GraphQLScalarType) return "scalar";
  if (named instanceof GraphQLEnumType) return "enum";
  if (named instanceof GraphQLUnionType) return "union";
  if (named instanceof GraphQLInputObjectType) return "inputObject";
  if (named instanceof GraphQLInterfaceType) return "interface";

  throw new Error("unreachable");
}

export class SchemaBuilder {
  constructor(options?: BuilderOptions) {
    if (options?.types) {
      for (const type of options.types) {
        const name = getType(type);
        const lock = this.#getLock(type.name, name);

        this.#set(lock, {
          build() {
            return type;
          },
        });
      }
    }
  }

  scalar<T, U>(config: GraphQLScalarTypeConfig<T, U>): ScalarType<T, U>;
  scalar(name: string): ScalarType;
  scalar(
    nameOrConfig: string | GraphQLScalarTypeConfig<unknown, unknown>,
  ): ScalarType {
    const name = normalizeName(nameOrConfig);
    const lock = this.#getLock(name, "scalar");
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(lock, new ScalarTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        return get(lock);
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
    const lock = this.#getLock(name, "object");

    if (isNamed(nameOrConfig)) {
      this.#set(lock, new ObjectTypeBuilder(nameOrConfig));
    }

    const get = this.#get.bind(this);

    return {
      get type() {
        return get(lock);
      },
    };
  }

  #cache: Map<string, GraphQLNamedType> = new Map();

  #map: Map<string, BaseNamedType> = new Map();

  #typeRegistry: Map<string, TypeKey> = new Map();

  #getLock<T extends TypeKey>(name: string, type: T): Lock<T> {
    const typeKey = this.#typeRegistry.get(name);

    if (this.#typeRegistry.has(name)) {
      if (typeKey !== type) {
        throw new Error(`"${name}" already exists`);
      }
    } else {
      this.#typeRegistry.set(name, type);
    }

    return {
      name,
      typeKey: type,
    };
  }

  #get<T extends TypeKey>(lock: Lock<T>): TypeMap[T] {
    const definition = this.#map.get(lock.name);

    if (!definition) {
      throw new Error(`"${lock.name}" is referenced but not implemented`);
    }

    return definition.type as TypeMap[T];
  }

  #set<T extends TypeKey>(lock: Lock<T>, builder: Builder): void {
    if (this.#map.has(lock.name)) {
      throw new Error(`"${lock.name}" already exists`);
    }

    const cache = this.#cache;
    const name = lock.name;

    const definition = {
      get type() {
        if (cache.has(name)) {
          return cache.get(name)!;
        }

        const instance = builder.build();

        cache.set(name, instance);

        return instance;
      },
    };

    this.#map.set(lock.name, definition);
  }

  inputObjectType(config: InputObjectTypeConfig): InputObjectType;
  inputObjectType(name: string): InputObjectType;
  inputObjectType(
    nameOrConfig: string | InputObjectTypeConfig,
  ): InputObjectType {
    const name = normalizeName(nameOrConfig);
    const lock = this.#getLock(name, "inputObject");
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(lock, new InputObjectTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        return get(lock);
      },
    };
  }

  unionType<T, U>(config: UnionTypeConfig<T, U>): UnionType;
  unionType(name: string): UnionType;
  unionType(
    nameOrConfig: string | UnionTypeConfig<unknown, unknown>,
  ): UnionType {
    const name = normalizeName(nameOrConfig);
    const lock = this.#getLock(name, "union");
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(lock, new UnionTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        return get(lock);
      },
    };
  }

  enumType(config: GraphQLEnumTypeConfig): EnumType;
  enumType(name: string): EnumType;
  enumType(nameOrConfig: string | GraphQLEnumTypeConfig): EnumType {
    const name = normalizeName(nameOrConfig);
    const lock = this.#getLock(name, "enum");
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(lock, new EnumTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        return get(lock);
      },
    };
  }

  interfaceType<T, U>(config: InterfaceTypeConfig<T, U>): InterfaceType;
  interfaceType(name: string): InterfaceType;
  interfaceType(
    nameOrConfig: string | InterfaceTypeConfig<unknown, unknown>,
  ): InterfaceType {
    const name = normalizeName(nameOrConfig);
    const lock = this.#getLock(name, "interface");
    const get = this.#get.bind(this);

    if (isNamed(nameOrConfig)) {
      this.#set(lock, new InterfaceTypeBuilder(nameOrConfig));
    }

    return {
      get type() {
        return get(lock);
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
