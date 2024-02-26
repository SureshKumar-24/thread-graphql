import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import {prismaClient} from './lib/db';
async function init() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  const server = new ApolloServer({
    typeDefs: `
    type Query{
        hello: String
        say(name: String): String
    }
    type Mutation{
        createUser(firstName:String!,lastName:String!,email:String!,password:String!):Boolean
    }
    `,
    resolvers: {
      Query: {
        hello: () => `Hey there, I am a graphql server`,
        say: (_, { name }: { name: string }) => `Hey ${name}, How are you?`,
      },
      Mutation: {
        createUser: async(_, { firstName, lastName, email, password }: { firstName: string, lastName: string, email: string, password: string }) => {
          await prismaClient.user.create({
            data: {
              email,
              password,
              firstName,
              lastName,
              salt: "random_salt",
            }
          });
          return true; // Added return statement to match the resolver's return type
        }
      }
    },
  });

  await server.start();

  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running" });
  });

  app.use("/graphql", expressMiddleware(server));

  app.listen(PORT, () => {
    console.log(`Server Started at PORT: ${PORT}`);
  });
}

init();
