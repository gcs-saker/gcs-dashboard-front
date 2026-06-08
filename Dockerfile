# 1단계: Build
FROM node:22 AS builder
WORKDIR /app

COPY package*.json ./

RUN npm ci

# 앱 소스 투입 및 빌드
COPY . .
RUN npm run build

# 2단계: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
