FROM node:20-alpine

WORKDIR /app

RUN corepack enable

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all packages (filtered by .dockerignore)
COPY shared/ ./shared/
COPY backend/ ./backend/

# Install dependencies for the entire workspace
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd backend && pnpm prisma generate

# Build shared package
RUN cd shared && pnpm run build

WORKDIR /app/backend

CMD ["pnpm", "run", "start:dev"]
