'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DetailPeminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DetailPeminjaman.belongsTo(models.Peminjaman, { as: 'peminjaman', foreignKey: 'idPeminjaman' });
      DetailPeminjaman.belongsTo(models.Ruangan, { as: 'ruangan', foreignKey: 'idRuangan' });    }
  }
  DetailPeminjaman.init({
    idPeminjaman: {
      primaryKey: true,
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Peminjamans',
        key: 'idPeminjaman',
      },
    },
    idRuangan: {
      primaryKey: true,
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Ruangans',
        key: 'idRuangan',
      },
    },
    tanggal: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    jamMulai: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    jamSelesai: {
      type: DataTypes.TIME,
      allowNull: false,
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
    modelName: 'DetailPeminjaman',
  });
  return DetailPeminjaman;
};