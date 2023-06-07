export default {
  development: {
    username: "postgres",
    password: "postgres",
    database: "mamapa_DB",
    host: "localhost",
    dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "mamapa_DB_Test",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    "use_env_variable": "DATABASE_URL"
  },
};
