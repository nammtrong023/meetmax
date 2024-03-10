FROM node:20-alpine3.17

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY .env ./

RUN npm install
RUN npx prisma generate
RUN npx prisma db push

COPY . .

ARG BACKEND_ENV=http://localhost:3000
ENV FRONTEND_URL=${BACKEND_ENV}

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
