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

export const favoriteTypeDefs = `#graphql
scalar Upload

  type Favorite {
    id: ID
    RecipeId: Int
    UserId: Int
    Recipe: Recipe
    createdAt: String
    updatedAt: String
  }

  type Recipe {
    id: ID
    title: String
    image: String
    description: String
    videoUrl: String
    origin: String
    portion: Int
    cookingTime: Int
    UserId: Int
    createdAt: String
    updatedAt: String
  }

  type ResponseMessage {
    message: String
  }

  type Query {
    findFavorite: [Favorite]
    isFavorite(recipeId: ID): Boolean
  }
  
  type Mutation {
    createFavorite(recipeId: ID): ResponseMessage
    deleteFavorite(favoriteId: ID): ResponseMessage
  }
`;

export const favoriteResolvers = {
  Upload: GraphQLUpload,
  Query: {
    findFavorite: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const favorites = await Favorite.findAll({
          where: {
            UserId: user.id,
          },
          include: [
            {
              model: Recipe,
            },
          ],
        });

        return favorites;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    //! tambahin findFavoritebyrecipedanuserid bailikin true false
    isFavorite: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const { recipeId } = args;

        const findRecipe = await Recipe.findByPk(recipeId);

        if (!findRecipe) throw { name: "NotFound" };

        if (findRecipe.UserId == user.id) {
          return true;
        } else if (findRecipe.UserId != user.id) {
          return false;
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    //! update untuk recipe saja

    createFavorite: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const { recipeId } = args;
        const favorite = {
          RecipeId: recipeId,
          UserId: user.id,
        };
        const newFavorite = await Favorite.create(favorite);

        const message = `Success adding recipe with id ${recipeId} to your favorite`;
        return { message };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },

    deleteFavorite: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const { favoriteId } = args;
        const findFavorite = await Favorite.findByPk(favoriteId);

        if (!findFavorite) throw { name: "NotFound" };

        if (findFavorite.UserId != user.id) throw { name: "Not Authorized" };

        const delFavorite = await Favorite.destroy({
          where: { id: favoriteId },
        });

        const message = `successfully delete favorite with id ${findFavorite.id}`;
        return { message };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
