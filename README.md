# widestage
Lightweight Business Intelligence tool for reporting mongodb, postgresql, Mysql, MS sql, &amp; oracle data

To see how it works go to www.widestage.com

# Requirements

nodejs  (https://nodejs.org)
mongodb (https://www.mongodb.org)
npm (https://www.npmjs.com)
bower (http://bower.io)

- Optional

forever (https://www.npmjs.com/package/forever)
nginx (http://nginx.org)

# Installation

Install nodejs
Install mongodb
    mongodb can be installed in a different server, if so, configure the connection in the /server/config.js production environment.
Install npm
Install bower
Install forever

clone the github repository
    git clone https://github.com/widestage/widestage.git

get into the widestage folder

download and install the npm libraries
    npm install

download and install the bower libraries
    bower install

launch the application using:
    node server.js

    if you downloaded the forever package run:
        forever start "your_path_to_widestage/server.js"

    to see if is running:
        forever list

point your browser to your ip/server name

enter the credentials
    user name: administrator
    password: widestage

enjoy!!!




