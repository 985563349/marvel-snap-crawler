FROM node:18-alpine3.14
WORKDIR /app

RUN npm install pnpm --global

# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod

COPY . ./
RUN pnpm install -r --offline --prod

EXPOSE 3000
CMD [ "pnpm", "start" ]
