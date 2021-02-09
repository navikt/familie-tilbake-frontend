FROM navikt/node-express:12.18-alpine
RUN apk --no-cache add curl # trengs curl?

ADD ./ /var/server/

EXPOSE 8000
CMD ["yarn", "start"]