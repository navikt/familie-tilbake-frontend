FROM navikt/node-express:14-alpine
USER root
RUN apk --no-cache add curl # trengs curl?
USER apprunner

ADD ./ /var/server/

EXPOSE 8000
CMD ["yarn", "start"]