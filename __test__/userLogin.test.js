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
  query: `query Query($password: String, $email: String) {
    login(password: $password, email: $email) {
      access_token
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

  it("should be success login in", async () => {
    // send our request to the url of the test server
    queryData.variables = {
      email: "testing@apollo.com",
      password: "12345",
    };
    const response = await request(urlTest).post("/").send(queryData);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("login");
  });
  it("should be fail login in due to wrong email", async () => {
    queryData.variables = {
      email: "testing23@apollo.com",
      password: "12345",
    };

    const response = await request(urlTest).post("/").send(queryData);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "Invalid email/password" }'
    );
  });
  it("should be fail login in due to wrong password", async () => {
    queryData.variables = {
      email: "testing2@apollo.com",
      password: "123456789",
    };

    const response = await request(urlTest).post("/").send(queryData);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "Invalid email/password" }'
    );
  });
  it("should be fail login in due to user don't send email", async () => {
    queryData.variables = {
      password: "123456789",
    };

    const response = await request(urlTest).post("/").send(queryData);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "Email is required" }'
    );
  });
  it("should be fail login in due to user don't send password", async () => {
    queryData.variables = {
      email: "testing2@apollo.com",
    };

    const response = await request(urlTest).post("/").send(queryData);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "Password is required" }'
    );
  });
});
