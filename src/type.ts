import type {
  GraphQLArgumentConfig,
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInputObjectTypeConfig,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLNullableInputType,
  GraphQLNullableOutputType,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
  GraphQLUnionTypeConfig,
} from "graphql";

// deno-lint-ignore no-explicit-any
export interface ObjectType<T = any, U = any> extends BaseType {
  readonly type: GraphQLObjectType<T, U>;
}

export interface InputObjectType extends BaseType {
  readonly type: GraphQLInputObjectType;
}

export interface UnionTypeConfig<T, U>
  extends Omit<GraphQLUnionTypeConfig<T, U>, "types"> {
  types: readonly (ObjectType<T, U> | GraphQLObjectType<T, U>)[];
}

export interface EnumType extends BaseType {
  readonly type: GraphQLEnumType;
}

export interface ScalarType<T = unknown, U = T> extends BaseType {
  readonly type: GraphQLScalarType<T, U>;
}

export interface BaseType {
  readonly type: GraphQLType;
}

export interface BaseNamedType extends BaseType {
  readonly type: GraphQLNamedType;
}

export interface ObjectTypeConfig<TSource, TContext, TArgs = unknown>
  extends Omit<GraphQLObjectTypeConfig<TSource, TContext>, "fields"> {
  fields: Record<string, FieldConfig<TSource, TContext, TArgs>>;
}

export interface InputObjectTypeConfig
  extends Omit<GraphQLInputObjectTypeConfig, "fields"> {
  fields: Record<string, InputFieldConfig>;
}

export interface InterfaceTypeConfig<TSource, TContext> {
  name: string;
  description?: string;
  fields: Record<string, FieldConfig<TSource, TContext>>;
}

export interface FieldConfig<T, U, TArgs = unknown>
  extends Omit<GraphQLFieldConfig<T, U, TArgs>, "type" | "args"> {
  type: OutputType | GraphQLOutputType;
  args?: FieldConfigArgumentMap;
}

export interface InputFieldConfig
  extends Omit<GraphQLInputFieldConfig, "type"> {
  type: InputType | GraphQLInputType;
}

export type OutputType =
  | NonNull<GraphQLNullableOutputType>
  | NullableOutputType;

export type NullableOutputType = NamedOutputType | List<GraphQLOutputType>;

export type NamedOutputType =
  | ScalarType
  | EnumType
  | ObjectType
  | UnionType
  | InterfaceType;

export type InputType = NullableInputType | NonNull<GraphQLNullableInputType>;

export type NullableInputType = NamedInputType | List<GraphQLInputType>;

export interface UnionType extends BaseType {
  readonly type: GraphQLUnionType;
}

export interface InterfaceType extends BaseType {
  readonly type: GraphQLInterfaceType;
}

export interface List<T extends GraphQLType> extends BaseType {
  readonly type: GraphQLList<T>;
}

export interface NonNull<T extends GraphQLNullableType> extends BaseType {
  readonly type: GraphQLNonNull<T>;
}

export type Type = NamedType | WrappingType;

export type NullableType = NamedType | List<GraphQLType>;

export type NamedType = NamedInputType | NamedOutputType;

export type NamedInputType = ScalarType | EnumType | InputObjectType;

export type WrappingType = List<GraphQLType> | NonNull<GraphQLNullableType>;

export type FieldConfigArgumentMap = Record<string, ArgumentConfig>;

export interface ArgumentConfig extends Omit<GraphQLArgumentConfig, "type"> {
  type: InputType | GraphQLInputType;
}

export interface Builder {
  build(): GraphQLNamedType;
}
