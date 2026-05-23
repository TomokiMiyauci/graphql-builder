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
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  GraphQLType,
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
  readonly definition: GraphQLType;
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
  | InterfaceType;

export type InputType =
  | InputObjectType
  | ScalarType
  | EnumType
  | List;

export interface UnionType extends Builder {
  type: "union";

  readonly definition: GraphQLUnionType;
}

export interface InterfaceType extends Builder {
  type: "interface";

  readonly definition: GraphQLInterfaceType;
}

export interface List extends Builder {
  type: "list";
  readonly definition: GraphQLList<GraphQLType>;
}

export type Type =
  | ScalarType
  | ObjectType<any, any>
  | InterfaceType
  | UnionType
  | EnumType
  | InputObjectType
  | List;

export type FieldConfigArgumentMap = Record<string, ArgumentConfig>;

export interface ArgumentConfig extends Omit<GraphQLArgumentConfig, "type"> {
  type: InputType | GraphQLInputType;
}
