import { ElementHandle, Page } from 'puppeteer';
import * as process from 'process';

export async function getPriceFromElement(page: Page, element: ElementHandle | null): Promise<number> {
    if (!element) {
        console.error('Element is null');
        process.exit(1);
    }
    return (await page.evaluate((el) => parseFloat(el.textContent.trim().replace(',', '.')), element)) as number;
}

export async function getPriceFromXPath(page: Page, xPath: string): Promise<number> {
    const [element] = await page.$x(xPath);
    return (await page.evaluate((el) => el.textContent.split('€')[1].trim().replace(',', '.'), element)) as number;
}

export async function getLinkFromElement(page: Page, element: ElementHandle) {
    return (await (await element.getProperty('href')).jsonValue()) as string;
}

export async function getImageSourceFromElement(element: ElementHandle, selector: string) {
    const imageElement = await element.$(selector);
    const imageProperty = await imageElement?.getProperty('src');
    const imageValue = await imageProperty?.jsonValue();
    return imageValue as string;
}

export async function getTextFromElement(element: ElementHandle, selector: string) {
    const textElement = await element.$eval(selector, (text) => text.innerHTML);
    return textElement.trim();
}

export async function getTextFromUlElement(element: ElementHandle, selector: string): Promise<string[]> {
    const listItems = await element.$$(selector);
    return await Promise.all(
        listItems.map(async (element) => {
            return (await (await element.getProperty('innerText')).jsonValue()) as string;
        })
    );
}
