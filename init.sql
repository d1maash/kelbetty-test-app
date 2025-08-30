-- Создание базы данных и пользователя
CREATE DATABASE kelbetty;
CREATE USER kelbetty_user WITH ENCRYPTED PASSWORD 'kelbetty_password';
GRANT ALL PRIVILEGES ON DATABASE kelbetty TO kelbetty_user;
