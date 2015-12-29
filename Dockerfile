FROM node:5.3.0
MAINTAINER treelite <c.xinle@gmail.com>

WORKDIR /app/ship

ADD ./package.json ./
RUN npm install

ADD ./lib ./lib
ADD ./app.js ./
ADD ./.babelrc ./

RUN npm run compile

EXPOSE 80

VOLUME ["/var/log/ship", "/etc/ship"]

ENTRYPOINT ["node", "output/app.js"]
