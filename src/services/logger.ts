import winston from "winston"

const dateFormat = () => {
    return new Date(Date.now()).toUTCString()
}

class LoggerService {
    name : string
    logger : winston.Logger
    log_data : any
    constructor(name : string) {
        this.log_data = null
        this.name = name
        
        const logger = winston.createLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({
                    filename: `./logs/${name}.log`
                })
            ],
            format: winston.format.printf((info) => {
                let message = `${dateFormat()} | ${info.level.toUpperCase()} | ${name}.log | ${info.message} | `
                message = info.obj ? message + `data:${JSON.stringify(info.obj)} | ` : message
                message = this.log_data ? message + `log_data:${JSON.stringify(this.log_data)} | ` : message
                return message
            })
        });
        this.logger = logger
    }
    
    setLogData(log_data: any) {
        this.log_data = log_data
    }

    info(message : string) : void
    info(message : string, obj? : any) : void{
        this.logger.log('info', message, {
            obj
        })
    }

    debug(message : string) : void
    debug(message : string, obj? : any) : void {
        this.logger.log('debug', message, {
            obj
        })
    }

    error(message : string) : void
    error(message : string, obj? : any) : void 
    {
        this.logger.log('error', message, {
            obj
        })
    }
}

export {
    LoggerService
}