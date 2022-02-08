import { Axios } from "axios";
import { LoggerService } from "./services/logger";
import { createAxios } from "./services/_axios";
import 'dotenv/config';
import { MobileScrapper } from "./worker";

const logger =  new LoggerService('mobile');

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
    let retry =  3;
    global.axios = await createAxios(retry);
    const mobile = new MobileScrapper(retry);
    await mobile.run(process.env.SCRAP_VIA_MOBILE_APP_URL!);
    mobile.saveData();
}

main()
