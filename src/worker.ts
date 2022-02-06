import { Axios } from "axios";
import { logMessage } from "./utils/log";
import cheerio from "cheerio";
import { EXPECTED_ADS_PER_PAGE } from "./utils/constant";
import { addItems, getTotalAdsCount, scrapeTruckItem } from "./services/otomoto";

class ScrapeWorker {
    axios: Axios;
    url : string;
    page : number;
    retry : number;
    checkExpected : boolean;

    constructor(_axios : Axios,_url: string,page : number,_retry: number,_checkExpected : boolean = false) {
        this.url = _url
        this.axios = _axios
        this.page = page
        this.retry = _retry
        this.checkExpected = _checkExpected
        logMessage(`Worker created for page ${this.page}`)
    }
    
    scrapData =  async () => {
        logMessage(`Scraping page ${this.page}......`)
        const otomotoRes = await this.axios.get(this.url);
        if(otomotoRes.status !== 200) return [];
        const $ = cheerio.load(otomotoRes.data);

        const totalAds = getTotalAdsCount($)
        logMessage(`Total ads found ${totalAds}`)

        const items = addItems($);
        const truckItem = await scrapeTruckItem(items,this.axios);
        return truckItem
    }

    run = async (retry_count : number) => {
        let total = await this.scrapData();
        logMessage(`Page ${this.page} has ${total.length} items`);
        if(this.checkExpected && total.length !== EXPECTED_ADS_PER_PAGE && retry_count < this.retry){
            logMessage(`Expected ${EXPECTED_ADS_PER_PAGE} items, but got ${total.length}, retrying page ${this.page}`);
            total = await this.run(retry_count + 1);
        }
        logMessage(`Successfully scraped ${total.length} items of page ${this.page}`);
        return total
    }
}

export { ScrapeWorker }
