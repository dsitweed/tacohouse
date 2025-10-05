FROM node:20-alpine AS builder

WORKDIR /backend

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy prisma schema first
COPY prisma ./prisma/

# Generate Prisma client
RUN pnpm prisma generate

COPY . .

CMD ["pnpm", "run", "start"]
