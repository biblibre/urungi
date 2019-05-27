FROM node:8

RUN apt-get update && apt-get install -y \
    build-essential \
    default-jdk-headless \
    git

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080
CMD npx migrate-mongo up && npm start
