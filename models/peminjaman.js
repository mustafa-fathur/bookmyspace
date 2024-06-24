'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Peminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Peminjaman.belongsTo(models.User, { as: 'peminjam', foreignKey: 'idPeminjam' });
      Peminjaman.belongsTo(models.User, { as: 'admin', foreignKey: 'idAdmin' });
      Peminjaman.hasMany(models.DetailPeminjaman, { as: 'detailPeminjaman', foreignKey: 'idPeminjaman' });    }
  }
  Peminjaman.init({
    idPeminjaman: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    idPeminjam: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'idUser',
      },
    },
    idAdmin: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'idUser',
      },
    },
    kegiatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggalPengajuan: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    formulir: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statusPengajuan: {
      type: DataTypes.ENUM('Menunggu', 'Disetujui', 'Ditolak'),
      allowNull: false,
      defaultValue: 'Menunggu',
    },
    tanggalKeputusan: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    alasanPenolakan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    suratPeminjaman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Peminjaman',
  });
  return Peminjaman;
};