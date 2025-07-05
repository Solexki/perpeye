const sequelizeIntance = require("../startup/db");
const { DataTypes, Model } = require("sequelize");

class Listings extends Model {}

const listingsSchema = {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "upcoming",
  },
  listingDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  exchange: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isShortable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isFutures: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
};

Listings.init(listingsSchema, {
  sequelize: sequelizeIntance,
  modelName: "Listings",
});

module.exports = Listings;
