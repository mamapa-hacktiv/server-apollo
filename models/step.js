"use strict";
import { Model } from "sequelize"
export default (sequelize, DataTypes) => {
  class Step extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Step.belongsTo(models.Recipe, { foreignKey: "RecipeId" });
    }
  }
  Step.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      instruction: DataTypes.TEXT,
      image: DataTypes.STRING,
      RecipeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Step",
    }
  );
  return Step;
};
