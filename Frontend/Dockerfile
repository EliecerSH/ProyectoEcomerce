# ==========================================
# ETAPA 1: Construcción (Builder)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# ==========================================
# ETAPA 2: Servidor de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiar los archivos compilados desde la Etapa 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Arrancar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
