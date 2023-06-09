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

export const typeDefs = `#graphql
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

  type Favorite {
    id: ID
    RecipeId: Int
    UserId: Int
    Recipe: Recipe
    createdAt: String
    updatedAt: String
  }

  type Ingredient {
    id: ID
    name: String
    RecipeId: Int
    createdAt: String
    updatedAt: String
  }
  type DetailRecipe {
    id: ID
    title: String
    image: String
    description: String
    videoUrl: String
    origin: String
    portion: Int
    cookingTime: Int
    UserId: Int
    Reactions: [Reaction] 
    Steps: [Step]
    Comments: [Comment]
    Ingredients: [Ingredient]
    User: User
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
  
  type Recipes {
    id: ID
    title: String
    image: String
    description: String
    videoUrl: String
    origin: String
    portion: Int
    cookingTime: Int
    UserId: Int
    Reactions: [Reaction] 
    createdAt: String
    updatedAt: String
  }

  type Step {
    id: ID
    instruction: String
    image: String
    RecipeId: Int
    createdAt: String
    updatedAt: String
  }
  type Reaction {
    id: ID
    emoji: String
    quantity: Int
    RecipeId: Int
    UserId: Int
    createdAt: String
    updatedAt: String
  }
  type Comment {
    id: ID
    message: String
    RecipeId: Int
    UserId: Int
    User: User
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
  input updateRecipe {
    title: String
    image: String
    description: String
    videoUrl: String
    origin: String
    portion: Int
    cookingTime: Int
  }
 
  input newRecipe {
    title: String
    image: [Upload]
    description:String
    videoUrl:String
    origin:String
    portion:Int
    cookingTime:String
    steps: [newStep]
    stepImages: [Upload]
    ingredients: [newIngredient]
  }

  

  input newStep {
    instruction: String
    image: String
  }

  input newIngredient {
    name: String
  }

  type Query {
    recipeSearch(title:String): [Recipes]
    findRecipe(id: ID!): DetailRecipe
    findRecipes: [Recipes]
    findFavorite: [Favorite] 
    findMyRecipes: [Recipes]
    login(email: String, password: String): LoginResponse
    isFavorite(recipeId: ID): Boolean
  }
  
  type Mutation {
    register(newUser: newUser): ResponseMessage
    login(email: String, password: String): LoginResponse
    updateRecipe(id: ID!, input:updateRecipe): Recipes
    createRecipe(newRecipe: newRecipe): ResponseMessage
    createComment(recipeId: ID, message: String): ResponseMessage
    createReaction(recipeId: ID, emoji: String, quantity:Int): ResponseMessage
    createFavorite(recipeId: ID): ResponseMessage
    deleteComment(commentId: ID): ResponseMessage
    deleteFavorite(favoriteId: ID): ResponseMessage
    deleteReaction(reactionId: ID): ResponseMessage
    deleteRecipe(recipeId: ID): ResponseMessage
  }
`;

export const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    recipeSearch: async (_, args) => {
      try {
        const { title } = args;
        const result = await Recipe.findAll({
          where: {
            title: {
              [Op.iLike]: `%${title}%`,
            },
          },
        });
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    findRecipes: async () => {
      try {
        const allRecipe = await Recipe.findAll({
          include: [
            {
              model: Reaction,
            },
          ],
        });
        return allRecipe;
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    findRecipe: async (_, args) => {
      try {
        const { id: recipeId } = args;
        const findRecipe = await Recipe.findByPk(recipeId, {
          include: [
            { model: Ingredient },
            { model: Step },
            { model: Reaction },
            {
              model: Comment,
              include: [{ model: User }],
            },
            { model: User },
          ],
        });
        if (!findRecipe) throw { name: "NotFound" };
        return findRecipe;
      } catch (error) {
        console.log(error);
        if (error.name == "NotFound") {
          return { message: "Data not found" };
        } else {
          return { message: "Internal Server Error" };
        }
      }
    },
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

    findMyRecipes: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);


        const myRecipe = await Recipe.findAll({
          where: {
            UserId: user.id,
          },
          include: [
            {
              model: Reaction,
            },
          ],
        });

        return myRecipe;
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
        const message = `user with email ${user.email} has been created`
        return { message };
      } catch (error) {
        console.log(error);
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
  Mutation: {
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
        console.log(error);
        throw error;
      }
    },
    updateRecipe: async (_, { id, input }, contextValue) => {
      try {
        const { title, image, description, videoUrl, origin, portion, cookingTime } = input;

        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

        const findRecipe = await Recipe.findByPk(id);
        if (!findRecipe) throw { name: "NotFound" };

        let updateRecipes = await Recipe.update(
          {
            title,
            image,
            description,
            videoUrl,
            origin,
            portion,
            cookingTime,
          },
          {
            where: {
              id,
            },
          }
        );
        return await findRecipe.reload();
      } catch (error) {
        console.log(error);
      }
    },
    createRecipe: async (_, args, contextValue) => {

      const t = await sequelize.transaction();
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };
        const { title, image, description, videoUrl, origin, portion, cookingTime, steps, ingredients } = args.newRecipe;

        const user = await authentication(contextValue.access_token);
        console.log(args.upload, 'ini args.upload');
        console.log(stepImages, image, 'ini gambar');
        //! implement upload image
        const result = await Promise.all(image);
        const imagesBufferPromises = result.map((img) => {
          const stream = img.createReadStream();
          return stream2buffer(stream);
        });
        const imagesBuffer = await Promise.all(imagesBufferPromises);
        const data = await imagekit.upload({
          file: imagesBuffer[0],
          fileName: result[0].filename,
        });

        console.log(stepData);

        if (!title) throw { name: "Title is required" };

        const recipe = {
          title: title,
          image: data.url,
          description: description,
          videoUrl: videoUrl,
          origin: origin,
          portion: portion,
          cookingTime: cookingTime,
          UserId: user.id,
        };

        const newRecipe = await Recipe.create(recipe, { transaction: t });

        const stepsWithRecipeId = steps.map((el) => ({
          ...el,
          RecipeId: newRecipe.id,
        }));

        const ingredientsWithRecipeId = ingredients.map((el) => ({
          ...el,
          RecipeId: newRecipe.id,
        }));

        const newSteps = await Step.bulkCreate(stepsWithRecipeId, {
          transaction: t,
        });

        const newIngredients = await Ingredient.bulkCreate(ingredientsWithRecipeId, { transaction: t });
        await t.commit();

        const message = "Success add recipe";
        return { message };
      } catch (error) {
        await t.rollback();
        console.log(error);
        throw error;
      }
    },
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
    deleteRecipe: async (_, args, contextValue) => {
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };
        const user = await authentication(contextValue.access_token);
        const { recipeId } = args;
        const findRecipe = await Recipe.findByPk(recipeId);
        if (!findRecipe) throw { name: "NotFound" };
        if (findRecipe.UserId != user.id) throw { name: "Not Authorized" };

        await Step.destroy({ where: { RecipeId: recipeId } });

        await Ingredient.destroy({ where: { RecipeId: recipeId } });

        const delRecipe = await Recipe.destroy({ where: { id: recipeId } });

        const message = `successfully delete recipe with id ${findRecipe.id}`;
        return { message };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
