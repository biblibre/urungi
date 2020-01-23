# How to build Docker images

## With `docker build`

In a terminal, `cd` to the root directory of Urungi and run the following command:

```
docker build -t urungi .
```

This will build a Docker image of Urungi with the latest Node.js LTS version,
and tag it with the name 'urungi'

If you want another version of Node.js, use the build argument `NODE_TAG`

```
docker build --build-arg NODE_TAG=10-alpine -t urungi .
```

See [node on dockerhub](https://hub.docker.com/_/node) for a list of available tags.

Now that you have an image of Urungi, you just need to pull another Docker
image for MongoDB, and run them in containers.

```
docker pull mongo:latest
docker run -d --name mongo mongo:latest
docker run -p 8080:8080 -e 'MONGODB_URI=mongodb://mongo:27017/urungi' --name urungi --link mongo urungi
```

If all went well, you can now access Urungi by going to http://localhost:8080

## With `docker-compose build`

You can have the same result as above by using `docker-compose`

```
docker-compose build
docker-compose up
```

It will pull the latest mongo image and build Urungi image using `node:lts`.
This can be changed using environment variables.

```
NODE_TAG=10-alpine MONGO_TAG=4.0-xenial docker-compose build
NODE_TAG=10-alpine MONGO_TAG=4.0-xenial docker-compose up
```

See [mongo on dockerhub](https://hub.docker.com/_/mongo) for a list of available tags.
