"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      emoji: {
        type: Sequelize.STRING,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      RecipeId: {
        references: {
          model: {
            tableName: "Recipes",
          },
          key: "id",
        },
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Users",
          },
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reactions");
  },
};
