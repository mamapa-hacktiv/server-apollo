const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const axios = require('axios')
const { Reaction, Recipe, Ingredient, Step, Comment, User } = require('./models')

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
  type Recipe {
    id: ID
    title: String
    image: String
    description: String
    videoUrl: String
    origin: String
    portion: String
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
  type Recipes {
    id: ID
    title: String
    image: String
    description: String
    videoUrl: String
    origin: String
    portion: String
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

  type Query {
    findRecipe(id : ID!): Recipe
    findRecipes: [Recipes]
    findFavorite: [Favorite] 
    findMyRecipes: [Recipes]
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
        return allRecipe
      } catch (error) {
        console.log(error);
        return error
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
              model: Comment, include: [
                { model: User },
              ],
            },
            { model: User },
          ],
        });
        if (!findRecipe) throw { name: "NotFound" };
        return findRecipe
      } catch (error) {
        console.log(error);
        if (error.name == "NotFound") {
          return { message: "Data not found" }
        } else {
          return { message: "Internal Server Error" }
        }
      }
    },

    // findUser: async (_, args) => {
    //   try {
    //     const { id } = args
    //     const { data: users } = await axios.get(USER_SERVICE_URL + '/users/' + id)
    //     return users
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },

  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});


startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
}).catch(err => {
  console.log(err);
})
