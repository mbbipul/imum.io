import { Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";
import { getLastPagination, getNextPageUrl } from "../../services/otomoto";
import { PAGINATION_SELECTOR } from "../../utils/constant";

const scrapData =  async (req: Request, res : Response) => {
    const url = process.env.INITIAL_URL!;
    const otomotoRes = await axios.get(url);
    const $ = cheerio.load(otomotoRes.data);

    const lastPaginition = getLastPagination($,PAGINATION_SELECTOR)
    const nextPageUrl = getNextPageUrl(url,1,lastPaginition); 

    res.status(200).json({
        lastPaginition,
        nextPageUrl
    });
}


export { scrapData }

