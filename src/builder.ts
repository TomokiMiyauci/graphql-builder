import {
  type GraphQLEnumType,
  type GraphQLEnumTypeConfig,
  type GraphQLInputObjectType,
  type GraphQLInterfaceType,
  GraphQLList,
  type GraphQLNamedType,
  GraphQLNonNull,
  type GraphQLObjectType,
  type GraphQLScalarType,
  type GraphQLScalarTypeConfig,
  type GraphQLUnionType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isScalarType,
  isUnionType,
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
  if (isObjectType(named)) return "object";
  if (isScalarType(named)) return "scalar";
  if (isEnumType(named)) return "enum";
  if (isUnionType(named)) return "union";
  if (isInputObjectType(named)) return "inputObject";
  if (isInterfaceType(named)) return "interface";

  throw new Error("unreachable");
}

function getConstructorName(key: TypeKey): string {
  switch (key) {
    case "object": {
      return "GraphQLObjectType";
    }
    case "scalar": {
      return "GraphQLScalarType";
    }
    case "enum": {
      return "GraphQLEnumType";
    }
    case "union": {
      return "GraphQLUnionType";
    }
    case "inputObject": {
      return "GraphQLInputObjectType";
    }
    case "interface": {
      return "GraphQLInterfaceType";
    }
  }
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

  scalarType<T, U>(config: GraphQLScalarTypeConfig<T, U>): ScalarType<T, U>;
  /**
   * @example Basic Reference
   * ```ts
   * const builder = new SchemaBuilder();
   * builder.scalarType("ref");
   * ```
   *
   * @throws {Error} If the reference has already been registered with a different type.
   */
  scalarType(name: string): ScalarType;
  scalarType(
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

  /**
   * @example Create definition with config
   * ```ts
   * const builder = new SchemaBuilder();
   * builder.objectType({ name: "Post", fields: { author: { type: builder.objectType("Author") } } })
   * ```
   *
   * @throws {Error} If the reference has already been registered with a different type.
   */
  objectType<T, U, A = unknown>(
    config: ObjectTypeConfig<T, U, A>,
  ): ObjectType<T, U>;
  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
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

  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
  #getLock<T extends TypeKey>(name: string, type: T): Lock<T> {
    const typeKey = this.#typeRegistry.get(name);

    if (this.#typeRegistry.has(name)) {
      if (typeKey !== type) {
        const constructorName = getConstructorName(type);

        throw new Error(`"${name}" already referenced as ${constructorName}`);
      }
    } else {
      this.#typeRegistry.set(name, type);
    }

    return {
      name,
      typeKey: type,
    };
  }

  /**
   * @throws {Error} If the config does not exists
   */
  #get<T extends TypeKey>(lock: Lock<T>): TypeMap[T] {
    const definition = this.#map.get(lock.name);

    if (!definition) {
      const constructorName = getConstructorName(lock.typeKey);

      throw new Error(
        `"${lock.name}" is referenced as ${constructorName}, but not implemented`,
      );
    }

    return definition.type as TypeMap[T];
  }

  #set<T extends TypeKey>(lock: Lock<T>, builder: Builder): void {
    if (this.#map.has(lock.name)) {
      const constructorName = getConstructorName(lock.typeKey);

      throw new Error(`"${lock.name}" already exists as ${constructorName}`);
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

  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
  inputObjectType(config: InputObjectTypeConfig): InputObjectType;
  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
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

  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
  unionType<T, U>(config: UnionTypeConfig<T, U>): UnionType;
  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
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

  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
  enumType(config: GraphQLEnumTypeConfig): EnumType;
  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
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

  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
  interfaceType<T, U>(config: InterfaceTypeConfig<T, U>): InterfaceType;
  /**
   * @throws {Error} If the reference has already been registered with a different type.
   */
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
    return [...this.#map.values()].map((definition) => definition.type);
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
