import type {
  GraphQLEnumType,
  GraphQLFieldResolver,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
} from "graphql";

export interface ObjectType<T, U> extends Builder {
  type: "object";
  get definition(): GraphQLObjectType<T, U>;
}

export interface InputObjectType extends Builder {
  type: "input-object";
  get definition(): GraphQLInputObjectType;
}

export interface UnionTypeConfig {
  name: string;
  description?: string;
  types: readonly ObjectType<unknown, unknown>[];
}

export interface EnumType extends Builder {
  type: "enum";
  get definition(): GraphQLEnumType;
}

export interface ScalarType<T = unknown, U = T> extends Builder {
  type: "scalar";
  get definition(): GraphQLScalarType<T, U>;
}

interface Builder {
  type: string;
  get definition(): GraphQLNamedType;
}

export interface ObjectTypeConfig<TSource, TContext, TArgs = unknown> {
  name: string;
  description?: string;
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

export interface FieldConfig<T, U, TArgs = unknown> {
  description?: string;
  type: OutputType<T, U>;
  resolve?: GraphQLFieldResolver<T, U, TArgs>;
  deprecationReason?: string;
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
