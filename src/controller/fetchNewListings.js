const axios = require("axios");
const { saveListings } = require("./ListingsSaver");

const dateExtractor = (title) => {
  const dateRegex = /(\d{4}[-\/]\d{2}[-\/]\d{2})/;
  const match = title.match(dateRegex);
  if (!match) return false;
  const dateStr = match[1].replace(/\//g, "-");
  const parseDate = new Date(`${dateStr}T14:00:00+01:00`);
  return isNaN(parseDate) ? null : parseDate;
};

const extractListingDate = (title) => {
  const dateRegex = /([A-Za-z]+ \d{1,2}, \d{4}, \d{2}:\d{2})/;
  const match = title.match(dateRegex);
  if (!match) return null;
  const dateStr = match[1].replace(/\//g, "-");
  const parseDate = new Date(dateStr);
  return isNaN(parseDate) ? null : parseDate.getTime();
};

const extractSymbol = (title) => {
  if (!title) return null;
  const symbolRegex = /\b[A-Z]+(USDT|USDC)\b/g;
  const match = title.match(symbolRegex);
  if (!match) return null;
  return match[0].toUpperCase();
};

const trimTitle = (title) => {
  const cleanTitle = title.replace(/^\[.*?\]\s*/, "").trim();
  return cleanTitle;
};

async function fetchBinanceListings() {
  try {
    const { data } = await axios.get(
      `https://www.binance.com/bapi/apex/v1/public/apex/cms/article/list/query?type=1&pageNo=1&pageSize=10&catalogId=48`
    );
    const articles = data?.data?.catalogs[0].articles;
    const articleData = articles.map(({ title, releaseDate, code }) => ({
      id: code,
      symbol: extractSymbol(title),
      title,
      releaseDate,
      code: `https://www.binance.com/en/support/announcement/detail/${code}`,
      listingDate: dateExtractor(title),
    }));
    const filterArticle = articleData.filter((art) => {
      if (!art.title.includes("Futures")) return false;
      const listingDate = dateExtractor(art.title);
      if (!listingDate) return false;
      return listingDate >= Date.now();
    });
    return filterArticle;
  } catch (err) {
    console.error("Scrape error:", err);
    return [];
  }
}

const fetchBybitListings = async () => {
  try {
    const { data } = await axios.post(
      `https://announcements.bybit.com/x-api/announcements/api/search/v1/index/announcement-posts_en
  `,
      {
        data: {
          query: "",
          page: 0,
          hitsPerPage: 8,
          filters: "category.key: 'new_crypto'",
        },
      },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Origin: "https://announcements.bybit.com/?category=&page=1",
          Referer:
            "https://announcements.bybit.com/common-static/infra-static/monitor/monitor.latest.js?id=49",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    const result = data.result.hits;
    const listings = result.map((item) => {
      const title = item.title;
      const listingDate = new Date(
        item.start_date_timestamp * 1000
      ).toLocaleString();
      const link = `https://announcements.bybit.com/en/announcement${item.url}`;
      const id = item.objectID.split(".")[1];
      const symbol = extractSymbol(item.title);
      const category = item.category.key;
      const topics = item.topics;
      const publishedAt = new Date(item.publish_time * 1000).toLocaleString();
      return {
        title,
        listingDate,
        link,
        category,
        topics,
        publishedAt,
        id,
        symbol,
      };
    });
    const filteredListings = listings.filter((listing) => {
      if (listing.category !== "new_crypto") return false;
      return listing.topics.includes("Derivatives");
    });

    return filteredListings;
  } catch (error) {
    console.error("Error fetching Bybit listings:", error);
    return [];
  }
};

const fetchMexcListings = async () => {
  try {
    const { data } = await axios.get(
      `https://www.mexc.com/help/announce/api/en-US/section/15425930840735/articles?page=1&perPage=20`,

      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Origin: "https://www.mexc.com",
          Referer: "https://www.mexc.com/support/categories/360000254192",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 10000,
      }
    );

    if (!data || !data.data || !data.data.results) {
      console.error("Unexpected data format:", data);
      return [];
    }
    const articles = data?.data?.results || [];
    const articleData = articles.map(
      ({ title, id, parentSections, createdAt }) => ({
        title: trimTitle(title),
        link: `https://www.mexc.com/support/articles/${id}`,
        parentSections: parentSections.map((section) => section.name),
        createdAt,
        listingDate: extractListingDate(title),
      })
    );
    const filterArticle = articleData.filter((art) => {
      if (!art.title.includes("Futures")) return false;
      return art.listingDate < Date.now();
    });
    console.log("mexc listing", filterArticle);
    return filterArticle;
  } catch (err) {
    console.error("Scrape error:", err);
    return [];
  }
};

const fetchMexcListingsV2 = async () => {
  try {
    const { data } = await axios.get(
      `https://futures.mexc.co/api/v1/contract/detail?type=all`,
      {},
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Origin: "https://www.mexc.co/markets/reference?position=newest",
          Referer:
            "https://trochilus-web.gotoda.co/trochilus-web-sdk-integration.js",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    if (!data || !data.data) {
      console.error("Unexpected data format:", data);
      return [];
    }
    const listingsData = data?.data || [];
    const listing = listingsData
      .filter(
        (item) =>
          item.symbol.includes("USDT") &&
          item.displayNameEn.includes("PERPETUAL") &&
          item.isNew &&
          item.openingTime > Date.now()
      )
      .map((item) => ({
        symbol: item.symbol,
        title: item.displayNameEn,
        listingDate: new Date(item.openingTime).toLocaleString(),
        id: item.symbol,
        maxLeverage: item.maxLeverage,
        isShortable: true,
        isFutures: true,
      }));
    return listing;
  } catch (error) {
    console.error("Error fetching MEXC listings:", error);
    return [];
  }
};

const fetchAndSaveListings = async () => {
  const binanceListings = await fetchBinanceListings();
  await saveListings(binanceListings, "Binance");

  const bybitListings = await fetchBybitListings();
  await saveListings(bybitListings, "Bybit");

  const mexcV2Listings = await fetchMexcListingsV2();
  await saveListings(mexcV2Listings, "Mexc");
};

const fetchAllListings = async () => {
  try {
    await fetchAndSaveListings();
    console.log("All listings fetched and saved successfully.");
  } catch (error) {
    console.error("Error fetching and saving listings:", error);
  }
};

module.exports = {
  fetchBinanceListings,
  fetchBybitListings,
  fetchMexcListings,
  fetchAllListings,
};
