import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./graphql/schema";
import { createEmployerLoader } from "./graphql/loaders/employerLoader";
import { createJobsByEmployerLoader } from "./graphql/loaders/jobLoader";
import type { Context } from "./graphql/context";

async function start() {
  const server = new ApolloServer<Context>({
    typeDefs: schema.typeDefs,
    resolvers: schema.resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000, host: "0.0.0.0" },
    context: async (): Promise<Context> => ({
      loaders: {
        employerById: createEmployerLoader(),
        jobsByEmployer: createJobsByEmployerLoader(),
      },
    }),
  });

  console.log(`🚀 Server ready at ${url}`);
}

start();
