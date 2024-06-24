'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Peminjamans', {
      idPeminjaman: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      idPeminjam: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "idUser"
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      idAdmin: {
        allowNull: true,
        type: Sequelize.UUID,
        references: {
          model: "Users",
          key: "idUser"
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      kegiatan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tanggalPengajuan: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      formulir: {
        type: Sequelize.STRING,
        allowNull: false
      },
      statusPengajuan: {
        type: Sequelize.ENUM('Menunggu', 'Disetujui', 'Ditolak'),
        allowNull: false,
        defaultValue: 'Menunggu'
      },
      tanggalKeputusan: {
        type: Sequelize.DATE,
        allowNull: true
      },
      alasanPenolakan: {
        type: Sequelize.STRING,
        allowNull: true
      },
      suratPeminjaman: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Peminjamans');
  }
};
