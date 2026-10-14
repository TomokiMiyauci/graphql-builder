import { SchemaBuilder } from "./builder.ts";
import { GraphQLSchema, GraphQLString, printSchema } from "graphql";
import { assertEquals } from "@std/assert";

Deno.test("SchemaBuilder", () => {
  const builder = new SchemaBuilder();

  builder.objectType({
    name: "Directory",
    fields: {
      child: {
        type: builder.objectType("Directory"),
      },
      name: {
        type: GraphQLString,
      },
    },
  });
  const types = builder.types();
  const schema = new GraphQLSchema({ types });
  const raw = printSchema(schema);

  assertEquals(
    raw,
    `type Directory {
  child: Directory
  name: String
}`,
  );
});
