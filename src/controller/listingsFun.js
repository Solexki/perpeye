const { Op } = require("sequelize");
const Listings = require("../model/listings");
const { getCandleData } = require("./priceTracker");
const detectSignalType = require("./patternDetector");
const sequelizeIntance = require("../startup/db");

const removeOldListing = async () => {
  let transaction;
  try {
    transaction = await sequelizeIntance.transaction();
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await Listings.destroy({
      where: {
        listingDate: {
          [Op.lt]: cutoff,
        },
      },
      transaction,
    });
    if (transaction) await transaction.commit();
    return;
  } catch (error) {
    console.error("Error removing old listings:", error);
    if (transaction) {
      await transaction.rollback();
    }
  }
};

const getNewListingsTenMins = async () => {
  try {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 40 * 60 * 1000);
    const listings = await Listings.findAll({
      where: {
        listingDate: {
          [Op.between]: [thirtyMinsAgo, now],
        },
      },
      limit: 10,
      order: [["listingDate", "ASC"]],
    });
    if (!listings.length) {
      console.log("No new listings found in the last 30 minutes.");

      return [];
    }

    return listings;
  } catch (error) {
    console.error("Error fetching new listings:", error);
  }
};

const analyzeNewLists = async () => {
  try {
    const signals = [];
    const listings = await getNewListingsTenMins();

    if (listings.length === 0) {
      console.log("No new listings found in the last 30 minutes.");
      return;
    }

    for (const coin of listings) {
      const candleData = await getCandleData(coin.symbol);
      if (!candleData || candleData.length < 1) {
        console.log(`No candle data available for ${coin.symbol}`);
        continue;
      }
      const latestCandle = candleData[candleData.length - 1];
      const { signal, confidence } = detectSignalType(candleData);
      if (signal) {
        signals.push({
          symbol: coin.symbol,
          price: latestCandle.close,
          signal: signal,
          confidence: confidence,
          message: `Signal detected for ${coin.symbol}: ${signal} with confidence ${confidence}. Please do your own research before proceeding.`,
        });
        console.log(
          `Signal detected for ${coin.symbol}: ${signal} with confidence ${confidence}`
        );
      } else {
        console.log(`No significant signal for ${coin.symbol}`);
      }
    }
  } catch (error) {
    console.error("Error fetching new listings:", error);
  }
};

const notifyUserForNewListings = async () => {
  const now = new Date();
  const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60 * 1000);

  const listings = await Listings.findAll({
    where: {
      listingDate: {
        [Op.between]: [now, thirtyMinsFromNow],
      },
    },
    limit: 10,
    order: [["listingDate", "ASC"]],
  });

  if (!listings.length) {
    console.log("No new listings found in the next 10 minutes.");

    return;
  }

  return listings;
};

module.exports = {
  removeOldListing,
  analyzeNewLists,
  notifyUserForNewListings,
  getNewListingsTenMins,
};
