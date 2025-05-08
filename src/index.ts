import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./graphql";

// console.log("tsx watch works!");

async function start() {
  const server = new ApolloServer({ schema });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000, host: "0.0.0.0" },
  });

  console.log(`🚀 Server ready at ${url}`);
}

start();
