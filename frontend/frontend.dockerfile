FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG FRONTEND_ENV=http://localhost:8080/api
ENV NEXT_PUBLIC_BASE_URL=${FRONTEND_ENV}

ARG SOCKET_ENV=http://localhost:8080/api
ENV NEXT_PUBLIC_WEB_SOCKET_URL=${SOCKET_ENV}

RUN npm run build

FROM base AS runner
WORKDIR /app

COPY --from=builder /app/public ./public

RUN mkdir .next

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV HOSTNAME "0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]