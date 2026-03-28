# Step 1: Build the Vite React Frontend
FROM node:18-alpine as builder

WORKDIR /usr/src/app

# Copy dependency mappings
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the production optimized bundle
RUN npm run build

# Step 2: Serve via Nginx
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Replace default Nginx configuration to support SPA routing (React Router)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Expose web port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
