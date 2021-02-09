FROM navikt/node-express:12.2.0-alpine
RUN apk --no-cache add curl # trengs curl?

ADD ./ /var/server/

EXPOSE 8000
CMD ["yarn", "start"]