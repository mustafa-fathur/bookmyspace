'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Space extends Model {
    static associate(models) {
      Space.hasMany(models.Booking, { foreignKey: 'SpaceId', onDelete: 'CASCADE' });
    }
  }

  Space.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'Space',
    }
  );

  return Space;
};
