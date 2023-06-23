###########
# BUILDER #
###########

# pull official base image
FROM python:3.9.7-alpine as builder

# set work directory
WORKDIR /usr/src/sensornet

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apk update \
    && apk add --virtual build-deps gcc python3-dev musl-dev \
    && apk add --no-cache mariadb-dev mariadb-connector-c-dev linux-headers


# install dependencies
COPY ./requirements.txt .

RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/sensornet/wheels -r requirements.txt


#########
# FINAL #
#########

# pull official base image
FROM python:3.9.7-alpine

# create directory for the app user
RUN mkdir -p /home/sensornet

# create the app user
RUN addgroup -S sensornet && adduser -S sensornet -G sensornet

# create the appropriate directories
ENV HOME=/home/sensornet
ENV APP_HOME=$HOME/web
RUN mkdir $APP_HOME
RUN mkdir $APP_HOME/staticfiles
WORKDIR $APP_HOME

# install dependencies

COPY --from=builder /usr/src/sensornet/wheels /wheels
COPY --from=builder /usr/src/sensornet/requirements.txt .
RUN pip install --no-cache /wheels/*

# copy project
COPY . $APP_HOME

# chown all the files to the app user
RUN chown -R sensornet:sensornet $APP_HOME

# change to the app user
USER sensornet