FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY prisma ./prisma
RUN npm install
RUN npm install @prisma/client

COPY . .

RUN npx prisma generate

CMD npm run dev

