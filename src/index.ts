import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./graphql/schema";
import {
  createEmployerByIdLoader,
  createEmployerByManagerIdLoader,
} from "./graphql/loaders/employerLoader";
import {
  createJobsByEmployerIdLoader,
  createJobByIdLoader,
} from "./graphql/loaders/jobLoader";
import {
  createApplicationsByUserIdLoader,
  createApplicationsByJobIdLoader,
} from "./graphql/loaders/applicationLoader";
import { createUserByIdLoader } from "./graphql/loaders/userLoader";
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
        employerById: createEmployerByIdLoader(),
        employerByManagerId: createEmployerByManagerIdLoader(),
        jobsByEmployer: createJobsByEmployerIdLoader(),
        jobById: createJobByIdLoader(),
        applicationsByUser: createApplicationsByUserIdLoader(),
        applicationsByJob: createApplicationsByJobIdLoader(),
        userById: createUserByIdLoader(),
      },
    }),
  });

  console.log(`🚀 Server ready at ${url}`);
}

start();
