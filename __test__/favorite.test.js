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

const queryFetchFavorite = {
  query: `query Query {
        findFavorite {
          Recipe {
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
          RecipeId
          createdAt
          UserId
          id
          updatedAt
        }
    }`,
};

const queryIsFavorite = {
  query: `query Query($recipeId: ID) {
        isFavorite(recipeId: $recipeId)
    }
    `,
};

const queryCreateFavorite = {
  query: `mutation Mutation($recipeId: ID) {
    createFavorite(recipeId: $recipeId) {
      message
    }
  }`,
};

const queryDeleteFavorite = {
  query: `mutation Mutation($favoriteId: ID) {
    deleteFavorite(favoriteId: $favoriteId) {
      message
    }
  }
    `,
};

const InvalidToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIwMUBtYWlsLmNvbSIsImlkIjoxLCJpYXQiOjE2MjI2MDk2NTF9.gShAB2qaCUjlnvNuM1MBWfBVEjDGdqjWSJNMEScXIeE`;

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

  it("should be success fetchFavorite", async () => {
    // send our request to the url of the test server

    const response = await request(urlTest)
      .post("/")
      .send(queryFetchFavorite)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("findFavorite");
  });

  it("should be failed fetchFavorite due to invalid token", async () => {
    // send our request to the url of the test server

    const response = await request(urlTest)
      .post("/")
      .send(queryFetchFavorite)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be failed fetchFavorite due to user don't have any access_token", async () => {
    // send our request to the url of the test server

    const response = await request(urlTest).post("/").send(queryFetchFavorite);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });

  it("should be success fetchIsFavorite with false answer", async () => {
    // send our request to the url of the test server
    queryIsFavorite.variables = {
      recipeId: 2,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryIsFavorite)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("isFavorite");
    expect(response.body.data.isFavorite).toEqual(false);
  });

  it("should be success fetchIsFavorite with true answer", async () => {
    // send our request to the url of the test server
    queryIsFavorite.variables = {
      recipeId: 1,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryIsFavorite)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("isFavorite");
    expect(response.body.data.isFavorite).toEqual(true);
  });

  it("should be failed fetchIsFavorite due to invalid token", async () => {
    // send our request to the url of the test server
    queryIsFavorite.variables = {
      recipeId: 1,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryIsFavorite)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be failed fetchIsFavorite due to data not found", async () => {
    // send our request to the url of the test server
    queryIsFavorite.variables = {
      recipeId: 20,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryIsFavorite)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "NotFound" }'
    );
  });

  it("should be failed createFavorite due to user don't have any access_token", async () => {
    // send our request to the url of the test server
    queryIsFavorite.variables = {
      recipeId: 1,
    };
    const response = await request(urlTest).post("/").send(queryIsFavorite);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });

  it("should be success createFavorite", async () => {
    // send our request to the url of the test server
    queryCreateFavorite.variables = {
      recipeId: "2",
      emoji: "love",
      quantity: 1,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryCreateFavorite)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("createFavorite");
  });

  it("should be failed createFavorite due to invalid token", async () => {
    // send our request to the url of the test server
    queryCreateFavorite.variables = {
      recipeId: "2",
      emoji: "love",
      quantity: 1,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryCreateFavorite)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be failed createFavorite due to user don't have any access_token", async () => {
    // send our request to the url of the test server
    queryCreateFavorite.variables = {
      recipeId: "2",
      emoji: "love",
      quantity: 1,
    };
    const response = await request(urlTest).post("/").send(queryCreateFavorite);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });
  it("should be failed deleteFavorite due to user not authorized", async () => {
    // send our request to the url of the test server
    queryDeleteFavorite.variables = {
      favoriteId: "2",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteFavorite)
      .set({ access_token: createToken({ id: 2, email: "test@gmail.com" }) });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "Not Authorized" }'
    );
  });

  it("should be failed deleteFavorite due to data not found", async () => {
    // send our request to the url of the test server
    queryDeleteFavorite.variables = {
      favoriteId: "14",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteFavorite)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "NotFound" }'
    );
  });

  it("should be failed deleteFavorite due to user don't have any access_token", async () => {
    // send our request to the url of the test server
    queryDeleteFavorite.variables = {
      favoriteId: "1",
    };
    const response = await request(urlTest).post("/").send(queryDeleteFavorite);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });

  it("should be failed deleteFavorite due to invalid access_token", async () => {
    // send our request to the url of the test server
    queryDeleteFavorite.variables = {
      favoriteId: "1",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteFavorite)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be success deleteFavorite", async () => {
    // send our request to the url of the test server
    queryDeleteFavorite.variables = {
      favoriteId: "2",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteFavorite)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("deleteFavorite");
  });
});
