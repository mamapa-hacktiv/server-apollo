import Sequelize from 'sequelize'
import process from 'process'
const env = process.env.NODE_ENV || 'development';
import originalConfig from '../config/config.js';
import comment from './comment.js';
import user from './user.js';
import step from './step.js';
import recipe from './recipe.js';
import reaction from './reaction.js';
import ingredient from './ingredient.js';
import favorite from './favorite.js';
const config = originalConfig[env]
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const commentModel = comment(sequelize, Sequelize.DataTypes)
const userModel = user(sequelize, Sequelize.DataTypes)
const stepModel = step(sequelize, Sequelize.DataTypes)
const recipeModel = recipe(sequelize, Sequelize.DataTypes)
const reactionModel = reaction(sequelize, Sequelize.DataTypes)
const ingredientModel = ingredient(sequelize, Sequelize.DataTypes)
const favoriteModel = favorite(sequelize, Sequelize.DataTypes)
db[commentModel.name] = commentModel
db[userModel.name] = userModel
db[stepModel.name] = stepModel
db[recipeModel.name] = recipeModel
db[reactionModel.name] = reactionModel
db[ingredientModel.name] = ingredientModel
db[favoriteModel.name] = favoriteModel

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
