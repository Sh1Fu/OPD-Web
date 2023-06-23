FROM nginx:1.21-alpine

RUN rm /etc/nginx/conf.d/default.conf
ADD uwsgi_params /etc/nginx/
ADD sensornet.conf /etc/nginx/conf.d/default.conf