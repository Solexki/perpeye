const sequelizeIntance = require("../startup/db");
const { DataTypes, Model } = require("sequelize");

class Users extends Model {}

const usersSchema = {
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSubscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notificationOn: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  receiveSignals: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  receiveDailySignals: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};

Users.init(usersSchema, {
  sequelize: sequelizeIntance,
  modelName: "Users",
});

module.exports = Users;
