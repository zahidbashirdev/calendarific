const axios = require("axios");
const asyncHandler = require("express-async-handler");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: process.env.NODE_CACHE_TTL });

const getSupportedCountries = async () => {
  const cacheKey = 'supported_countries';
  let supportedCountries = cache.get(cacheKey);

  if (!supportedCountries) {
    try {
      const response = await axios.get(`${process.env.CALENDARIFIC_BASE_URL}/countries`, {
        params: {
          api_key: process.env.CALENDARIFIC_API_KEY,
        },
      });

      supportedCountries = response.data.response.countries;
      cache.set(cacheKey, supportedCountries);
    } catch (error) {
      throw new Error('Failed to fetch supported countries');
    }
  }

  return supportedCountries;
};

const getHolidays = asyncHandler(async (req, res) => {
  const { country, year } = req.query;

  if (!country || !year) {
    return res.status(400).json({ error: "Countery and Year is required" });
  }

  const supported_countries = await getSupportedCountries();
  const countryExists = supported_countries.some((c) => c["iso-3166"] === country.toUpperCase());

  if (!countryExists) {
    return res.status(400).json({ error: "Invalid country" });
  }

  const cacheKey = `holiday_${country}_${year}`;
  const cachedHolidays = cache.get(cacheKey);

  if (cachedHolidays) {
    return res.status(200).json({ data: cachedHolidays });
  } else {
    try {
      const response = await axios.get(
        `${process.env.CALENDARIFIC_BASE_URL}/holidays`,
        {
          params: {
            api_key: process.env.CALENDARIFIC_API_KEY,
            country,
            year,
          },
        }
      );
      const holidays = response.data.response.holidays;
      cache.set(cacheKey, holidays);
      return res.status(200).json({ data: holidays });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch Holidays" });
    }
  }
});

const getCountries = asyncHandler(async (req, res) => {
  try{
    const supported_countries = await getSupportedCountries();
     return res.status(200).json({ data: supported_countries });
  }catch(error){
    return res.status(500).json({ error: "Failed to fetch countries" });
  }
});

module.exports = { getHolidays, getCountries };
