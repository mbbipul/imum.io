import cheerio from "cheerio";
import { Item } from "../models/Item";
import { Truck } from "../models/Truck";
import { ADS_MILEAGE_SELECTOR, ADS_POWER_SELECTOR, ADS_PRICE_SELECTOR, ADS_PRODUCTION_DATE_SELECTOR, ADS_REGISTRATION_DATE_SELECTOR, ADS_TITLE_SELECTOR, ITEM_SELECTOR, PAGINATION_SELECTOR } from "../utils/constant";

// get last pagination 
const getLastPagination = ($ : cheerio.Root,selector : string) : number => {
    const paginitionItems = $(selector)
    const lastPaginition = +paginitionItems.last().text()
    return lastPaginition;
}

//get next pasge url by current page
const getNextPageUrl = (url : string,currentPage: number) : string => {
    return `${url}&page=${currentPage+1}`;
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

// get item details page
const getItemDetailsPage = async (url : string) : Promise<cheerio.Root | null>  => {
    const otomotoRes = await global.axios.get(url);
    if (otomotoRes.status !== 200) return null
    const $ = cheerio.load(otomotoRes.data);
    return $;
}

const formateUnitValue = (unit_value : string) : string[] => {
    const unit_value_array = unit_value.trim().split(' ');
    let value = ''
    let unit=''
    
    for(let t of unit_value_array){
        if(!isNaN(+t)){
            value += t
        }else{
            unit += t 
        }
    }
    return [value,unit]
}

const formatePrice = (price_string : string) : string => {
    let [price,currency] = formateUnitValue(price_string);
    return `${currency} ${price}`.trim()
}

const formateMilage = (mileage_string : string) : string => {
    let [mileage, unit] = formateUnitValue(mileage_string);
    return `${mileage} ${unit}`.trim()
}

const formatePower = (power_string : string) : string => {
    let [power, unit] = formateUnitValue(power_string);
    return `${power} ${unit}`.trim()
}

//scrapeTruckItem function - that scrapes the actual ads 
const scrapeTruckItem = async (allItems : Item[],page : number) : Promise<Truck[]> => {
    global.logger.info(`Scraping ${allItems.length} items`)
    const trucks : Truck[] = []
    await Promise.all(
        allItems.map(async (item,index) => {
            global.logger.info(`Scraping item ${index+1}/${allItems.length} of page ${page}.....`)
            const $ = await getItemDetailsPage(item.url)
            if(!$) return 

            const titleEle = $(ADS_TITLE_SELECTOR);
            const priceEle = $(ADS_PRICE_SELECTOR);
            const regisEle = $(ADS_REGISTRATION_DATE_SELECTOR);
            const productionEle = $(ADS_PRODUCTION_DATE_SELECTOR);
            const mileageEle = $(ADS_MILEAGE_SELECTOR);
            const powerEle = $(ADS_POWER_SELECTOR);
    
            const truck : Truck = {
                item_id: item.id,
                title : titleEle.first().text().trim(),
                price : formatePrice(priceEle.first().text()),
                registration_date: regisEle.text().trim(),
                production_date : productionEle.text().trim(),
                mileage : formateMilage(mileageEle.text()),
                power : formatePower(powerEle.text())
            }
            trucks.push(truck)
        })
    )
    return trucks;
}

export { getLastPagination,getNextPageUrl,addItems,getTotalAdsCount,scrapeTruckItem };