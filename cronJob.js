const cron = require("node-cron");
const getNewListings = require("./src/controller/fetchListings");
const { getCandleData } = require("./src/controller/priceTracker");
const detectSignalType = require("./src/controller/patternDetector");
const { fetchAllListings } = require("./src/controller/fetchNewListings");
const { removeOldListing } = require("./src/controller/listingsFun");
const {
  sendNewListingsNotification,
  notifyUserOfTenMinAlert,
  notifyUsersOfSignals,
} = require("./bot");

// This cron job will run every hour to check for new listings and send alerts
// It will check for new listings every hour and analyze them for trading signals
cron.schedule("0 * * * *", async () => {
  const listings = await getNewListings();
  const signals = [];

  for (let coin of listings) {
    try {
      const symbol = coin.symbol;
      const candles = await getCandleData(symbol);
      const { signal, confidence } = detectSignalType(candles);

      if (signal === "short" || signal === "long") {
        const latest = candles[candles.length - 1];
        signals.push({
          symbol: symbol,
          price: latest.close,
          signal: signal,
          confidence: confidence,
        });
      }
    } catch (err) {
      console.error(`❌ Error processing ${coin.symbol}:`, err.message);
    }
  }
  console.log("✅ Signal scan complete.\n");
  if (!signals || signals.length < 1) {
    return;
  }
  return await notifyUsersOfSignals(signals);
});

// This cron job will run every 6 hours to remove old listings
// It will remove listings older than 48 hours
cron.schedule("0 */12 * * *", async () => {
  await removeOldListing();
  console.log("✅ Old listings removed.");
});

// This cron job will run every hour to fetch all listings and log them
cron.schedule(
  "5 * * * *",
  async () => {
    try {
      const listings = await fetchAllListings();
      if (!listings || listings.length < 1) {
        console.log("No new listings found.");
        return;
      }

      console.log(listings);
    } catch (error) {
      console.error("Error in scheduled task:", error.message);
    }
  },
  {
    scheduled: true,
    timezone: "America/New_York",
  }
);

//this cron job will run every fourty minute to send notifications for new listings
cron.schedule("*/40 * * * *", async () => {
  await sendNewListingsNotification();
});

cron.schedule("*/20 * * * *", async () => {
  await notifyUserOfTenMinAlert();
});
