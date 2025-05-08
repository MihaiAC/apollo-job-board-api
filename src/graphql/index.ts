import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./typeDefs/employer";
import { employerResolvers } from "./resolvers/employer";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: employerResolvers,
});
