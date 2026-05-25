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
  GraphQLNonNull,
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

interface BaseType {
  readonly type: GraphQLType;
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
  type: OutputType<T, U> | GraphQLFieldConfig<T, U, TArgs>["type"];
  args?: FieldConfigArgumentMap;
}

export interface InputFieldConfig
  extends Omit<GraphQLInputFieldConfig, "type"> {
  type: InputType | GraphQLInputType;
}

export type OutputType<T, U> =
  | ObjectType<T, U>
  | ScalarType
  | UnionType
  | EnumType
  | InterfaceType
  | List<GraphQLOutputType>
  | NonNull<GraphQLOutputType>;

export type InputType =
  | InputObjectType
  | ScalarType
  | EnumType
  | List<GraphQLInputType>
  | NonNull<GraphQLInputType>;

export interface UnionType extends BaseType {
  readonly type: GraphQLUnionType;
}

export interface InterfaceType extends BaseType {
  readonly type: GraphQLInterfaceType;
}

export interface List<T extends GraphQLType> extends BaseType {
  readonly type: GraphQLList<T>;
}

export interface NonNull<T extends GraphQLType> extends BaseType {
  readonly type: GraphQLNonNull<T>;
}

export type Type =
  | ScalarType
  | ObjectType
  | InterfaceType
  | UnionType
  | EnumType
  | InputObjectType
  | List<GraphQLType>
  | NonNull<GraphQLType>;

export type FieldConfigArgumentMap = Record<string, ArgumentConfig>;

export interface ArgumentConfig extends Omit<GraphQLArgumentConfig, "type"> {
  type: InputType | GraphQLInputType;
}
