import * as puppeteer from 'puppeteer';
import checkDomijn from './corporation/domijn';
import checkWoonplaats from './corporation/woonplaats';
import {
    getImageSourceFromElement,
    getLinkFromElement,
    getPriceFromElement,
    getTextFromElement,
    getTextFromUlElement
} from '../util';
import * as sqlite from 'sqlite3';
import { isAdvertisementInDatabase, putAdvertisementInDatabase } from '../database';
import Advertisement from '../types/advertisement.types';
import PossibleAdvertisement from '../types/possibleadvertisement.types';
import { colored, log } from '../logger';

export default async function scrape(database: sqlite.Database): Promise<Advertisement[]> {
    const headless = process.env.HEADLESS !== 'false';
    const priceFrom = parseFloat(process.env.PRICE_FROM as string);
    const priceTo = parseFloat(process.env.PRICE_TO as string);

    const possibleMatches = await getAdvertisements(database, headless, priceFrom, priceTo, 100);

    log(
        ['info', 'scraper'],
        'Found ' + colored('brightyellow', possibleMatches.length.toString()) + ' possible advertisements:'
    );

    // TODO: Don't forget to check for special requirements like +55
    const advertisements: Advertisement[] = [];
    for (const possibleAdvertisement of possibleMatches) {
        const domain = new URL(possibleAdvertisement.link).hostname;
        let advertisement;
        switch (domain) {
            case 'www.domijn.nl':
                advertisement = await checkDomijn({
                    database,
                    possibleAdvertisement,
                    priceFrom,
                    priceTo
                });
                break;
            case 'www.dewoonplaats.nl':
                advertisement = await checkWoonplaats({
                    database,
                    possibleAdvertisement,
                    priceFrom,
                    priceTo
                });
                break;
            // case 'mijn.onshuis.com':
            //     advertisement = checkOnshuis(headless, link);
            //     break;
        }
        if (advertisement) advertisements.push(advertisement);
    }
    return advertisements;
}

async function getAdvertisements(
    database: sqlite.Database,
    headless: boolean,
    priceFrom: number,
    priceTo: number,
    faultRange: number
): Promise<PossibleAdvertisement[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
    });
    const page = (await browser.pages())[0];
    await page.goto('https://www.ikzoekeenhuisinenschede.nl/woningaanbod/?_sort=onlangs_desc');

    const possibleAdvertisements: PossibleAdvertisement[] = [];

    // Get all Advertisements on ikzoekeenhuisinenschede.nl
    let advertisements = await page.$$('.huis');
    // Filter out all already applied or previous checked advertisements
    advertisements = advertisements.filter(async (advertisement) => {
        const link = await getLinkFromElement(page, advertisement);
        const isInDatabase = isAdvertisementInDatabase(database, link);
        return !isInDatabase;
    });
    // Check all not previous checked links that are between our price point
    if (advertisements.length > 0) {
        await Promise.all(
            advertisements.map(async (advertisement) => {
                const priceElement = await advertisement.$('.price');
                const value = await getPriceFromElement(page, priceElement);
                const link = await getLinkFromElement(page, advertisement);
                // Check if we are going to check out the advertisement
                if (value > priceFrom - faultRange && value < priceTo + faultRange) {
                    const advertisementIsInDatabase = await isAdvertisementInDatabase(database, link);
                    if (!advertisementIsInDatabase) {
                        const details = await getTextFromUlElement(advertisement, '.info-wrap .info li');
                        if (details.includes('55+')) {
                            return;
                        }
                        const imageLink = await getImageSourceFromElement(advertisement, '.image img');
                        const name = await getTextFromElement(advertisement, '.info-wrap-device .address .street');
                        const respondUntil = await getTextFromElement(advertisement, '.info-wrap .loting');
                        possibleAdvertisements.push({
                            link,
                            imageLink,
                            details: details.join(' | '),
                            respondUntil,
                            name
                        });
                    }
                }
                // Put in database so that we don't check it again next time
                if (!process.env.DEV_MODE) {
                    putAdvertisementInDatabase(database, link);
                }
            })
        );
    }
    await browser.close();
    return possibleAdvertisements;
}
