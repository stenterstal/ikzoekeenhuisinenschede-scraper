import * as sqlite from 'sqlite3';

function initDatabase(): sqlite.Database {
    const db = new sqlite.Database('./advertisements.db');
    db.exec(`
        CREATE TABLE IF NOT EXISTS advertisements (
            link VARCHAR(50) NOT NULL,
            PRIMARY KEY (link)
        );
    `);
    return db;
}

async function isAdvertisementInDatabase(database: sqlite.Database, link: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        database.all(`SELECT * FROM advertisements WHERE link == ?`, link, function (err, rows) {
            if (err) {
                console.error('Error checking if advertisement is in database: ' + err);
                reject(false);
            } else {
                resolve(rows.length !== 0);
            }
        });
    });
}

function putAdvertisementInDatabase(database: sqlite.Database, link: string) {
    database.run(`INSERT OR IGNORE INTO advertisements VALUES (?)`, link);
}

export { initDatabase, isAdvertisementInDatabase, putAdvertisementInDatabase };
