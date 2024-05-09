'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');
const role = require('./role');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleId: {
      type: DataTypes.UUID
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSaltSync(10)
          user.password = bcrypt.hashSync(user.password, salt)
        }
        if (!user.roleId) {
          const roleUser = await sequelize.models.Role.findOne({ where: { role: 'user' } })
          user.roleId = roleUser.id
        }
      }
    },
    sequelize,
    modelName: 'User',
  });
  User.prototype.CorrectPassword = async (reqPassword, passwordDB) => {
    return await bcrypt.compareSync(reqPassword, passwordDB)
  }
  return User;
};