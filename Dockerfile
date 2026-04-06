FROM nginx:alpine

ENV BASE_PATH=/

COPY docker-entrypoint.d/40-configure-base-path.sh /docker-entrypoint.d/40-configure-base-path.sh
RUN chmod +x /docker-entrypoint.d/40-configure-base-path.sh

COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
