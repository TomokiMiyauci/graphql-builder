import type {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  GraphQLUnionType,
  GraphQLUnionTypeConfig,
} from "graphql";

export interface ObjectType<T, U> extends Builder {
  type: "object";
  readonly definition: GraphQLObjectType<T, U>;
}

export interface InputObjectType extends Builder {
  type: "input-object";
  readonly definition: GraphQLInputObjectType;
}

export interface UnionTypeConfig<T, U>
  extends Omit<GraphQLUnionTypeConfig<T, U>, "types"> {
  types: readonly (ObjectType<T, U> | GraphQLObjectType<T, U>)[];
}

export interface EnumType extends Builder {
  type: "enum";
  readonly definition: GraphQLEnumType;
}

export interface ScalarType<T = unknown, U = T> extends Builder {
  type: "scalar";
  readonly definition: GraphQLScalarType<T, U>;
}

interface Builder {
  type: string;
  readonly definition: GraphQLNamedType;
}

export interface ObjectTypeConfig<TSource, TContext, TArgs = unknown>
  extends Omit<GraphQLObjectTypeConfig<TSource, TContext>, "fields"> {
  fields: Record<string, FieldConfig<TSource, TContext, TArgs>>;
}

export interface InputObjectTypeConfig {
  name: string;
  fields: Record<string, InputFieldConfig>;
}

export interface InterfaceTypeConfig<TSource, TContext> {
  name: string;
  description?: string;
  fields: Record<string, FieldConfig<TSource, TContext>>;
}

export interface FieldConfig<T, U, TArgs = unknown>
  extends Omit<GraphQLFieldConfig<T, U, TArgs>, "type" | "args"> {
  type: OutputType<T, U> | GraphQLFieldConfig<T, U, TArgs>["type"];
  args?: FieldConfigArgumentMap;
}

export interface InputFieldConfig {
  description?: string;
  type: InputType;
  defaultValue?: unknown;
  deprecationReason?: string;
}

export type OutputType<T, U> =
  | ObjectType<T, U>
  | ScalarType
  | UnionType
  | EnumType
  | InterfaceType;

export type InputType = InputObjectType | ScalarType;

export interface UnionType extends Builder {
  type: "union";

  get definition(): GraphQLUnionType;
}

export interface InterfaceType extends Builder {
  type: "interface";

  get definition(): GraphQLInterfaceType;
}

export type Type = InputType | OutputType<any, any>;

export type Registry = Map<string, Type>;

export type FieldConfigArgumentMap = Record<string, ArgumentConfig>;

export interface ArgumentConfig {
  description?: string;
  type: InputType;
  defaultValue?: unknown;
  deprecationReason?: string;
}
