import sqlite from 'sqlite3';
import PossibleAdvertisement from './possibleadvertisement.types';

export default interface check {
    database: sqlite.Database;
    possibleAdvertisement: PossibleAdvertisement;
    priceFrom: number;
    priceTo: number;
}
