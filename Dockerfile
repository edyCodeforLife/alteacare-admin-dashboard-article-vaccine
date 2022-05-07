FROM node:14-alpine

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install --only=production --quiet

COPY . .

RUN NODE_ENV=production npm run build

EXPOSE 8888

CMD ["npm", "run", "start"]
