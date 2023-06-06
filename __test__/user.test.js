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

const queryData = {
  query: `mutation Mutation($newUser: newUser) {
    register(newUser: $newUser) {
      message
    }
  }`,
};

const user1 = {
  username: "Testing",
  email: "testing@apollo.com",
  password: "12345",
};

const user2 = {
  username: "Testing2",
  email: "testing2@apollo.com",
  password: "12345",
};

describe("user testing register", () => {
  let serverTest, urlTest;

  beforeAll(async () => {
    try {
      await User.bulkCreate([user1, user2], { individualHooks: true });
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
    await serverTest?.stop();
  });

  it("should be success registering", async () => {
    // send our request to the url of the test server
    queryData.variables = {
      newUser: {
        username: "Success testing",
        email: "success@apollo.com",
        password: "12345",
      },
    };
    const response = await request(urlTest).post("/").send(queryData);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("register");
  });

  it("should be fail registering due to unique constraint", async () => {
    queryData.variables = {
      newUser: {
        username: "Failed testing",
        email: "testing@apollo.com",
        password: "12345",
      },
    };

    const response = await request(urlTest).post("/").send(queryData);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual("Email must be unique");
  });
  it("should be fail registering due to invalid email format", async () => {
    queryData.variables = {
      newUser: {
        username: "Failed testing",
        email: "testing@apollo",
        password: "12345",
      },
    };

    const response = await request(urlTest).post("/").send(queryData);
    // console.log(response.body.errors);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      "Validation error: Please enter a valid email address"
    );
  });
  it("should be fail registering due to user doesnt send email", async () => {
    queryData.variables = {
      newUser: {
        username: "Failed testing",
        password: "12345",
      },
    };

    const response = await request(urlTest).post("/").send(queryData);
    // console.log(response.body.errors);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      "notNull Violation: Email is required"
    );
  });
  it("should be fail registering due to user doesnt send password", async () => {
    queryData.variables = {
      newUser: {
        username: "Failed testing",
        email: "failed@apollo.com",
      },
    };

    const response = await request(urlTest).post("/").send(queryData);
    // console.log(response.body.errors);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      "notNull Violation: Password is required"
    );
  });
});
