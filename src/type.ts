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

export interface ObjectType<T, U> extends Builder {
  readonly type: GraphQLObjectType<T, U>;
}

export interface InputObjectType extends Builder {
  readonly type: GraphQLInputObjectType;
}

export interface UnionTypeConfig<T, U>
  extends Omit<GraphQLUnionTypeConfig<T, U>, "types"> {
  types: readonly (ObjectType<T, U> | GraphQLObjectType<T, U>)[];
}

export interface EnumType extends Builder {
  readonly type: GraphQLEnumType;
}

export interface ScalarType<T = unknown, U = T> extends Builder {
  readonly type: GraphQLScalarType<T, U>;
}

interface Builder {
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

export interface UnionType extends Builder {
  readonly type: GraphQLUnionType;
}

export interface InterfaceType extends Builder {
  readonly type: GraphQLInterfaceType;
}

export interface List<T extends GraphQLType> extends Builder {
  readonly type: GraphQLList<T>;
}

export interface NonNull<T extends GraphQLType> extends Builder {
  readonly type: GraphQLNonNull<T>;
}

export type Type =
  | ScalarType
  | ObjectType<any, any>
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
