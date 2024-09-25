FROM rananoman/prometheus:env

ENV API_HOST_PRODUCTION='http://qaapi.projects4.me'

RUN mkdir temp

COPY . /prometheus/temp

RUN cd temp/ \
    && npm install \
    && ember build -prod

RUN cp /prometheus/temp/ci-cd/.htaccess /prometheus/temp/dist/ \
    && mv /prometheus/temp/dist /prometheus/ \
    && rm -rf /prometheus/temp/