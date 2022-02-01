import axios from "axios";
import cheerio from "cheerio";
import { Item } from "../models/Item";
import { Truck } from "../models/Truck";
import { ADS_PRICE_SELECTOR, ADS_TITLE_SELECTOR, ITEM_SELECTOR, PAGINATION_SELECTOR } from "../utils/constant";

// get last pagination 
const getLastPagination = ($ : cheerio.Root,selector : string) : number => {
    const paginitionItems = $(selector)
    const lastPaginition = +paginitionItems.last().text()
    return lastPaginition;
}

//get next pasge url by current page
const getNextPageUrl = (url : string,currentPage: number,lastPagination : number) : string => {
    if(currentPage < lastPagination){
        return `${url}&page=${currentPage+1}`;
    }
    return url;
}

/*Add addItems function that fetches item urls,
item ids (unique ids that the portal uses) from list page */
const addItems = ($ : cheerio.Root) : Item[] => {
    const allAds = $(ITEM_SELECTOR);
    const items : Item[] = []

    allAds.map((index,element) => {
        items.push({
            id: $(element).attr('id')!,
            url: $(element).find('a').attr('href')!
        })
    })
    return items;
}

// shows how many total ads exist for the provided initial url
const getTotalAdsCount = ($ : cheerio.Root) : number => {
    const allAds = $(ITEM_SELECTOR);
    return allAds.length;
}

const getItemDetailsPage = async (url : string) : Promise<cheerio.Root> => {
    const otomotoRes = await axios.get(url);
    const $ = cheerio.load(otomotoRes.data);
    return $;
}

const scrapeTruckItem = (allItems : Item[]) : Truck[] => {
    const trucks : Truck[] = []
    allItems.map((item,index) => {
        getItemDetailsPage(item.url).then(($) => {
            // console.log('hj '+$.f)
        })
    })
    return trucks;
}

export { getLastPagination,getNextPageUrl,addItems,getTotalAdsCount,scrapeTruckItem };