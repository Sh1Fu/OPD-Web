###########
# BUILDER #
###########

# pull official base image
FROM python:3.8.10-alpine as builder

# set work directory
WORKDIR /usr/src/sensornet

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


# install dependencies
COPY ./requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt


#########
# FINAL #
#########

# pull official base image
FROM python:3.8.10-alpine

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
RUN apk update && apk add libpq
COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/*

# copy project
COPY . $APP_HOME

# chown all the files to the app user
RUN chown -R app:app $APP_HOME

# change to the app user
USER app