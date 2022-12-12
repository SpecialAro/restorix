# Install dependencies only when needed
FROM node:19-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@$(node --eval="process.stdout.write(require('./package.json').engines.pnpm)")
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:19-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm install -g pnpm@$(node --eval="process.stdout.write(require('./package.json').engines.pnpm)")
RUN pnpm build

# Production image, copy all the files and run next
FROM node:19-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/prisma ./prisma

RUN npm install -g pnpm@$(node --eval="process.stdout.write(require('./package.json').engines.pnpm)")

EXPOSE 3000

ENV PORT 3000

CMD ["pnpm", "docker:start"]