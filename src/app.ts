import  { Axios } from "axios";
import cheerio from "cheerio";
import { addItems, getLastPagination, getNextPageUrl, getTotalAdsCount, scrapeTruckItem } from "./services/otomoto";
import {  MIN_EXPECTED_TOTAL_PAGE, PAGINATION_SELECTOR } from "./utils/constant";
import 'dotenv/config';
import fs from 'fs';
import { createAxios } from "./services/_axios";
import { Truck } from "./models/Truck";
import { logMessage } from "./utils/log";
import { ScrapeWorker } from "./worker";

const getTotalPageNumber = async (axios : Axios,count : number,retry: number) => {
    const otomotoRes = await axios.get(process.env.INITIAL_URL!);
    const $ = cheerio.load(otomotoRes.data);
    let lastPagination = getLastPagination($,PAGINATION_SELECTOR)
    if(lastPagination < MIN_EXPECTED_TOTAL_PAGE && count < retry){
        logMessage(`Minimum Expected ${MIN_EXPECTED_TOTAL_PAGE} pages, got ${lastPagination}. Retrying attempt ${count+1} ....`)
        lastPagination = await getTotalPageNumber(axios,count+1,retry)
    }
    return lastPagination
}


const main = async (retry: number) => {
    const start = new Date().getTime();
    const INITIAL_URL = process.env.INITIAL_URL!;

    const _axios = await createAxios(retry);

    let totalPageNumber = await getTotalPageNumber(_axios,0,retry)

    logMessage(`Total pages: ${totalPageNumber}`);
    let url = INITIAL_URL;
    let total: Truck[] = []
    for(let i = 1; i <= totalPageNumber; i++){
        let checkExpected = i !== totalPageNumber;
        const worker = new ScrapeWorker(_axios,url,i,retry,checkExpected)
        let all = await worker.run(0)
        total = total.concat(all)
        url = getNextPageUrl(url,i)
    }
    console.log(total.length)
    console.log(`Total time: ${new Date().getTime() - start} ms`);
}

main(3);



const scrapData =  async () => {
    const _axios = await createAxios(3);
    const otomotoRes = await _axios.get(process.env.INITIAL_URL!);
    const $ = cheerio.load(otomotoRes.data);

    const totalAds = getTotalAdsCount($)
    const items = addItems($);
    const truckItem = await scrapeTruckItem(items,_axios);
    
    const data = {
        totalAds,
        items,
        truckItem
    }
    fs.writeFile('data.json', JSON.stringify(data,null,4), 'utf8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been created');
    });

}

// scrapData()