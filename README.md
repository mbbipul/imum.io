# Imum.io Coding Assignment

This repository contains imum.io coding assignment project.

The given tasks:
**Need to use:** node - for running scraping cheerio - for parsing html file ([https://www.npmjs.com/package/cheerio](https://www.npmjs.com/package/cheerio), used similarly as jquery) either puppeteer/playwright or request-promise for fetching ads Purpose: scrape [otomoto.pl](http://otomoto.pl/) portal using provided interface.

  
**BONUS: scraping via otomoto mobile app.**  

1.  Initial url [https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/](https://www.otomoto.pl/ciezarowe/uzytkowe/mercedes-benz/) od-2014/q-actros? search%5Bfilter_enum_damaged%5D=0&search%5Border%5D=created_at %3Adesc
2.  Add getNextPageUrl function to iterate over pages
3.  Add addItems function that fetches item urls + item ids (unique ids that the portal uses) from list page
4.  Add getTotalAdsCount function - shows how many total ads exist for the provided initial url
5.  Add scrapeTruckItem function - that scrapes the actual ads and parses into the format: item id, title, price, registration date, production date, mileage, power
6.  Scrape all pages, all ads

**Questions/thoughts:**  

1.  Ideas for error catching/solving, retry strategies?
2.  Accessing more ads from this link than the limit allows (max 50 pages)?
3.  Experience with CI/CD tools?
4.  Other considerations?


# Solutions
A node js based application written in Typescript.
## **Error catching/solving, retry strategies**
One of the most common issues when it comes to web scraping and automation is how to best handle HTTP errors when a request fails.Several errors can be occured during http request.Some errors and used error handeling in this project are given below
-   `404`  naturally indicated a ‘not found’ whenever I was scraping a particular product or series of products.
	- This error are handled by finishing the request
-   `401`  indicated that the credentials’ session that I was using were no longer valid and/or had expired. 
	- No error handler  implemented , as provided website doesn't need any authentication, so there will be no 401 error
- `403` indicated that my program had encountered a bot detection page and to many request 
	- This error are handled by proxy server and proxy rotator
-   `5XX`  was quite common during high-traffic times (the particular API that I was scraping was not particularly well scaled during peak load). These  `5XX` errors needed a fast-paced retry sequence, in order to get the request through.
	- This error are handled by proxy server and proxy rotator
	
We used **free proxy server** which are also collected via scrapping .The error's are handled by proxy server,proxy rotation and retry stretegy.We can also sleep for 10-15 seconds to hold the request and try again to avoid errors. There are also some error stretegy can be used. By only using those stretegy i am able to scrape all items without any issues.
**Please see the code** for better understand the error catching and handleing stretegy.

## **Steps for web scrapping**
 1. Visited initial url (after correction) 
 2. Checked the pagination and find out the each pagination page pattern
 3. Scrapped number of pages available for initial url.
 4. Used getNextPageUrl function to iterate over pages
 5.  Go through each page and used addItems function that fetches item urls + item ids (unique ids that the portal uses) from list page
 6.  Used getTotalAdsCount function - to count total ads exist for the provided initial url and all pages
 7. Iterate over each item and used scrapeTruckItem  to scrapped ad information by loading ad item details page.
 8. Saved all information to the output file in json format
 
## **Steps for mobile app scrapping**
 1. Install android emulator and Http Toolkit
 2. Install ototmoto mobile app on the emulator
 3. Connect the Http Toolkit with emulator
 4. Monitor otomoto app http request via Http Toolkit and find out the rest api for fetching the ads.
 5. Modified the get request with search filter .
 6. Fetch ads and checked response.
 7. Found paging information , next_page_url and ad details
 8. Collect item id and link from the ads information
 9. Iterate over the items and load ad details data using ad link,then collect ad data using scrapeTruckItem  functions .
10. Recursively followed step 7-9 until the page has no next_page_url
11.  Saved all information to the output file in json format

N.B :  The number of scrapped items via mobile are not same as web scrapped items.Because i didn’t understand the otomoto website language. So i couldn't make the exact query via mobile app.
  

## Project structure

 - .gitthub - contains github action yml file for CI & CD.
 - logs - this folder contains all logs during scrapping via web and mobile app.
 
			 app.log - logs of web scraaping 			
			 mobile.log - logs of mobile app scrapping
- output - contains the scrapped ads  item (addItem) , truckItems (scrapeTruckItem) in json file.

			data.json - contains scrapped ads via web app.
							{
								"totalAdsForInitialLink" : 32,
								"items" : [....],
								"truckItem": [.....],
								"totalAds": 241
							}
			mobile_data.json - contains scrapped ads via mobile app
							{
								"items" : [....],
								"truckItem": [.....],
								"totalAds": 2030
							}
	N.B : The scrapped items via web and mobile are not same ,because i didn't understand the otomoto used language.So i couldn't make the exact query via mobile app.
- src - This folder contains all source code of the project.
	- models - has 2 files item and truck ads interface (type definition)
	- services - main scrapping logic and all services
	- utils - contains utility codes
	- app.ts - The entry point for web app scrapping
	- mobile.ts - The entry point for mobile app scrapping
	- worker - contains scrapper workers both for mobile and web
	

## Run
**Install**
		
		npm install
**Scrapping via web app**

		npm start
**Scrapping via mobile app**
			
		npm run mobile
		
	

## Used Library
-  axios - for handling http request
- cheerio - for parsing html file
- https-proxy-agent  - An HTTP(s) proxy  http.Agent  implementation for HTTPS
- dotenv - for environment file
- winston - logging library

## Other tools
- Http Toolkit - To Intercept & view all  mobile app HTTP(S). Http toolkit was used to monitor "otomoto" android app traffic on android emulator.
- Android Studio Adb - for android emulator
## CI and CD tools
- Docker - used for containerized the app
- github action - used for CI
- Have experience of AWS CodePipeline to create CI & CD pipeline 
- Also have experience Azure DevOps
- Can deploy the app in AWS (Beanstalk/E2C ), Digital Ocean ( Droplets) and Azure server (Have experience with Deployment in AWS,Digital Ocean and AWS)
	
