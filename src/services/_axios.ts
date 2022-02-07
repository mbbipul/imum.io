import axios, { Axios } from "axios";
import cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";

const isIpValid = (ipAddress: string) => {
    return /^(?:(?:^|\.)(?:2(?:5[0-5]|[0-4]\d)|1?\d?\d)){4}$/.test(ipAddress)
}

const getFreeProxy = async () => {
    const proxy = await axios.get(process.env.FETCH_PROXY_SERVERS_URL!);
    const $ = cheerio.load(proxy.data);
    let ip_addresses: string[] = [];
    let port_numbers: string[] = [];

    $("td:nth-child(1)").each(function(index, element) {
        let ip = $(element).text();
        //check ip address is valid
        ip_addresses[index] = $(element).text();
    });
  
    $("td:nth-child(2)").each(function(index, element) {
        port_numbers[index] = $(element).text();
    });
    return [ip_addresses, port_numbers];
}

const getRandomProxyServer = async (proxy_servers : any[]) : Promise<string> => {
    const [ips, ports] = proxy_servers;
    const random_index = Math.floor(Math.random() * proxy_servers.length);
    const ip = ips[random_index];
    if(isIpValid(ip)){
        return `http://${ip}:${ports[random_index]}`;
    }
    return await getRandomProxyServer(proxy_servers);
}


const createAxios = async (retry: number) : Promise<Axios> => {
    const proxy_servers = await getFreeProxy();

    const retry_count = {
        401: 0,
        403: 0,
        404: 0,
        500: 0,
        other: 0
    };
    const _axios = axios.create({
        httpAgent: new HttpsProxyAgent(await getRandomProxyServer(proxy_servers)), // only for proxy server
        headers : {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'
        }
    });
    
    /* 
        different error handling are used for different error codes for different retry attempts.
        now all error codes are handled with the same retry logic.
        as the provided website does not need any authentication or any other special handling,
        thus all error codes are handled with the same retry logic.
        But the error handler is separated for better understanding.
    */
    _axios.interceptors.request.use(async(config) => {
        const proxy = await getRandomProxyServer(proxy_servers)
        config.httpAgent = new HttpsProxyAgent(proxy);
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    _axios.interceptors.response.use((config) => config, async (error) => {
        if (error.config && error.response && error.response.status === 403) {
            if (retry_count[403] > retry) {
                global.logger.error('Retries error "403" more than 3 times, exiting request');
                global.logger.error(`failed url ${error.config.url}`);
                return Promise.resolve(error);
            }
            global.logger.error('Bot detection, retrying ');
            retry_count[403]++;
            return _axios.request({
                method: error.config.method,
                url: error.config.url,
                params: error.config.params,
            });
        }
        // Server errors 5xx retry
        if (error.config && error.response && error.response.status >= 500) {
            if (retry_count[500] > retry) {
                global.logger.error('Retries error 5xx more than 3 times, exiting request');
                global.logger.error(`failed url ${error.config.url}`);
                return Promise.resolve(error);
            }
            retry_count[500]++;
            global.logger.error(`${error.repsonse.status} server error, repeating request`);
            return _axios.request({
                method: error.config.method,
                url: error.config.url,
                params: error.config.params,
            });
        }
        // Authentication has expired
        if (error.config && error.response && error.response.status === 401) {
            // no implementation as provided website doesn't need any authentication, so there will be no 401 error
        }

        if (error.config && error.response && error.response.status === 404) {
            global.logger.error(`${error.response.status} not found, exiting request`);
        }

        // Other errors
        if (retry_count.other > retry) {
            global.logger.error('Retries other errors more than 3 times, exiting request');
            global.logger.error(`failed url ${error.config.url}`);
            return Promise.resolve(error);
        }
        retry_count.other++;
        global.logger.error(`Somethig went wrong, repeating request`);
        return _axios.request({
            method: error.config.method,
            url: error.config.url,
            params: error.config.params,
        });
    });
    return _axios;
}

export { createAxios };
