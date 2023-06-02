"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let dataSteps = require("../data/data.json").Steps;
    dataSteps.forEach((el) => {
      el.createdAt = el.updatedAt = new Date();
    });
    await queryInterface.bulkInsert("Steps", dataSteps);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Steps", null, {});
  },
};
