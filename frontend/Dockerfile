# 1) Build stage: pravi Vite production build
FROM node:20-alpine AS build
WORKDIR /app

# instaliraj samo što treba
COPY package*.json ./
RUN npm ci

# kopiraj izvorni kod
COPY . .

ENV VITE_API_URL=/api

# napravi production build
RUN npm run build

# 2) Serve stage: Nginx servira statiku i proksira /api ka backendu
FROM nginx:1.27-alpine
# naš nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# buildovana aplikacija
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]