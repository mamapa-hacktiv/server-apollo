import bcrypt from "bcryptjs"
const salt = bcrypt.genSaltSync(10);

const hashPassword = (password) => bcrypt.hashSync(password, salt);
const comparePassword = (password, dbPassword) => bcrypt.compareSync(password, dbPassword);

export { hashPassword, comparePassword };
