import { Axios } from "axios";
import { logMessage } from "./utils/log";
import cheerio from "cheerio";
import { EXPECTED_ADS_PER_PAGE } from "./utils/constant";
import { addItems, getTotalAdsCount, scrapeTruckItem } from "./services/otomoto";
import { Item } from "./models/Item";
import { Truck } from "./models/Truck";

class ScrapeWorker {
    axios: Axios;
    url : string;
    page : number;
    retry : number;
    checkExpected : boolean;

    constructor(_url: string,page : number,_retry: number,_checkExpected : boolean = false) {
        this.url = _url
        this.axios = global.axios
        this.page = page
        this.retry = _retry
        this.checkExpected = _checkExpected
        logMessage(`Worker created for page ${this.page}`)
    }
    
    scrapData =  async () : Promise<{
        items : Item[],
        truckItem : Truck[]
    }> => {
        logMessage(`Scraping page ${this.page}......`)
        const otomotoRes = await this.axios.get(this.url);
        if(otomotoRes.status !== 200) {
            return {
                items : [],
                truckItem : []
            };
        }
        const $ = cheerio.load(otomotoRes.data);

        const totalAds = getTotalAdsCount($)
        logMessage(`Total ads found ${totalAds}`)

        const items = addItems($);
        const truckItem = await scrapeTruckItem(items,this.page);
        return {items,truckItem}
    }

    run = async (retry_count : number) => {
        let data = await this.scrapData();
        logMessage(`Page ${this.page} has ${data.truckItem.length} items`);
        if(this.checkExpected && data.truckItem.length !== EXPECTED_ADS_PER_PAGE && retry_count < this.retry){
            logMessage(`Expected ${EXPECTED_ADS_PER_PAGE} items, but got ${data.truckItem.length}, retrying page ${this.page}`);
            data = await this.run(retry_count + 1);
        }
        logMessage(`Successfully scraped ${data.truckItem.length} items of page ${this.page}`);
        return data
    }
}

export { ScrapeWorker }
