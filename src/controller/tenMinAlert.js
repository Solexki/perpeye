const { Op } = require("sequelize");
const Listings = require("../model/listings");




const fetchAllListings = async () => {
  try {
    const listings = await Listings.findAll({
      limit: 10,
      order: [["listingDate", "ASC"]],
    });
    if (listings.length === 0) {
      return;
    }
    const currentTime = new Date();
    const tenMinutesFromNow = new Date(currentTime.getTime() + 10 * 60 * 1000);
    const upcomingListings = listings.filter((listing) => {
      const listingTime = new Date(listing.listingDate);
      return listingTime >= currentTime && listingTime <= tenMinutesFromNow;
    });
    if (upcomingListings.length === 0) {
      return;
    }
  } catch (error) {
    console.error("Error fetching and saving listings:", error);
  }
};

const justListed = async () => {
  const currentTime = new Date();
  const tweentyFourHoursAgo = new Date(
    currentTime.getTime() - 24 * 60 * 60 * 1000
  );

  try {
    const listings = await Listings.findAll({
      where: {
        listingDate: {
          [Op.between]: [tweentyFourHoursAgo, currentTime],
        },
      },
      limit: 10,
      order: [["listingDate", "ASC"]],
    });

    if (!listings.length) {
      console.log("No upcoming futures listings found.");

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

    return listingData;
  } catch (error) {
    console.error("Error fetching and saving listings:", error);
    throw error;
  }
};

const upcomingFutures = async () => {
  try {
    const listings = await Listings.findAll({
      where: {
        listingDate: {
          [Op.gt]: new Date(),
        },
      },
      limit: 10,
      order: [["listingDate", "ASC"]],
    });

    if (!listings.length) {
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

    return listingData;
  } catch (error) {
    console.error("Error fetching and saving listings:", error);
  }
};

module.exports = {
  fetchAllListings,
  upcomingFutures,
  justListed,
};
