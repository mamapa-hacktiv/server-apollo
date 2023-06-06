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

const queryCreateReaction = {
  query: `mutation Mutation($recipeId: ID, $emoji: String, $quantity: Int) {
        createReaction(recipeId: $recipeId, emoji: $emoji, quantity: $quantity) {
          message
        }
    }`,
};

const queryDeleteReaction = {
  query: `mutation Mutation($reactionId: ID) {
        deleteReaction(reactionId: $reactionId) {
          message
        }
    }
    `,
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

  it("should be success createReaction", async () => {
    // send our request to the url of the test server
    queryCreateReaction.variables = {
      recipeId: "2",
      emoji: "love",
      quantity: 1,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryCreateReaction)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("createReaction");
  });

  it("should be failed createReaction due to invalid token", async () => {
    // send our request to the url of the test server
    queryCreateReaction.variables = {
      recipeId: "2",
      emoji: "love",
      quantity: 1,
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryCreateReaction)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be failed createReaction due to user don't have any access_token", async () => {
    // send our request to the url of the test server
    queryCreateReaction.variables = {
      recipeId: "2",
      emoji: "love",
      quantity: 1,
    };
    const response = await request(urlTest).post("/").send(queryCreateReaction);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });
  it("should be failed deleteReaction due to user not authorized", async () => {
    // send our request to the url of the test server
    queryDeleteReaction.variables = {
      reactionId: "2",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteReaction)
      .set({ access_token: createToken({ id: 2, email: "test@gmail.com" }) });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "Not Authorized" }'
    );
  });
  it("should be failed deleteReaction due to data not found", async () => {
    // send our request to the url of the test server
    queryDeleteReaction.variables = {
      reactionId: "14",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteReaction)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "NotFound" }'
    );
  });

  it("should be failed deleteReaction due to user don't have any access_token", async () => {
    // send our request to the url of the test server
    queryDeleteReaction.variables = {
      reactionId: "1",
    };
    const response = await request(urlTest).post("/").send(queryDeleteReaction);
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });

  it("should be failed deleteReaction due to invalid access_token", async () => {
    // send our request to the url of the test server
    queryDeleteReaction.variables = {
      reactionId: "1",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteReaction)
      .set({ access_token: InvalidToken });
    // console.log(response.body.errors, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("invalid signature");
  });

  it("should be success deleteReaction", async () => {
    // send our request to the url of the test server
    queryDeleteReaction.variables = {
      reactionId: "1",
    };
    const response = await request(urlTest)
      .post("/")
      .send(queryDeleteReaction)
      .set({ access_token: createToken({ id: 1, email: "marsh@potao.com" }) });
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("deleteReaction");
  });
});
