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

export const reactionTypeDefs = `#graphql
scalar Upload
  
  type Mutation {
    createReaction(recipeId: ID, emoji: String, quantity:Int): ResponseMessage
    deleteReaction(reactionId: ID): ResponseMessage
  }
`;

export const reactionResolvers = {
  Upload: GraphQLUpload,

  Mutation: {
    //! update untuk recipe saja

    createReaction: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const { recipeId, emoji, quantity } = args;

        const reaction = {
          emoji: emoji,
          quantity: quantity,
          RecipeId: recipeId,
          UserId: user.id,
        };

        const newReaction = await Reaction.create(reaction);

        const message = `Success create reaction for recipe with id ${recipeId}`;
        return { message };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    deleteReaction: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const { reactionId } = args;

        const findReaction = await Reaction.findByPk(reactionId);

        if (!findReaction) throw { name: "NotFound" };

        if (findReaction.UserId != user.id) throw { name: "Not Authorized" };

        const delReaction = await Reaction.destroy({
          where: { id: reactionId },
        });

        const message = `successfully delete reaction with id ${findReaction.id}`;
        return { message };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
