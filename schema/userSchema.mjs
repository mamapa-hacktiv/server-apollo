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
import axios from "axios";

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

  type chatGpt {
    content: String
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
    getUser: User
  
  }
  
  type Mutation {
    register(newUser: newUser): ResponseMessage
    getAi(message: String): chatGpt
    login(email: String, password: String): LoginResponse
  }
`;

export const userResolvers = {
  Upload: GraphQLUpload,
  Query: {

    getUser: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);
        const findUser = await User.findByPk(user.id);
        if (!findUser) {
          throw { name: "Not Found" };
        }
        const foundUser = { ...findUser.dataValues };
        delete foundUser.password;
        delete foundUser.createdAt;
        delete foundUser.updatedAt;
        return foundUser
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    //! update untuk recipe saja
    getAi: async (_, args) => {
      try {
        const { message } = args

        const { data } = await axios({
          method: 'post',
          url: "https://api.openai.com/v1/chat/completions",
          data: {
            model: "gpt-3.5-turbo",
            messages: [{ "role": "system", "content": message }]
          },
          headers: {
            Authorization: "Bearer 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"
          }
        });
        console.log(data);
        return data.choices[0].message
      } catch (error) {
        throw error
      }
    },
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
};
