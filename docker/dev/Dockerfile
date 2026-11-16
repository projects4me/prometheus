# Projects4Me Prometheus: dev deployment image.
# Stage 1 builds the app on Node 22; stage 2 serves dist/ with Apache on port 4000.
FROM node:22-bookworm AS build

ENV API_HOST_PRODUCTION='https://devapi.projects4.me'
ENV HERMES_URL_PRODUCTION='https://hermes.projects4.me'

WORKDIR /prometheus

COPY package.json /prometheus/
RUN npm install --no-audit --no-fund

COPY . /prometheus
RUN npx ember build -prod \
    && cp ci-cd/.htaccess dist/

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends apache2 \
    && rm -rf /var/lib/apt/lists/*

COPY docker/apache/prometheus.conf /etc/apache2/sites-available/prometheus.conf
RUN a2dissite 000-default \
    && a2ensite prometheus.conf \
    && a2enmod rewrite headers

COPY --from=build /prometheus/dist /prometheus/dist

EXPOSE 4000

CMD ["apache2ctl", "-D", "FOREGROUND"]
