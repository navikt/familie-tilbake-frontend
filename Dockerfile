FROM navikt/node-express:12.18-alpine
RUN apk --no-cache add curl

ADD ./ /var/server/

CMD ["yarn", "start"]