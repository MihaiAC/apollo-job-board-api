import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./typeDefs/employerTypeDef";
import { employerResolvers } from "./resolvers/employerResolver";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: employerResolvers,
});
