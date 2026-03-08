FROM node:18-alpine

RUN apk update && apk add --no-cache --upgrade tar

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
