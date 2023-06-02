"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let dataReactions = require("../data/data.json").Reactions;
    dataReactions.forEach((el) => {
      el.createdAt = el.updatedAt = new Date();
    });
    await queryInterface.bulkInsert("Reactions", dataReactions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Reactions", null, {});
  },
};
