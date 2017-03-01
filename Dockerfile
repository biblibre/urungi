FROM node:6.2.2

RUN git config --global url."https://".insteadOf git://

RUN npm install -g bower

WORKDIR /srv/app/

COPY package.json /srv/app/

COPY bower.json /srv/app/

RUN npm install

RUN bower install --allow-root --force-latest

COPY . /srv/app/

ENTRYPOINT ["node"]

CMD ["server.js"]