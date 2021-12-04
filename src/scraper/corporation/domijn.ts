import * as puppeteer from 'puppeteer';
import { getPriceFromXPath } from '../../util';
import { putAdvertisementInDatabase } from '../../database';
import check from '../../types/check.types';
import advertisement from '../../types/advertisement.types';
import { colored, log } from '../../logger';

export default async function checkDomijn({
    database,
    possibleAdvertisement,
    priceFrom,
    priceTo
}: check): Promise<undefined | advertisement> {
    const link = possibleAdvertisement.link;
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
    });
    const page = (await browser.pages())[0];
    await page.setDefaultNavigationTimeout(0);
    await page.goto(link);

    const allowancePrice = await getPriceFromXPath(
        page,
        '//*[@id="content-anchor"]/div[1]/div/div[2]/div[1]/div/div/div[1]/p[2]'
    );

    if (allowancePrice < priceFrom || allowancePrice > priceTo) {
        log(
            ['info', 'scraper'],
            'Advertisement is ' +
                colored('brightred', 'NOT') +
                ' between bounds ' +
                colored('cyan', '(' + possibleAdvertisement.link + ')')
        );
        await putAdvertisementInDatabase(database, link);
        await browser.close();
        return;
    }

    log(
        ['info', 'scraper'],
        'Advertisement is ' +
            colored('brightgreen', 'IS') +
            ' between bounds ' +
            colored('cyan', '(' + possibleAdvertisement.link + ')')
    );

    const flatPrice = await getPriceFromXPath(
        page,
        '//*[@id="content-anchor"]/div[1]/div/div[2]/div[1]/div/div/div[1]/p[3]'
    );
    const price = await getPriceFromXPath(
        page,
        '//*[@id="content-anchor"]/div[1]/div/div[2]/div[1]/div/div/div[1]/p[1]/span'
    );

    await browser.close();
    return {
        link,
        imageLink: possibleAdvertisement.link,
        respondUntil: possibleAdvertisement.respondUntil,
        name: possibleAdvertisement.name,
        details: possibleAdvertisement.details,
        allowancePrice,
        flatPrice,
        price
    };
}
