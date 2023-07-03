FROM node:18-alpine3.14
WORKDIR /app

ENV TZ=Asia/Shanghai

RUN apk add --no-cache tzdata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm install pnpm --global

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod

COPY . ./
RUN pnpm install -r --offline --prod

EXPOSE 3000
CMD [ "pnpm", "start" ]
