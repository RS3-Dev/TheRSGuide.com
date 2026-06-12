FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY next.config.mjs source.config.ts tsconfig.json vite-env.d.ts ./

RUN npm ci

COPY src ./src
COPY content ./content
COPY public ./public
COPY postcss.config.mjs ./

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=base /app/.next ./.next
COPY --from=base /app/content ./content
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.mjs ./
COPY --from=base /app/source.config.ts ./

EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]
