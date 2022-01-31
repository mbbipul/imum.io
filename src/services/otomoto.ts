import cheerio from "cheerio";

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

export { getLastPagination,getNextPageUrl };