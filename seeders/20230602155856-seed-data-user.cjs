"use strict";

const { hashPassword } = require('../helpers/bcryptSeeding.cjs')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let dataUsers = require("../data/data.json").Users;
    dataUsers.forEach((el) => {
      el.password = hashPassword(el.password);
      el.createdAt = new Date();
      el.updatedAt = new Date();
    });
    await queryInterface.bulkInsert("Users", dataUsers);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, { truncate: true, cascade: true, restartIdentity: true });
  },
};
