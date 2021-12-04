import * as dotenv from 'dotenv';
import * as cron from 'node-cron';
import scrape from './scraper';
import { initDatabase } from './database';
import sendMail from './mailer';
import { colored, log } from './logger';

dotenv.config();

// Make sure all environment variables are here
if (
    !process.env.CRON_FORMAT ||
    !process.env.EMAIL ||
    !process.env.PRICE_FROM ||
    !process.env.PRICE_TO ||
    !process.env.MAILJET_TEMPLATE_ID ||
    !process.env.MAILJET_API_KEY ||
    !process.env.MAILJET_SECRET_KEY
) {
    log(['error', '.env'], 'Not all environmental variables are set!');
    process.exit(1);
}

// Init database
const database = initDatabase();

// Development mode
if (process.env?.DEV_MODE === 'true') {
    log(['info', 'scraper'], 'Starting scraper in ' + colored('brightyellow', 'development') + ' mode');
    scrape(database);
}
// Production
else {
    log(
        ['info', '.env'],
        'Scraper will run according to cron specified in the environment variables: ' + process.env.CRON_FORMAT
    );
    cron.schedule(process.env.CRON_FORMAT, () => {
        log(['info', 'scraper'], 'Starting scraper in ' + colored('brightyellow', 'production') + ' mode');
        scrape(database).then((advertisements) => {
            log(
                ['info', 'scraper'],
                'Found ' + colored('brightyellow', advertisements.length.toString()) + ' advertisements'
            );
            if (advertisements.length > 0) {
                sendMail(advertisements);
            }
        });
    });
}
