import Advertisement from './types/advertisement.types';
import { log } from './logger';

const mailjet = require('node-mailjet').connect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);
export default function sendMail(advertisements: Advertisement[]) {
    const amount = advertisements.length.toString();
    const date = new Date(Date.now()).toUTCString();
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.EMAIL,
                    Name: 'Ikzoekeenhuisinenschede-scraper'
                },
                To: [
                    {
                        Email: process.env.EMAIL,
                        Name: 'mail'
                    }
                ],
                TemplateID: process.env.MAILJET_TEMPLATE_ID,
                TemplateLanguage: true,
                Subject: advertisements.length + ' Gevonden woningen',
                Variables: {
                    amount,
                    date,
                    advertisements
                }
            }
        ]
    });
    request
        .then((result: { body: any }) => {
            log(['info', 'mailer'], 'Successfully send mail to ' + process.env.EMAIL);
        })
        .catch((err: any) => {
            log(['error', 'mailer'], 'Error sending mail ' + err);
        });
}
