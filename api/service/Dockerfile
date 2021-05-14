FROM node:15-alpine
WORKDIR /tzprofiles
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./index.js ./index.js
RUN npm install

EXPOSE 8080
ENTRYPOINT ["node", "index.js"]
