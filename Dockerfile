FROM node:18-alpine

RUN apk add --no-cache build-base python3

RUN npm install tar@latest

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
