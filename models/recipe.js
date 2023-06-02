"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Recipe.belongsTo(models.User, { foreignKey: "UserId" });
      Recipe.hasMany(models.Reaction, { foreignKey: "RecipeId" });
      Recipe.hasMany(models.Favorite, { foreignKey: "RecipeId" });
      Recipe.hasMany(models.Comment, { foreignKey: "RecipeId" });
      Recipe.hasMany(models.Step, { foreignKey: "RecipeId" });
      Recipe.hasMany(models.Ingredient, { foreignKey: "RecipeId" });
    }
  }
  Recipe.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title can not be empty",
          },
          notNull: {
            msg: "Title can not be null",
          },
        },
      },
      image: DataTypes.STRING,
      description: DataTypes.TEXT,
      videoUrl: DataTypes.STRING,
      origin: DataTypes.STRING,
      portion: DataTypes.INTEGER,
      cookingTime: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Recipe",
    }
  );
  return Recipe;
};
