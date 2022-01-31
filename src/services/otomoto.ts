import cheerio from "cheerio";
import { Item } from "../models/Item";

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
    const allAds = $('article[data-testid="listing-ad"]');
    const items : Item[] = []

    allAds.map((index,element) => {
        items.push({
            id: $(element).attr('id')!,
            url: $(element).find('a').attr('href')!
        })
    })
    return items;
}
export { getLastPagination,getNextPageUrl,addItems };