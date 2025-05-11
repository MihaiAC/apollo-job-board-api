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
import { verifyToken } from "./utils/auth";

async function start() {
  const server = new ApolloServer<Context>({
    typeDefs: schema.typeDefs,
    resolvers: schema.resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000, host: "0.0.0.0" },
    context: async ({ req }): Promise<Context> => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      let auth = null;
      if (token) {
        try {
          auth = verifyToken(token);
        } catch (err) {
          console.warn("Failed to verify JWT:", (err as Error).message);
        }
      }

      return {
        loaders: {
          employerById: createEmployerByIdLoader(),
          employerByManagerId: createEmployerByManagerIdLoader(),
          jobsByEmployer: createJobsByEmployerIdLoader(),
          jobById: createJobByIdLoader(),
          applicationsByUser: createApplicationsByUserIdLoader(),
          applicationsByJob: createApplicationsByJobIdLoader(),
          userById: createUserByIdLoader(),
        },
        auth,
      };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
}

start();
