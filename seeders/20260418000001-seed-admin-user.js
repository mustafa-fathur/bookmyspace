'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin',
        email: 'admin@bookmyspace.com',
        password: hashedPassword,
        phone_number: null,
        gender: null,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Fathur',
        email: 'fathur@bookmyspace.com',
        password: hashedPassword,
        phone_number: '+628123456789',
        gender: 1,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@bookmyspace.com' });
    await queryInterface.bulkDelete('Users', { email: 'fathur@bookmyspace.com' });
  },
};
