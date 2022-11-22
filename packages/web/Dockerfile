FROM node:16.17.0-alpine as builder

WORKDIR /code
ADD package.json /code/
RUN npm i -g pnpm && pnpm install

ADD . /code
RUN pnpm run build

FROM --platform=linux/amd64 nginx:alpine
ADD ./nginx.conf  /etc/nginx/conf.d/default.conf
COPY --from=builder code/dist /usr/share/nginx/html
