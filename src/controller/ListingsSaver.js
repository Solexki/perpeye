const Listings = require("../model/listings");
const sequelizeIntance = require("../startup/db");

const saveListings = async (listings, exchange) => {
  let transaction;
  try {
    transaction = await sequelizeIntance.transaction();
    if (listings.length < 1) {
      console.log(`No upcoming futures listings found on ${exchange}.`);
      return [];
    }
    for (const article of listings) {
      const [listing, created] = await Listings.findOrCreate({
        where: { id: article.id },
        defaults: {
          symbol: article.symbol,
          title: article.title.trim(),
          listingDate: article.listingDate,
          exchange: exchange,
          isShortable: true,
          isFutures: true,
        },
      });
      if (created) {
        console.log(`New listing created: ${listing.title} `);
      } else {
        console.log(`Listing already exists: ${listing.title}`);
      }
    }
    if (transaction) {
      await transaction.commit();
    }
  } catch (error) {
    console.error("Error saving listings:", error);
    if (transaction) {
      await transaction.rollback();
    }
  }
};

module.exports = { saveListings };
