const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY_JWT;

const createToken = (payload) => jwt.sign(payload, secret);
const decodeToken = (token) => jwt.verify(token, secret);

module.exports = { createToken, decodeToken };
