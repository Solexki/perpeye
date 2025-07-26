const { Op } = require("sequelize");
const Listings = require("../model/listings");
const sequelizeIntance = require("../startup/db");

const sendTenMinAlert = async () => {};

const fetchAllListings = async () => {
  try {
    const listings = await Listings.findAll({
      limit: 10,
      order: [["listingDate", "ASC"]],
    });
    if (listings.length === 0) {
      console.log("No upcoming futures listings found.");
      return;
    }
    const currentTime = new Date();
    const tenMinutesFromNow = new Date(currentTime.getTime() + 10 * 60 * 1000);
    const upcomingListings = listings.filter((listing) => {
      const listingTime = new Date(listing.listingDate);
      return listingTime >= currentTime && listingTime <= tenMinutesFromNow;
    });
    if (upcomingListings.length === 0) {
      console.log("No upcoming futures listings in the next 10 minutes.");
      return;
    }
    console.log(
      "Upcoming futures listings in the next 10 minutes:",
      upcomingListings
    );
    // Here you can add code to send alerts, e.g., via email or messaging service
  } catch (error) {
    console.error("Error fetching and saving listings:", error);
  }
};

const justListed = async () => {
  const currentTime = new Date();
  const tweentyFourHoursAgo = new Date(
    currentTime.getTime() - 24 * 60 * 60 * 1000
  );
  let transaction;
  try {
    transaction = await sequelizeIntance.transaction();
    const listings = await Listings.findAll({
      where: {
        listingDate: {
          [Op.between]: [tweentyFourHoursAgo, currentTime],
        },
      },
      limit: 10,
      order: [["listingDate", "ASC"]],
      transaction,
    });

    if (listings.length === 0) {
      console.log("No upcoming futures listings found.");
      if (transaction) await transaction.rollback();
      return;
    }
    const listingData = listings.map((listing) => ({
      title: listing.title,
      symbol: listing.symbol,
      listingDate: new Date(listing.listingDate).toLocaleString(),
      id: listing.id,
      exchange: listing.exchange,
      maxLeverage: listing.maxLeverage,
      isShortable: listing.isShortable,
      isFutures: listing.isFutures,
    }));
    console.log(listingData);
    if (transaction) await transaction.commit();
    return listingData;
  } catch (error) {
    console.error("Error fetching and saving listings:", error);
    if (transaction) await transaction.rollback();
  }
};

const upcomingFutures = async () => {
  console.log(
    "Checking for upcoming futures listings in the next 10 minutes..."
  );
  let transaction;
  try {
    transaction = await sequelizeIntance.transaction();
    const listings = await Listings.findAll({
      where: {
        listingDate: {
          [Op.gt]: new Date(),
        },
      },
      limit: 10,
      order: [["listingDate", "ASC"]],
    });

    if (listings.length === 0) {
      console.log("No upcoming futures listings found.");
      if (transaction) await transaction.rollback();
      return;
    }
    const listingData = listings.map((listing) => ({
      title: listing.title,
      symbol: listing.symbol,
      listingDate: new Date(listing.listingDate).toLocaleString(),
      id: listing.id,
      exchange: listing.exchange,
      maxLeverage: listing.maxLeverage,
      isShortable: listing.isShortable,
      isFutures: listing.isFutures,
    }));
    console.log(listingData);
    if (transaction) await transaction.commit();
    return listingData;
  } catch (error) {
    console.error("Error fetching and saving listings:", error);
    if (transaction) await transaction.rollback();
  }
};

module.exports = {
  sendTenMinAlert,
  fetchAllListings,
  upcomingFutures,
  justListed,
};
