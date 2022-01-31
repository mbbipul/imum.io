import { Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";
import { addItems, getLastPagination, getTotalAdsCount } from "../../services/otomoto";
import { PAGINATION_SELECTOR } from "../../utils/constant";
import { Item } from "../../models/Item";

const scrapData =  async (req: Request, res : Response) => {
    const url = process.env.INITIAL_URL!;
    const otomotoRes = await axios.get(url);
    const $ = cheerio.load(otomotoRes.data);

    const lastPaginition = getLastPagination($,PAGINATION_SELECTOR)
    const totalAds = getTotalAdsCount($)
    const allAds = $('article[data-testid="listing-ad"]');
    const items = addItems($);

    res.status(200).json({totalAds,items,lastPaginition});
}

const scrapDataByPage = async (req: Request, res : Response) => {
    const page = req.params.page;
    const url = process.env.INITIAL_URL!;
    const otomotoRes = await axios.get(url);
    const $ = cheerio.load(otomotoRes.data);

    const lastPaginition = getLastPagination($,PAGINATION_SELECTOR)

    res.status(200).json({lastPaginition});
}

export { scrapData }

