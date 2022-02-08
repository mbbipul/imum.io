import { Axios } from "axios";
import { Item } from "./models/Item";
import { Truck } from "./models/Truck";
import { LoggerService } from "./services/logger";
import { createAxios } from "./services/_axios";
import 'dotenv/config';
import { scrapeTruckItem } from "./services/otomoto";
import fs from 'fs';

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

const logger =  new LoggerService('mobiles');

declare global {
    namespace NodeJS {
        interface Global {
            axios: Axios;
            logger: LoggerService;
        }
    }
}
global.logger = logger;

const main = async () => {
    global.axios = await createAxios(3);
    const mobile = new MobileScrapper(3);
    await mobile.run(process.env.SCRAP_VIA_MOBILE_APP_URL!);
    mobile.saveData();
}

main()
