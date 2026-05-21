import {
  type GraphQLFieldResolver,
  GraphQLInputObjectType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLScalarType,
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
  types: readonly RefOrObject<unknown, unknown>[];
}

export interface EnumType extends Builder {
  type: "enum";
}

export type RefOrObject<T, U> = ObjectType<T, U> | ObjectRef<T, U>;

export interface ScalarType<T = unknown, U = T> extends Builder {
  type: "scalar";
  get definition(): GraphQLScalarType<T, U>;
}

interface Builder {
  type: string;
  get definition(): GraphQLNamedType;
}

export interface ObjectTypeConfig<TSource, TContext> {
  name: string;
  description?: string;
  fields: Record<string, FieldConfig<TSource, TContext>>;
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
}

export interface InputFieldConfig {
  description?: string;
  type: InputType;
  defaultValue?: unknown;
  deprecationReason?: string;
}

export type OutputType<T, U> =
  | ObjectType<T, U>
  | RefType
  | ScalarType
  | UnionType
  | EnumType
  | InterfaceType;

export type InputType = InputObjectType | RefType | ScalarType;

export interface RefType extends Builder {
  type: "ref";
}

export interface ObjectRef<T, U> extends RefType {
  get definition(): GraphQLObjectType<T, U>;
}

export interface UnionType extends Builder {
  type: "union";
}

export interface InterfaceType extends Builder {
  type: "interface";
}

export type Type = InputType | OutputType<any, any>;

export type Registry = Map<string, Type>;
