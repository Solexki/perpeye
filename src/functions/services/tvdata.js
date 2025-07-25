const TvDataFeedClient = require("tvdatafeedclient-js");

const getTvData = async (exchage, symbol, interval, nBar) => {
  const tv = new TvDataFeedClient();
  await tv.connect();
  return await tv.getCandles(exchage, symbol, interval, nBar);
};

module.exports = getTvData;
