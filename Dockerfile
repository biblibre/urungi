FROM node:6.2.2

RUN apt-get update && apt-get install -y openjdk-7-jdk &&  npm install -g bower

WORKDIR /srv/app/

COPY . /srv/app/

RUN npm install

RUN bower install --allow-root --force-latest

ENTRYPOINT ["node"]

CMD ["server.js"]
