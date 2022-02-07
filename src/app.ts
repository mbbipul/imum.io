import  { Axios } from "axios";
import cheerio from "cheerio";
import { getLastPagination, getNextPageUrl } from "./services/otomoto";
import {  MIN_EXPECTED_TOTAL_PAGE, PAGINATION_SELECTOR } from "./utils/constant";
import 'dotenv/config';
import fs from 'fs';
import { Truck } from "./models/Truck";
import { ScrapeWorker } from "./worker";
import { createAxios } from "./services/_axios";
import { Item } from "./models/Item";
import { LoggerService } from "./services/logger";

const logger =  new LoggerService('app');

declare global {
    namespace NodeJS {
        interface Global {
            axios: Axios;
            logger: LoggerService;
        }
    }
}
global.logger = logger;

const getTotalPageNumber = async (count : number,retry: number) => {
    const otomotoRes = await global.axios.get(process.env.INITIAL_URL!);
    const $ = cheerio.load(otomotoRes.data);
    let lastPagination = getLastPagination($,PAGINATION_SELECTOR)
    if(lastPagination < MIN_EXPECTED_TOTAL_PAGE && count < retry){
        global.logger.info(`Minimum Expected ${MIN_EXPECTED_TOTAL_PAGE} pages, got ${lastPagination}. Retrying attempt ${count+1} ....`)
        lastPagination = await getTotalPageNumber(count+1,retry)
    }
    return lastPagination
}


const main = async (retry: number) => {
    global.axios = await createAxios(3);
    const INITIAL_URL = process.env.INITIAL_URL!;

    let totalPageNumber = await getTotalPageNumber(0,retry)

    global.logger.info(`Total pages: ${totalPageNumber}`);

    let totalAdsForInitialLink : number = 0;

    let url = INITIAL_URL;

    const data = {
        totalAdsForInitialLink,
        items : [] as Item[],
        truckItem: [] as Truck[],
        totalAds: 0,
    }

    for(let i = 1; i <= totalPageNumber; i++){
        let checkExpected = i !== totalPageNumber;
        const worker = new ScrapeWorker(url,i,retry,checkExpected)
        let all = await worker.run(0)
        if(i === 1){
            totalAdsForInitialLink = all.truckItem.length
        }
        data.items = [...data.items, ...all.items]
        data.truckItem = [...data.truckItem, ...all.truckItem]
        url = getNextPageUrl(url,i)
    }

    data.totalAdsForInitialLink = totalAdsForInitialLink
    data.totalAds = data.truckItem.length

    global.logger.info(`Total ads scraped: ${data.totalAds}`)
  
    fs.writeFile('data.json', JSON.stringify(data,null,4), 'utf8', (err) => {
        if (err) {
            global.logger.error("Failed to write ads to file");
            return;
        }
        global.logger.info('Scraped data saved to data.json');
    });
}

main(3);
