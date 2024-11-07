# syntax=docker/dockerfile:1

ARG NODE_VERSION=19.5.0

FROM node:${NODE_VERSION}-alpine

# Рабочая директория
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем файлы приложения
COPY . .

# Компилируем приложение
# RUN npm run build

# Экспонируем порт
EXPOSE 4000

# Запускаем приложение
CMD ["npm", "run", "start:dev"]