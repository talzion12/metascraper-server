FROM node:21-alpine as base

RUN mkdir /app
WORKDIR /app

FROM base as builder

RUN apk add --update --no-cache openssl1.1-compat
ADD package.json yarn.lock ./
RUN yarn install

ADD . /app-tmp
RUN mv /app-tmp/* .
RUN rm -rf /app-tmp
RUN yarn build

FROM base as prod

# Add Tini
RUN apk add --update --no-cache tini

ENV NODE_ENV production

COPY package.json yarn.lock /app/
RUN yarn install

COPY --from=builder /app/build /app/build/

ENTRYPOINT ["tini", "--", "node"]
CMD ["build/main.js"]
