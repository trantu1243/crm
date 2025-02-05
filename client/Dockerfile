FROM node:alpine as builder

RUN mkdir -p /usr/src/client && chown -R node:node /usr/src/client

WORKDIR /usr/src/client

COPY package.json ./

USER node

RUN npm install --force

COPY --chown=node:node . .

# Set the timezone to the UK (GMT or BST)
ENV TZ=Europe/London

# Install tzdata to set the timezone
USER root
RUN apk add --no-cache tzdata \
    && ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime \
    && echo "Europe/London" > /etc/timezone \
    && apk del --purge tzdata

USER node

RUN npm run build

FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /usr/src/client/build .
COPY nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]