ARG NODE_TAG=lts

FROM node:$NODE_TAG

USER node

COPY --chown=node package.json package-lock.json /home/node/app/
WORKDIR /home/node/app
RUN npm ci --only=production

COPY --chown=node . .

EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
