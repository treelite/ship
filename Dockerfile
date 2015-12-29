FROM node:5.3.0
MAINTAINER treelite <c.xinle@gmail.com>

WORKDIR /app/ship

ADD ./lib ./
ADD ./app.js ./
ADD ./package.json ./

RUN npm install
RUN npm run compile

EXPOSE 80

VOLUME ["/var/log/ship", "/etc/ship"]

ENTRYPOINT ["node", "output/app.js"]
