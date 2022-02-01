import axios from "axios";
import cheerio from "cheerio";
import { addItems, getLastPagination, getTotalAdsCount, scrapeTruckItem } from "./services/otomoto";
import { PAGINATION_SELECTOR } from "./utils/constant";
import 'dotenv/config';

const scrapData =  async () => {
    const url = process.env.INITIAL_URL!;
    const otomotoRes = await axios.get(url);
    const $ = cheerio.load(otomotoRes.data);

    const lastPaginition = getLastPagination($,PAGINATION_SELECTOR)
    const totalAds = getTotalAdsCount($)
    const allAds = $('article[data-testid="listing-ad"]');
    const items = addItems($);
    // scrapeTruckItem(items);
	console.log(`Total ads: ${totalAds}`);
	console.log(`Last pagination: ${lastPaginition}`);
	console.log(`Items: ${items.length}`);
}

scrapData();