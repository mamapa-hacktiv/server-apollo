"use strict";
import { Model } from "sequelize"
export default (sequelize, DataTypes) => {
  class Reaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Reaction.belongsTo(models.User, { foreignKey: "UserId" });
      Reaction.belongsTo(models.Recipe, { foreignKey: "RecipeId" });
    }
  }
  Reaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      emoji: DataTypes.STRING,
      quantity: DataTypes.INTEGER,
      RecipeId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Reaction",
    }
  );
  return Reaction;
};
