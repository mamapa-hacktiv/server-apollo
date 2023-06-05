import { decodeToken } from "../helpers/jwt.js"
import model from "../models/index.js";
const { User } = model

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

export default authentication;
