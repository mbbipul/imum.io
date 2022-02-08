import { Axios } from "axios";
import cheerio from "cheerio";
import { EXPECTED_ADS_PER_PAGE } from "./utils/constant";
import { addItems, getTotalAdsCount, scrapeTruckItem } from "./services/otomoto";
import { Item } from "./models/Item";
import { Truck } from "./models/Truck";
import fs from 'fs';

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
        global.logger.info(`Worker created for page ${this.page}`)
    }
    
    scrapData =  async () : Promise<{
        items : Item[],
        truckItem : Truck[]
    }> => {
        global.logger.info(`Scraping page ${this.page}......`)
        const otomotoRes = await this.axios.get(this.url);
        if(otomotoRes.status !== 200) {
            return {
                items : [],
                truckItem : []
            };
        }
        const $ = cheerio.load(otomotoRes.data);

        const totalAds = getTotalAdsCount($)
        global.logger.info(`Total ads found ${totalAds}`)

        const items = addItems($);
        const truckItem = await scrapeTruckItem(items,this.page);
        return {items,truckItem}
    }

    run = async (retry_count : number) => {
        let data = await this.scrapData();
        global.logger.info(`Page ${this.page} has ${data.truckItem.length} items`);
        if(this.checkExpected && data.truckItem.length !== EXPECTED_ADS_PER_PAGE && retry_count < this.retry){
            global.logger.info(`Expected ${EXPECTED_ADS_PER_PAGE} items, but got ${data.truckItem.length}, retrying page ${this.page}`);
            data = await this.run(retry_count + 1);
        }
        global.logger.info(`Successfully scraped ${data.truckItem.length} items of page ${this.page}`);
        return data
    }
}

class MobileScrapper {
    axios: Axios;
    retry : number;
    items: Item[] = [];
    truckItem: Truck[] = [];
    currentPage = 1;
    totalAds = 0;

    constructor(_retry: number) {
        this.axios = global.axios
        this.retry = _retry
        global.logger.info(`MobileScrapper created`)
    }
    
    scrapData =  async (ads : any) => {
        global.logger.info(`Start scrapping page ${this.currentPage}.......`);
        const items = ads.map((ad: any)  => {
            return {
                id: ad.id,
                url: ad.url,
            }
        })
        console.log(`Found ${items.length} ads of page ${this.currentPage}`);
        this.totalAds += items.length;
        
        const truckItem = await scrapeTruckItem(items,this.currentPage);

        this.items = [...this.items, ...items];
        this.truckItem = [...this.truckItem, ...truckItem];

        global.logger.info(`Successfully Scrapped ${items.length} items of page ${this.currentPage}`);

    }

    run = async (url : string) => {
        const data = await this.axios.get(url);
        await this.scrapData(data.data?.ads || []);
        if(this.currentPage === 200) return
        if(typeof data.data.next_page_url !== 'undefined') {
            global.logger.info(`Successfully scraped ${this.totalAds} till now`);
            this.currentPage++;
            await this.run(data.data.next_page_url)
        }
        return
    }

    getData = () : {
        totalAds: number,
        items: Item[],
        truckItem: Truck[]
    }  => {
        return {
            totalAds: this.totalAds,
            items: this.items,
            truckItem: this.truckItem,
        }
    }

    saveData = () => {
        const data = this.getData();
        fs.writeFile(process.env.OUTPUT_DIR+'mobile_data.json', JSON.stringify(data,null,4), 'utf8', (err) => {
            if (err) {
                global.logger.error("Failed to write ads to file");
                return;
            }
            global.logger.info(`Scraped data saved to ${process.env.OUTPUT_DIR}mobile_data.json`);
        });
    }
    
}

export { 
    ScrapeWorker ,
    MobileScrapper
}
