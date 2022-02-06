const PAGINATION_SELECTOR : string = 'li[data-testid="pagination-list-item"]'
const ITEM_SELECTOR : string = 'article[data-testid="listing-ad"]'
const ADS_TITLE_SELECTOR : string = 'h1.offer-title'
const ADS_PRICE_SELECTOR : string = 'span.offer-price__number'
const ADS_REGISTRATION_DATE_SELECTOR : string = 'li:contains("Pierwsza rejestracja") > div.offer-params__value'
const ADS_PRODUCTION_DATE_SELECTOR : string = 'li:contains("Rok produkcji") > div.offer-params__value'
const ADS_MILEAGE_SELECTOR : string = 'li:contains("Przebieg") > div.offer-params__value'
const ADS_POWER_SELECTOR : string = 'li:contains("Moc") > div.offer-params__value'

const MIN_EXPECTED_TOTAL_PAGE = 8
const EXPECTED_ADS_PER_PAGE = 32

export { 
    PAGINATION_SELECTOR,
    ITEM_SELECTOR,
    ADS_TITLE_SELECTOR,
    ADS_PRICE_SELECTOR,
    ADS_REGISTRATION_DATE_SELECTOR,
    ADS_PRODUCTION_DATE_SELECTOR,
    ADS_MILEAGE_SELECTOR,
    ADS_POWER_SELECTOR,
    MIN_EXPECTED_TOTAL_PAGE,
    EXPECTED_ADS_PER_PAGE
}