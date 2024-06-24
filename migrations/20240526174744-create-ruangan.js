'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ruangans', {
      idRuangan: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      namaRuangan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lokasi: {
        type: Sequelize.STRING,
        allowNull: false
      },
      kapasitas: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fasilitas: {
        type: Sequelize.STRING,
        allowNull: false
      },
      foto: {
        type: Sequelize.STRING,
        allowNull: false
      },
      statusKetersediaan: {
        type: Sequelize.ENUM('Tersedia', 'Dipinjam'),
        allowNull: false,
        defaultValue: 'Tersedia'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Ruangans');
  }
};