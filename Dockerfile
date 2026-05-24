FROM oven/bun:1 AS build

WORKDIR /app

# Copy package files
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install dependencies
RUN bun install --no-progress

# Copy source code
COPY apps/api apps/api
COPY apps/web apps/web
COPY packages/shared packages/shared
COPY .env .env

# Build shared package
WORKDIR /app/packages/shared
RUN bun run build || true

# Build web frontend
WORKDIR /app/apps/web
RUN bun run build

# ──────────────────────────────────────────────
# Runtime stage
FROM oven/bun:1-slim AS runtime

WORKDIR /app

# Copy built artifacts
COPY --from=build /app/apps/web/dist /app/apps/web/dist
COPY --from=build /app/apps/api /app/apps/api
COPY --from=build /app/packages/shared /app/packages/shared
COPY --from=build /app/bun.lock /app/
COPY --from=build /app/package.json /app/
COPY --from=build /app/.env /app/.env
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/node_modules /app/apps/api/node_modules
COPY --from=build /app/apps/web/node_modules /app/apps/web/node_modules
COPY --from=build /app/packages/shared/node_modules /app/packages/shared/node_modules

# Ensure uploads directory exists
RUN mkdir -p /app/apps/api/uploads

EXPOSE 3001

WORKDIR /app/apps/api
CMD ["bun", "run", "src/index.ts"]
