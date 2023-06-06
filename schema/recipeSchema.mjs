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

export const recipeTypeDefs = `#graphql
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
    cookingTime: String
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
    cookingTime: String
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

  type ResponseMessage {
    message: String
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
    findMyRecipes: [Recipes]
  }
  
  type Mutation {
    createRecipe(newRecipe: newRecipe): ResponseMessage
    # updateRecipe(newRecipe: newRecipe, recipeId: ID): Recipes
    deleteRecipe(recipeId: ID): ResponseMessage
  }
`;

export const recipeResolvers = {
  Upload: GraphQLUpload,
  Query: {
    recipeSearch: async (_, args) => {
      // try {
      const { title } = args;
      const result = await Recipe.findAll({
        where: {
          title: {
            [Op.iLike]: `%${title}%`,
          },
        },
      });
      return result;
      // } catch (error) {
      //   // console.log(error);
      //   throw error;
      // }
    },
    findRecipes: async () => {
      // try {
      const allRecipe = await Recipe.findAll({
        include: [
          {
            model: Reaction,
          },
        ],
        order: [["id", "DESC"]],
      });
      return allRecipe;
      // } catch (error) {
      //   // console.log(error);
      //   return error;
      // }
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
        // console.log(error);
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
        // console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    //! update untuk recipe saja
    createRecipe: async (_, args, contextValue) => {
      console.log(args, "iki loh");
      const t = await sequelize.transaction();
      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };
        const {
          title,
          image,
          description,
          videoUrl,
          origin,
          portion,
          cookingTime,
          steps,
          ingredients,
        } = args.newRecipe;

        const user = await authentication(contextValue.access_token);

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

        const newIngredients = await Ingredient.bulkCreate(
          ingredientsWithRecipeId,
          { transaction: t }
        );
        await t.commit();

        const message = "Success add recipe";
        return { message };
      } catch (error) {
        await t.rollback();
        console.log(error);
        throw error;
      }
    },
    // updateRecipe: async (_, args, contextValue) => {
    //   try {
    //     if (!contextValue.access_token) throw { name: "InvalidToken" };
    //     const {
    //       title,
    //       image,
    //       description,
    //       videoUrl,
    //       origin,
    //       portion,
    //       cookingTime,
    //       steps,
    //       ingredients,
    //     } = args.newRecipe;

    //     const { recipeId } = args;

    //     const user = await authentication(contextValue.access_token);

    //     const findRecipe = await Recipe.findByPk(recipeId);
    //     if (!findRecipe) throw { name: "NotFound" };

    //     //! implement upload image
    //     const result = await Promise.all(image);
    //     const imagesBufferPromises = result.map((img) => {
    //       const stream = img.createReadStream();
    //       return stream2buffer(stream);
    //     });
    //     const imagesBuffer = await Promise.all(imagesBufferPromises);
    //     const data = await imagekit.upload({
    //       file: imagesBuffer[0],
    //       fileName: result[0].filename,
    //     });

    //     const recipe = {
    //       title: title,
    //       image: data.url,
    //       description: description,
    //       videoUrl: videoUrl,
    //       origin: origin,
    //       portion: portion,
    //       cookingTime: cookingTime,
    //       UserId: user.id,
    //     };

    //     const stepsWithRecipeId = steps.map((el) => ({
    //       ...el,
    //       RecipeId: recipeId,
    //     }));

    //     const ingredientsWithRecipeId = ingredients.map((el) => ({
    //       ...el,
    //       RecipeId: recipeId,
    //     }));

    //     await Ingredient.bulkCreate(ingredientsWithRecipeId, {
    //       updateOnDuplicate: ["id", "name", "RecipeId"],
    //     });

    //     await Step.bulkCreate(stepsWithRecipeId, {
    //       updateOnDuplicate: ["id", "instruction", "image", "RecipeId"],
    //     });

    //     let updateRecipes = await Recipe.update(recipe, {
    //       where: {
    //         id: recipeId,
    //       },
    //     });

    //     const messages = ``;

    //     return await findRecipe.reload();
    //   } catch (error) {
    //     console.log(error);
    //     throw error;
    //   }
    // },
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

        await Comment.destroy({ where: { RecipeId: recipeId } });

        await Favorite.destroy({ where: { RecipeId: recipeId } });

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
