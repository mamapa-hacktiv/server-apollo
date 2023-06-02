"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let dataRecipes = require("../data/data.json").Recipes;
    dataRecipes.forEach((el) => {
      el.createdAt = el.updatedAt = new Date();
    });
    await queryInterface.bulkInsert("Recipes", dataRecipes);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Recipes", null, {});
  },
};
