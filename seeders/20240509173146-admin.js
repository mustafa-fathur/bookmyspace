'use strict';
const { v4 } = require('uuid');
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSaltSync(10)
    const adminId = await queryInterface.rawSelect('roles', {
      where: { namaRole: 'admin' }
    }, ['idRole']);

    await queryInterface.bulkInsert('users', [{
      idUser: v4(),
      nama: 'admin',
      username: 'admin',
      password: bcrypt.hashSync('bukanadmin', salt),
      noHp: 'None',
      gender: 'None',
      idRole: adminId,
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});

  }
};
