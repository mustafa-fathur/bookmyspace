'use strict';
const { v4 } = require('uuid');
const bcrypt = require('bcrypt');
const user = require('../models/user');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSaltSync(10)
    const userId = await queryInterface.rawSelect('roles', {
      where: { namaRole: 'user' }
    }, ['idRole']);

    await queryInterface.bulkInsert('users', 
    [{
      idUser: v4(),
      nama: 'Mustafa Fathur Rahman',
      username: '2211522036',
      password: bcrypt.hashSync('300904', salt),
      noHp: '082268108031',
      gender: 'Laki-laki',
      idRole: userId,
    },
    {
      idUser: v4(),
      nama: 'Naufal Adli Dhiaurrahman',
      username: '2211521008',
      password: bcrypt.hashSync('123456', salt),
      noHp: '08123',
      gender: 'Laki-laki',
      idRole: userId,
    },
    {
      idUser: v4(),
      nama: 'Laura Iffa Razitta',
      username: '2211523020',
      password: bcrypt.hashSync('123123', salt),
      noHp: '0822',
      gender: 'Perempuan',
      idRole: userId,
    }
  ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});

  }
};
