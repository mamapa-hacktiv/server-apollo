const { decodeToken } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(token) {
  let payload = decodeToken(token);
  const findUser = await User.findByPk(payload.id);
  if (!findUser) throw { name: "InvalidToken" };
  const user = {
    id: findUser.id,
    email: findUser.email,
  };
  return user;
}

module.exports = authentication;
