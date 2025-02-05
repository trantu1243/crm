FROM node:alpine

RUN mkdir -p /usr/src/server && chown -R node:node /usr/src/server

WORKDIR /usr/src/server

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["yarn", "start"]