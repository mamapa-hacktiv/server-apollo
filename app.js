import "dotenv/config";
import initServer from "./config/server.mjs";

initServer()
  .then(({ url }) => console.log(`🚀 Server ready at ${url}`))
  .catch((err) => console.log(err));
