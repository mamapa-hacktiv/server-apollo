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

export const commentTypeDefs = `#graphql
scalar Upload

  type LoginResponse {
    access_token: String
  }

  type ResponseMessage {
    message: String
  }

  type Mutation {
    createComment(recipeId: ID, message: String): ResponseMessage
    deleteComment(commentId: ID): ResponseMessage
  }
`;

export const commentResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    //! update untuk recipe saja

    createComment: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const { recipeId, message: commentMsg } = args;

        const comment = {
          message: commentMsg,
          RecipeId: recipeId,
          UserId: user.id,
        };

        const newComment = await Comment.create(comment);

        const message = `Success create comment for recipe id ${recipeId}`;
        return { message };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    deleteComment: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const { commentId } = args;

        const findComment = await Comment.findByPk(commentId);

        if (!findComment) throw { name: "NotFound" };

        if (findComment.UserId != user.id) throw { name: "Not Authorized" };

        const delComment = await Comment.destroy({ where: { id: commentId } });

        const message = `successfully delete comment with id ${findComment.id}`;
        return { message };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
