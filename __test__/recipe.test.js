import request from "supertest";
import initServer from "../config/server.mjs";
import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config();
}
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

const queryFindRecipeById = {
  query: `query Query($findRecipeId: ID!) {
    findRecipe(id: $findRecipeId) {
      Comments {
        id
        message
        RecipeId
        UserId
        User {
          email
          id
          username
        }
        createdAt
        updatedAt
      }
      Ingredients {
        id
        name
        RecipeId
        createdAt
        updatedAt
      }
      Reactions {
        id
        emoji
        quantity
        RecipeId
        UserId
        createdAt
        updatedAt
      }
      Steps {
        id
        instruction
        image
        RecipeId
        createdAt
        updatedAt
      }
      User {
        email
        id
        username
      }
      UserId
      cookingTime
      createdAt
      description
      id
      image
      origin
      portion
      title
      videoUrl
      updatedAt
    }
  }`,
};

const queryFetchRecipes = {
  query: `query ExampleQuery {
        findRecipes {
          Reactions {
            RecipeId
            UserId
            emoji
            id
            quantity
          }
          UserId
          cookingTime
          createdAt
          description
          id
          image
          origin
          portion
          title
          videoUrl
        }
    }`,
};

const querySearchRecipe = {
  query: `query ExampleQuery($title: String) {
        recipeSearch(title: $title) {
          Reactions {
            RecipeId
            UserId
            id
            quantity
            emoji
          }
          UserId
          cookingTime
          createdAt
          description
          id
          image
          origin
          portion
          title
          videoUrl
        }
    }`,
};

const queryFetchMyRecipe = {
  query: `query ExampleQuery {
        findMyRecipes {
          Reactions {
            UserId
            RecipeId
            emoji
            id
            quantity
          }
          UserId
          cookingTime
          createdAt
          description
          id
          image
          origin
          portion
          title
          videoUrl
        }
    }`,
};

const queryCreateRecipe = {
  query: `mutation Mutation($newRecipe: newRecipe) {
        createRecipe(newRecipe: $newRecipe) {
          message
        }
      }`,
};

const queryUpdateRecipe = {
  query: `mutation Mutation($recipeId: ID, $newRecipe: newRecipe) {
    updateRecipe(recipeId: $recipeId, newRecipe: $newRecipe) {
      message
    }
  }
  `,
};

const queryDeleteRecipe = {
  query: `mutation Mutation($recipeId: ID) {
        deleteRecipe(recipeId: $recipeId) {
          message
        }
    }`,
};

const InvalidToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIwMUBtYWlsLmNvbSIsImlkIjoxLCJpYXQiOjE2MjI2MDk2NTF9.gShAB2qaCUjlnvNuM1MBWfBVEjDGdqjWSJNMEScXIeE`;
let validToken;

import dataSeeder from "../data/data.js";
import { createToken } from "../helpers/jwt.js";

let dataUsers = dataSeeder.Users;

let dataRecipes = dataSeeder.Recipes.map((el) => {
  delete el.id;
  el.createdAt = el.updatedAt = new Date();
  return el;
});

let dataIngredients = dataSeeder.Ingredients.map((el) => {
  el.createdAt = el.updatedAt = new Date();
  return el;
});

let dataSteps = dataSeeder.Steps.map((el) => {
  el.createdAt = el.updatedAt = new Date();
  return el;
});

let dataComments = dataSeeder.Comments.map((el) => {
  el.createdAt = el.updatedAt = new Date();
  return el;
});

let dataReactions = dataSeeder.Reactions.map((el) => {
  el.createdAt = el.updatedAt = new Date();
  return el;
});

let dataFavorites = dataSeeder.Favorites.map((el) => {
  el.createdAt = el.updatedAt = new Date();
  return el;
});

describe("user testing register", () => {
  let serverTest, urlTest;

  beforeAll(async () => {
    try {
      await User.bulkCreate(dataUsers, {
        individualHooks: true,
      });
      await sequelize.queryInterface.bulkInsert("Recipes", dataRecipes);
      await sequelize.queryInterface.bulkInsert("Ingredients", dataIngredients);
      await sequelize.queryInterface.bulkInsert("Steps", dataSteps);
      await sequelize.queryInterface.bulkInsert("Comments", dataComments);
      await sequelize.queryInterface.bulkInsert("Reactions", dataReactions);
      await sequelize.queryInterface.bulkInsert("Favorites", dataFavorites);
    } catch (error) {
      console.log(error, "<<<");
    }
  });

  // before the tests we spin up a new Apollo Server
  beforeAll(async () => {
    await initServer(1).then(({ server, url }) => {
      serverTest = server;
      urlTest = url;
    });
  });

  // after the tests we'll stop the server
  afterAll(async () => {
    await sequelize.queryInterface.bulkDelete("Users", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
    await sequelize.queryInterface.bulkDelete("Recipes", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
    await sequelize.queryInterface.bulkDelete("Ingredients", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
    await sequelize.queryInterface.bulkDelete("Steps", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
    await sequelize.queryInterface.bulkDelete("Comments", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
    await sequelize.queryInterface.bulkDelete("Reactions", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });
    await sequelize.queryInterface.bulkDelete("Favorites", null, {
      restartIdentity: true,
      cascade: true,
      truncate: true,
    });

    await serverTest?.stop();
  });

  it("should be success fetchDetailRecipe", async () => {
    // send our request to the url of the test server
    queryFindRecipeById.variables = {
      findRecipeId: "1",
    };
    const response = await request(urlTest).post("/").send(queryFindRecipeById);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("findRecipe");
  });

  it("should be failed fetchDetailRecipe due to invalid input", async () => {
    // send our request to the url of the test server
    queryFindRecipeById.variables = {
      findRecipeId: null,
    };
    const response = await request(urlTest).post("/").send(queryFindRecipeById);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Variable "$findRecipeId" of non-null type "ID!" must not be null.'
    );
  });
  it("should be success fetchRecipe", async () => {
    // send our request to the url of the test server
    const response = await request(urlTest).post("/").send(queryFetchRecipes);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("findRecipes");
  });
  it("should be success fetchSearchRecipe", async () => {
    // send our request to the url of the test server
    querySearchRecipe.variables = {
      title: "nasi",
    };
    const response = await request(urlTest).post("/").send(querySearchRecipe);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("recipeSearch");
  });
  it("should be success fetchMyRecipe", async () => {
    // send our request to the url of the test server

    const response = await request(urlTest)
      .post("/")
      .send(queryFetchMyRecipe)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("findMyRecipes");
  });
  it("should be failed fetchMyRecipe due to invalid token", async () => {
    // send our request to the url of the test server

    const response = await request(urlTest)
      .post("/")
      .send(queryFetchMyRecipe)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be failed fetchMyRecipe due to user don't have any access_token", async () => {
    // send our request to the url of the test server

    const response = await request(urlTest).post("/").send(queryFetchMyRecipe);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });

  it("should be success CreateRecipe", async () => {
    // send our request to the url of the test server
    queryCreateRecipe.variables = {
      newRecipe: {
        videoUrl: null,
        title: "Ayam goreng",
        steps: [
          {
            instruction: null,
            image: null,
          },
        ],
        portion: null,
        origin: null,
        ingredients: [
          {
            name: null,
          },
        ],
        description: null,
        cookingTime: null,
      },
    };
    const response = await request(urlTest)
      .post("/")
      //   .send(queryCreateRecipe)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) })
      .set("apollo-require-preflight", "true")
      .field("operations", JSON.stringify(queryCreateRecipe))
      .field("map", JSON.stringify({ 0: ["variables.newRecipe.image"] }))
      .attach("0", "./asset/unnamed.jpg");
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("createRecipe");
  });

  it("should be failed createRecipe due to invalid token", async () => {
    // send our request to the url of the test server
    queryCreateRecipe.variables = {
      newRecipe: {
        videoUrl: null,
        title: "Ayam goreng",
        steps: [
          {
            instruction: null,
            image: null,
          },
        ],
        portion: null,
        origin: null,
        ingredients: [
          {
            name: null,
          },
        ],
        description: null,
        cookingTime: null,
      },
    };
    const response = await request(urlTest)
      .post("/")
      //   .send(queryCreateRecipe)
      .set({ access_token: createToken({ id: 3, email: "mail@potao.com" }) })
      .set("apollo-require-preflight", "true")
      .field("operations", JSON.stringify(queryCreateRecipe))
      .field("map", JSON.stringify({ 0: ["variables.newRecipe.image"] }))
      .attach("0", "./asset/unnamed.jpg");
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });

  it("should be failed createRecipe due to invalid token", async () => {
    // send our request to the url of the test server
    queryCreateRecipe.variables = {
      newRecipe: {
        videoUrl: null,
        title: "Ayam goreng",
        steps: [
          {
            instruction: null,
            image: null,
          },
        ],
        portion: null,
        origin: null,
        ingredients: [
          {
            name: null,
          },
        ],
        description: null,
        cookingTime: null,
      },
    };
    const response = await request(urlTest)
      .post("/")
      //   .send(queryCreateRecipe)
      .set({ access_token: InvalidToken })
      .set("apollo-require-preflight", "true")
      .field("operations", JSON.stringify(queryCreateRecipe))
      .field("map", JSON.stringify({ 0: ["variables.newRecipe.image"] }))
      .attach("0", "./asset/unnamed.jpg");
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be success UpdateRecipe", async () => {
    // send our request to the url of the test server
    queryUpdateRecipe.variables = {
      newRecipe: {
        videoUrl: "ini video url",
        title: "Nasi goreng",
        steps: [
          {
            instruction: "Step step membuat nasi digoreng",
            image: "ini foto testing",
          },
        ],
        portion: 4,
        origin: "boyolali, jawa tengah, indonesia",
        ingredients: [
          {
            name: "cabai 300gr",
          },
          {
            name: "bawang merah 4 siung",
          },
        ],
        description:
          "Nasi goreng ayam suwir bisa membuat sarapanmu terasa istimewa. Sajikan dengan tambahan seperti telur mata sapi, acar mentimun,",
        cookingTime: "1",
      },
      recipeId: 1,
    };
    const response = await request(urlTest)
      .post("/")
      //   .send(queryCreateRecipe)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) })
      .set("apollo-require-preflight", "true")
      .field("operations", JSON.stringify(queryUpdateRecipe))
      .field("map", JSON.stringify({ 0: ["variables.newRecipe.image"] }))
      .attach("0", "./asset/v996-024.jpg");
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("updateRecipe");
  });

  it("should be failed UpdateRecipe due to data not found", async () => {
    // send our request to the url of the test server
    queryUpdateRecipe.variables = {
      newRecipe: {
        videoUrl: "ini video url",
        title: "Nasi goreng",
        steps: [
          {
            instruction: "Step step membuat nasi digoreng",
            image: "ini foto testing",
          },
        ],
        portion: 4,
        origin: "boyolali, jawa tengah, indonesia",
        ingredients: [
          {
            name: "cabai 300gr",
          },
          {
            name: "bawang merah 4 siung",
          },
        ],
        description:
          "Nasi goreng ayam suwir bisa membuat sarapanmu terasa istimewa. Sajikan dengan tambahan seperti telur mata sapi, acar mentimun,",
        cookingTime: "1",
      },
      recipeId: 25,
    };
    const response = await request(urlTest)
      .post("/")
      //   .send(queryCreateRecipe)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) })
      .set("apollo-require-preflight", "true")
      .field("operations", JSON.stringify(queryUpdateRecipe))
      .field("map", JSON.stringify({ 0: ["variables.newRecipe.image"] }))
      .attach("0", "./asset/v996-024.jpg");
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "NotFound" }'
    );
  });

  it("should be failed deleteRecipe due to user don't have any access_token", async () => {
    // send our request to the url of the test server
    queryDeleteRecipe.variables = {
      recipeId: "1",
    };
    const response = await request(urlTest).post("/").send(queryDeleteRecipe);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });
  it("should be failed deleteRecipe due to invalid token", async () => {
    // send our request to the url of the test server
    queryDeleteRecipe.variables = {
      recipeId: "1",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteRecipe)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });
  it("should be failed deleteRecipe due to data not found", async () => {
    // send our request to the url of the test server
    queryDeleteRecipe.variables = {
      recipeId: null,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteRecipe)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "NotFound" }'
    );
  });
  it("should be failed deleteRecipe due to user not authorized", async () => {
    // send our request to the url of the test server
    queryDeleteRecipe.variables = {
      recipeId: "2",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteRecipe)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "Not Authorized" }'
    );
  });

  it("should be success deleteRecipe", async () => {
    // send our request to the url of the test server
    queryDeleteRecipe.variables = {
      recipeId: "1",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteRecipe)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toEqual({
      deleteRecipe: { message: "successfully delete recipe with id 1" },
    });
  });
});
