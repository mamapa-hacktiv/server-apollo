import request from "supertest";
import initServer from "../config/server.mjs";
import { config } from "dotenv";
if (process.env.NODE_ENV !== "production") {
  config();
}
import model from "../models/index.js";
import { createToken } from "../helpers/jwt.js";
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
  query: `mutation Mutation($email: String, $password: String) {
    login(email: $email, password: $password) {
      access_token
    }
  }`,
};

const queryChatGPT = {
  query: `mutation Mutation($message: String) {
    getAi(message: $message) {
      content
    }
  }`,
};

const queryGetUser = {
  query: `query Query {
    getUser {
      createdAt
      email
      id
      phoneNumber
      updatedAt
      username
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

  it("should be fetchChatGPT", async () => {
    // send our request to the url of the test server
    queryChatGPT.variables = {
      message: "Say hello",
    };
    const response = await request(urlTest).post("/").send(queryChatGPT);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("getAi");
  });
  it("should be fail fetchChatGPT due to user don't send message", async () => {
    queryChatGPT.variables = {
      message: null,
    };

    const response = await request(urlTest).post("/").send(queryChatGPT);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      "Request failed with status code 400"
    );
  });
  it("should be success fetchUser", async () => {
    // send our request to the url of the test server

    const response = await request(urlTest)
      .post("/")
      .send(queryGetUser)
      .set({
        access_token: createToken({ id: 1, email: "testing@apollo.com" }),
      });
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeInstanceOf(Object);
    expect(response.body.data).toHaveProperty("getUser");
  });
  it("should be fail fetch due to user don't send email", async () => {
    const response = await request(urlTest).post("/").send(queryGetUser);
    // console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });
  it("should be fail fetch due to user don't send email", async () => {
    const response = await request(urlTest)
      .post("/")
      .send(queryGetUser)
      .set({
        access_token: createToken({ id: 3, email: "testing@apollo.com" }),
      });
    console.log(response.body, "<<<");
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors[0]).toHaveProperty("message");
    expect(response.body.errors[0].message).toEqual(
      'Unexpected error value: { name: "InvalidToken" }'
    );
  });
});
