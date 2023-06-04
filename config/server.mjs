import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "../schema/test.mjs";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

export default async function initServer(port = 4000) {
  try {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      csrfPrevention: false,
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      uploads: false
    });
    await server.start();

    app.use(
      "/",
      cors(),
      bodyParser.json(),
      graphqlUploadExpress(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          // decode token here if available
          try {
            const { access_token } = req.headers;
            return { access_token };
          } catch (error) {
            console.log(error, "<<<");
            throw error;
          }
        },
      })
    );

    // Modified server startup
    await new Promise((resolve) => httpServer.listen({ port }, resolve));
    const url = `http://localhost:${port}/`;
    return {
      server,
      url
    };
  } catch (error) {
    throw error;
  }
}
