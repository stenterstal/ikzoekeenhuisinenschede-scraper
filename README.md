<h1 align="center">
  Ikzoekeenhuisinenschede-scraper
  <br>
</h1>

<h4 align="center">A <a href="https://developers.google.com/web/tools/puppeteer/">Puppeteer</a> webscraper to automatically send you mail about new available residence through <a href="https://www.mailjet.com/">Mailjet</a> </h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#to-do">To-do</a> •
  <a href="#how-to-use">How to use</a> •
  <a href="#setup">Setup</a> •
  <a href="#license">License</a>
</p>

## Key Features

* Scrape [ikzoekeenhuisinenschede.nl](https://www.ikzoekeenhuisinenschede.nl/) on specified intervals for available residences
* Mail found residences to your mailbox using <a href="https://www.mailjet.com/">Mailjet</a>
* Ability to manually set price points for the residences

## To-do

- [ ] Implement scraping for [onshuis.com](https://www.onshuis.com/)
- [ ] Add check for residences that have special requirements (e.g being 55+)
- [ ] Add tests

## How To Use

### Local

To clone and run this application locally, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone git@github.com:stenterstal/ikzoekeenhuisinenschede-scraper.git

# Go into the repository
$ cd ikzoekeenhuisinenschede-scraper

# Install dependencies
$ npm install

# Run the app
# (!) Make sure you have set all the environment variables and configured mailjet
$ npm start
```

### Docker

If you want to use this project as a docker image you will need `docker` installed (duh). Enter the following commands from the command line

```bash
# Clone this repository
$ git clone git@github.com:stenterstal/ikzoekeenhuisinenschede-scraper.git

# Go into the repository
$ cd ikzoekeenhuisinenschede-scraper

# Build docker image
$ docker build . -t <image-name>

# Create container using the created image and read the environment variables from a file
# (!) Make sure you have set all the environment variables and configured mailjet
$ docker run --name <container-name> --env-file <path-to-env> <image-name>
```

## Setup
### Setup Mailjet
1. Create an account on <a href="https://www.mailjet.com/">Mailjet.com</a>
2. Choose the free tier as plan (6000 free mails per month, 200 a day)
3. Create a new transactional template with the option <i>By coding it in MJML</i> and import the file `MJML_TEMPLATE.mjml`
4. Set the variables in your `.env` file

### Setup .env

You can rename `.env-example` to `.env` and fill it with the appropiate variables like described below.

Trying to run the application without the required environment variables will result in an error.

````bash
# If in dev mode the application will only run once and will not send the mail using mailjet.
DEV_MODE=false # true or false
# Starting price of residences the scraper needs to look for (Allowance price)
PRICE_FROM=442.46 # Use a dot for the cents
# Ending price of residences the scraper needs to look for (Allowance price)
PRICE_TO=633
# Cron format of how many times the scraper needs to execute
CRON_FORMAT=0 0 6 ? * MON,WED,FRI *
# Receiving adress for the results
EMAIL=mail@mail.com
# ID of the created Mailjet Transactional MJML template
MAILJET_TEMPLATE_ID=
# Mailjet API Key
MAILJET_API_KEY=...
# Mailjet SECRET Key
MAILJET_SECRET_KEY=...

````

## License

My written code is licensed under MIT

As the scraper uses an external website to gather data an additional disclaimer is present: https://www.ikzoekeenhuisinenschede.nl/disclaimer/

---

> [stenterstal.com](https://www.stenterstal.com) &nbsp;&middot;&nbsp;
> GitHub [@stenterstal](https://github.com/stenterstal)
