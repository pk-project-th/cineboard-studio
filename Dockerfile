# Use Node 22 (supports built-in node:sqlite)
FROM node:22-bookworm-slim AS base
WORKDIR /app

# Install client dependencies and build React app
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

COPY server ./server

# Expose server port
ENV PORT=5000
ENV NODE_ENV=production
EXPOSE 5000

# Start unified server
CMD ["node", "server/index.js"]
