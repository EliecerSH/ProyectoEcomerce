FROM nginx:alpine

# Copia la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crea la carpeta de uploads (por si el volumen aún no existe)
RUN mkdir -p /usr/share/nginx/html/uploads

EXPOSE 80