FROM node:22
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npm install -g wait-on

COPY . .

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]

EXPOSE 4000