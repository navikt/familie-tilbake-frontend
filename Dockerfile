FROM gcr.io/distroless/nodejs:18

COPY ./ ./

EXPOSE 8000
ENV NODE_ENV=production
CMD [ "--loader", "ts-node/esm", "--es-module-specifier-resolution=node", "node_dist/backend/server.js" ]