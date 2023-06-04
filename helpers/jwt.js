import { config } from "dotenv"
config()
import jwt from "jsonwebtoken";
const secret = process.env.SECRET_KEY_JWT;

const createToken = (payload) => jwt.sign(payload, secret);
const decodeToken = (token) => jwt.verify(token, secret);

export { createToken, decodeToken };
