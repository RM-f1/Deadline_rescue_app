FROM node:20-alpine
WORKDIR /app
# Copy dependency files first for better layer caching
COPY package*.json ./
RUN npm install
# Copy source files
COPY . .
# Build the Vite app
RUN npm run build
# Install serve to host the static build
RUN npm install -g serve
# Cloud Run expects port 8080
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
