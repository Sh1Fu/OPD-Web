# OPD-Web

##  Установка зависимостей и прочее
### Python

Создаём виртуальное окружение любым удобным образом.
```bash
source venv/bin/active
pip install -r requrements.txt
```

### MySQL

```bash
sudo apt install mysql-server, mysql-client
```
Создаём двух пользователей: django и sensor_net. Первый со своей БД для всех приколов джанги,
второй - имитация БД заказчика:

```bash
sudo mysql
mysql> CREATE USER 'django_user'@'localhost' IDENTIFIED BY 'django_user';
mysql> CREATE USER 'sensor_net'@'localhost' IDENTIFIED BY 'sensor_net';
mysql> CREATE DATABASE django;
mysql> CREATE DATABASE sensor_db;
mysql> GRANT ALL PRIVILEGES ON django.* TO 'django_user'@'localhost' WITH GRANT OPTION;
mysql> GRANT ALL PRIVILEGES ON sensor_db.* TO 'sensor_net'@'localhost' WITH GRANT OPTION;
mysql> FLUSH PRIVILEGES;
mysql> quit
sudo mysql -u sensor_net -p sensor_db < Sensor_DB_20230306.sql
<sensor_net>
```
### Django

```bash
python manage.py makemigrations
python manage.py migrate
```
На этом в принципе всё, можно запускать debug server. Однако я советую создать админа,
чтобы понимать какие данные расположены в таблице:
```bash
python manage.py createsuperuser
```
Большинство полей, кроме логина и пароля соответственно можно оставить пустыми.
Запуск сервера:
```bash
python manage.py runserver
```

## Принцип работы
### Админ панель

Переходим по адресу http://127.0.0.1:8000/admin и вводим данные, указанные в п.1.3.
Нас интересуют только вкладка Sensors. Открываем её и видим записи в БД

### Что такое джанго и почему такая странная структура проекта?

Любая реализация на джанге состоит из непосредственно проекта, в нашем случае SensorNet,
и приложений. В нашем случае приложение всего одно, однако обычно их больше. Поэтому в
папке SensorNet файлы для настройки всего проекта в целом, а в папке Sensors уже непосредственно
реализации. 

### Как это работает?

**Модели в джанге** - способ представления записей в таблице. Каждая таблица - новая модель. В
нашем случае модель всего одна.
Чтобы сконнектиться с БД заказчика и не засрать её таблицами джанги пришлось подключать две БД.
С помощью файла ``Sensors/dbrouters.py`` я настроил это всё так, чтобы данные для моделей брались из БД
заказчика, а всё остальное было в нашей БД. 
Большой прикол представляет из себя файлы ``SensorNet/urls.py`` и ``Sensors/urls.py``.
Первый файл нужен для направления входящих url запросов:
```python
urlpatterns = [
path('admin/', admin.site.urls),
path('sensors/', include('Sensors.urls')),
]
```

> Рассмотрим на примере. Когда на наш сайт падает url запрос джанго смотрит что следует за первым слешем.
В случае admin/ он пересылает нас на страницу админки, в случае sensors он обрезает всё что было до sensors
и перенаправляет нас на файл ``Sensors/urls.py``. В случае, когда ничего не совпало он генерит ошибку.
```pytohn
urlpatterns = [
path('', views.index, name='index'),
]
```
В ``Sensors/urls.py``  мы переправляем только запросы в которых больше ничего не содержится на вьюху. Что такое **views** 
будет сказано позже. В случае, когда в запросе будет ещё что-то он не будет никуда перенаправляться и будет вызывать
ошибку. Со всеми этими строками работают регулярки, поэтому после того как поймём структуру и содержание всего проекта
настроим их красиво.

**Вьюхи.** В принципе, говорить о них нечего. Это код, который запуститься непосредственно перед показом странице пользователю.
Именно во вьюхах обрабатывается информация. После обработки вся необходимая инфа отправляется в функцию render, которая
генерирует html файл из шаблона. Таким образом в моём примере во вьюхе мы получили первые 15 записей в бд и отправили их
в html файл, в котором и поразвлекались с ним.

**Шаблоны и статик файлы.** В принципе я в них совсем не шарю, поэтому киданул самый простой пример их использования.
Большая часть работы с ними ляжет на фронтэндеров. Плюсом вам ещё бутстрап подключать. Насчёт структуры папок ``templates`` и
``static``. Дополнительная директория Sensors расположена так специально, потому что перед тем как лить это всё на прод
джанго делает collectstatic и всё это попадает в одну общую папку. Так вот, чтобы не было конфликта имён необходимо
обязательно создавать поддиректорию. Правда если быть честным, то конфликт произойдёт только, если будет несколько 
приложений, а у нас оно одно, однако мы не говнари, поэтому код у нас будет хороший и расширяемый(вдруг заказчику очень понравится).

**Докеры.**

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Далее нужно установить зависимости докера. Не смог найти их.
Они гуглятся по первой ошибке. Сорян за такоу(

Перед запуском докера необходимо сгенерировать ключи с помощью openSSL. Делать это нужно из папки проекта:
```
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/nginx-selfsigned.key -out nginx/nginx-selfsigned.crt
sudo openssl dhparam -out nginx/dhparam.pem 4096
```
Запуск:

```
sudo docker-compose build
sudo docker-compose up -d
```
Далее, после всех запусков необходимо узнать айдишники контейнеров:
```
sudo docker ps
```

Скопировать на контейнер db_sensors дамп базы:
```
docker cp Sensor_DB_20230306.sql sensornet_db_1:/etc/
```

Подключится к этому контейнеру и записать данные в базу:
```
docker exec -ti <sensornet_db_id> /bin/bash
sensornet_db> cd /etc
sensornet_db> mysql -u sensor_net -p sensor_db < Sensor_DB_20230306.sql
sensor_net      
sensornet_db> exit
```

После подключаемся к контейнеру джанги, выполняем миграции и собираем статику для nginx:
```
docker exec -ti <web_id> /bin/bash
web> python manage.py makemigrations
web> python manage.py migrate
web> python manage.py collectstatic
web> exit
```

После этого у нас есть рабочий сайт на ``https://localhost``. При его открытии выйдет уведомление мол
неизвестные ключи SSL тоси боси. Просто принимаете это и всё. Такое происходит из-за того что ключи
наши самописные. В любом случае лучше так, чем вообще без SSL.

TODO:
1. entrypoints.sh для колект статика и миграций


