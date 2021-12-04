import check from '../../types/check.types';
import advertisement from '../../types/advertisement.types';
import * as puppeteer from 'puppeteer';
import { getPriceFromXPath } from '../../util';
import { putAdvertisementInDatabase } from '../../database';
import { colored, log } from '../../logger';

export default async function checkWoonplaats({
    database,
    possibleAdvertisement,
    priceFrom,
    priceTo
}: check): Promise<undefined | advertisement> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
    });
    const page = (await browser.pages())[0];
    await page.setDefaultNavigationTimeout(0);
    await page.goto(possibleAdvertisement.link);

    // Click on kenmerken tab
    const [tab] = await page.$x('//*[@id="tabs-algemeen"]/a[2]');
    await tab.click();

    const allowancePrice = await getPriceFromXPath(page, '//*[@id="woonvinder_featureblock"]/div[3]/span[2]');

    if (allowancePrice < priceFrom || allowancePrice > priceTo) {
        log(
            ['info', 'scraper'],
            'Advertisement is ' +
                colored('brightred', 'NOT') +
                ' between bounds ' +
                colored('cyan', '(' + possibleAdvertisement.link + ')')
        );
        await putAdvertisementInDatabase(database, possibleAdvertisement.link);
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

    const flatPrice = await getPriceFromXPath(page, '//*[@id="woonvinder_featureblock"]/div[2]/span[2]');
    const price = await getPriceFromXPath(page, '//*[@id="woonvinder_featureblock"]/div[1]/span[2]');

    await browser.close();
    return {
        link: possibleAdvertisement.link,
        imageLink: possibleAdvertisement.imageLink,
        respondUntil: possibleAdvertisement.respondUntil,
        name: possibleAdvertisement.name,
        details: possibleAdvertisement.details,
        allowancePrice,
        flatPrice,
        price
    };
}
