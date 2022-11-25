FROM node:16.17.0-alpine as builder

WORKDIR /code
ADD package.json /code/
RUN npm i -g nrm --registry=https://registry.npmmirror.com/ && nrm use taobao && npm install

ADD . /code
RUN npm run build

FROM --platform=linux/amd64 nginx:alpine
ADD ./nginx.conf  /etc/nginx/conf.d/default.conf
COPY --from=builder code/build /usr/share/nginx/html
