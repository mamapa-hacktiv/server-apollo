if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const axios = require("axios");
const {
  Reaction,
  Recipe,
  Ingredient,
  Step,
  Comment,
  User,
  Favorite,
  sequelize,
} = require("./models");
const { createToken, decodeToken } = require("./helpers/jwt");
const { comparePassword } = require("./helpers/bcrypt");
const authentication = require("./middlewares/authentication");

const typeDefs = `#graphql

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

  input newRecipe {
    title: String
    image:String
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
    findRecipe(id: ID!): DetailRecipe
    findRecipes: [Recipes]
    findFavorite: [Favorite] 
    findMyRecipes: [Recipes]
    login(email: String, password: String): LoginResponse
  }
  
  type Mutation {
    register(newUser: newUser): ResponseMessage
    createRecipe(newRecipe: newRecipe): ResponseMessage
    createComment(RecipeId: ID, message: String): ResponseMessage
  }
`;

const resolvers = {
  Query: {
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

        return `user with email ${user.email} has been created`;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    createRecipe: async (_, args, contextValue) => {
      const t = await sequelize.transaction();

      try {
        if (!contextValue.access_token) throw { name: "InvalidToken" };

        const user = await authentication(contextValue.access_token);

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

        if (!title) throw { name: "Title is required" };

        const recipe = {
          title: title,
          image: image,
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
        return "Success add recipe";
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
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
  context: async ({ req }) => {
    try {
      const { access_token } = req.headers;

      return { access_token };
    } catch (error) {
      console.log(error, "<<<");
      throw error;
    }
  },
})
  .then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
  })
  .catch((err) => {
    console.log(err);
  });
