import {
  type GraphQLFieldResolver,
  GraphQLNamedOutputType,
  GraphQLObjectType,
  GraphQLScalarType,
} from "graphql";

export interface ObjectType<T, U> extends Builder {
  type: "object";
  get definition(): GraphQLObjectType<T, U>;
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

export interface ScalarType extends Builder {
  type: "scalar";
  get definition(): GraphQLScalarType;
}

interface Builder {
  type: string;
  get definition(): GraphQLNamedOutputType;
}

export interface ObjectTypeConfig<TSource, TContext> {
  name: string;
  description?: string;
  fields: Record<string, FieldConfig<TSource, TContext>>;
}

export interface InterfaceTypeConfig<TSource, TContext> {
  name: string;
  description?: string;
  fields: Record<string, FieldConfig<TSource, TContext>>;
}

export interface FieldConfig<T, U, TArgs = unknown> {
  description?: string;
  type: OutputConfig<T, U>;
  resolve?: GraphQLFieldResolver<T, U, TArgs>;
  deprecationReason?: string;
}

export type OutputConfig<T, U> =
  | ObjectType<T, U>
  | Ref
  | ScalarType
  | UnionType
  | EnumType
  | InterfaceType;

export interface Ref extends Builder {
  type: "ref";
}

export interface ObjectRef<T, U> extends Ref {
  get definition(): GraphQLObjectType<T, U>;
}

export interface UnionType extends Builder {
  type: "union";
}

export interface InterfaceType extends Builder {
  type: "interface";
}

export type Type = ScalarType | ObjectType<any, any> | EnumType;

export type Registry = Map<string, Type>;
