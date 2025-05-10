import { jobResolver } from "./resolvers/jobResolver";
import { employerResolver } from "./resolvers/employerResolver";
import { userResolver } from "./resolvers/userResolver";
import { applicationResolver } from "./resolvers/applicationResolver";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

const typeDefs = mergeTypeDefs(
  loadFilesSync(__dirname + "/typeDefs", { extensions: ["graphql"] })
);
const resolvers = mergeResolvers([
  jobResolver,
  employerResolver,
  userResolver,
  applicationResolver,
]);

export const schema = { typeDefs, resolvers };
