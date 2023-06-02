"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let dataIngredients = require("../data/data.json").Ingredients;
    dataIngredients.forEach((el) => {
      el.createdAt = el.updatedAt = new Date();
    });
    await queryInterface.bulkInsert("Ingredients", dataIngredients);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Ingredients", null, {});
  },
};
