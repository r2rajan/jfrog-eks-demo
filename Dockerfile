FROM node:18-alpine

RUN apk add --no-cache build-base python3

RUN npm install -g tar@latest

RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/tar \
           /usr/local/lib/node_modules/npm/node_modules/pacote/node_modules/tar \
           /usr/local/lib/node_modules/npm/node_modules/node-gyp/node_modules/ta

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
