FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY prisma ./prisma
RUN npm install
RUN npm install @prisma/client
RUN npx prisma generate

COPY . .

CMD npm run dev

