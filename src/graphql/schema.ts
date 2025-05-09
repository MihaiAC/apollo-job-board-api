import { makeExecutableSchema } from "@graphql-tools/schema";
import { employerTypeDef } from "./typeDefs/employerTypeDef";
import { employerResolvers } from "./resolvers/employerResolver";

export const schema = makeExecutableSchema({
  typeDefs: [employerTypeDef],
  resolvers: [employerResolvers],
});
