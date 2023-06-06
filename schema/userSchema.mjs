import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config();
}
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import imagekit from "../helpers/imageUpload.js";
import stream2buffer from "../helpers/streamToBuffer.js";
import model from "../models/index.js";
const {
  Reaction,
  Recipe,
  Ingredient,
  Step,
  Comment,
  User,
  Favorite,
  sequelize,
} = model;
import { createToken, decodeToken } from "../helpers/jwt.js";
import { comparePassword } from "../helpers/bcrypt.js";
import authentication from "../middlewares/authentication.js";
import { Op } from "sequelize";

export const userTypeDefs = `#graphql
scalar Upload

  type User {
    id: ID
    username: String
    email: String
    password: String
    phoneNumber: String
    createdAt: String
    updatedAt: String
  }

  type LoginResponse {
    access_token: String
  }

  type ResponseMessage {
    message: String
  }

  input newUser {
    username: String
    email: String
    password: String
    phoneNumber: String
  }


  type Query {
    login(email: String, password: String): LoginResponse
  }
  
  type Mutation {
    register(newUser: newUser): ResponseMessage
  }
`;

export const userResolvers = {
  Upload: GraphQLUpload,
  Query: {
    login: async (_, args) => {
      try {
        const { email, password } = args;
        if (!email) {
          throw { name: "Email is required" };
        }
        if (!password) {
          throw { name: "Password is required" };
        }
        const findUser = await User.findOne({ where: { email } });
        if (!findUser) {
          throw { name: "Invalid email/password" };
        }
        const checkPassword = comparePassword(password, findUser.password);
        if (!checkPassword) {
          throw { name: "Invalid email/password" };
        }
        const payload = {
          id: findUser.id,
        };
        //   console.log(findUser);
        const access_token = createToken(payload);

        return { access_token };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    //! update untuk recipe saja
    register: async (_, args) => {
      try {
        const { username, email, password, phoneNumber } = args.newUser;
        const user = await User.create({
          username,
          email,
          password,
          phoneNumber,
        });
        const message = `user with email ${user.email} has been created`;
        return { message };
      } catch (error) {
        // console.log(error);
        throw error;
      }
    },
  },
};
