FROM nginx:1.21-alpine

RUN rm /etc/nginx/conf.d/default.conf

ADD nginx-selfsigned.crt /etc/nginx/ssl/nginx-selfsigned.crt
ADD nginx-selfsigned.key /etc/nginx/ssl/nginx-selfsigned.key
ADD self-signed.conf /etc/nginx/ssl/self-signed.conf

ADD dhparam.pem /etc/nginx/ssl/dhparam.pem
ADD ssl-params.conf /etc/nginx/ssl/ssl-params.conf

ADD uwsgi_params /etc/nginx/
ADD sensornet.conf /etc/nginx/conf.d/default.conf