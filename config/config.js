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
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
