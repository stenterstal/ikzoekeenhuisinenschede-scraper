FROM buildkite/puppeteer

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
#RUN npm ci --only=production

# Make chromium executable for puppeteer
RUN chmod -R o+rwx node_modules/puppeteer/.local-chromium

# Bundle app source
COPY . .

CMD npm start
