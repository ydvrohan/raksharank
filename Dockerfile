# ─────────────────────────────────────────────────────────────────────────
# RakshaRank — Dockerfile for Google Cloud Run
#
# Stage 1 builds the Vite frontend into static files (dist/).
# Stage 2 is a small production image that only contains what's needed to
# run the Express server: server.js, the framework-agnostic src/lib
# modules it imports, the built dist/ folder, and production dependencies.
# ─────────────────────────────────────────────────────────────────────────

# ---------- Stage 1: build the frontend ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: production runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Only what server.js actually needs at runtime — the rest of the React
# source is already compiled into dist/ and isn't shipped.
COPY server.js ./server.js
COPY src/lib ./src/lib
COPY --from=build /app/dist ./dist

# Cloud Run sets PORT itself and expects the container to listen on it;
# 8080 here is just the local-default fallback used by server.js.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
