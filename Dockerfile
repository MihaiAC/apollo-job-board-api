FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

RUN npm install -g wait-on

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "wait-on tcp:$POSTGRES_HOST:$POSTGRES_PORT && npx tsx watch src/index.ts"]
