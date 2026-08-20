# FJORD — Nordic Living

Интернет-магазин (демо) на React + Vite. Каталог, корзина, оформление, аккаунт, RU/EN.

## Аккаунт

1. Откройте **Аккаунт** в шапке.
2. Вкладка **Создать аккаунт** открыта сразу.
3. Имя, почта, пароль: **минимум 8 символов, буква и цифра**.
4. Повторите пароль → **Создать аккаунт**.

Пароль не хранится открытым текстом: PBKDF2-SHA256, 120 000 итераций, своя соль. В сессии хеша нет. Номер карты не записывается. Аккаунт живёт в этом браузере (без сервера).

## Локально

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Папка `dist/` — готовый сайт.

## Netlify

Сайт уже настроен (`netlify.toml` + `public/_redirects`). SPA-маршруты не дадут 404.

### Способ A — GitHub

1. Создайте репозиторий на GitHub.
2. В папке проекта:

```bash
git init
git add .
git commit -m "FJORD shop"
git branch -M main
git remote add origin https://github.com/YOU/fjord.git
git push -u origin main
```

3. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
4. Build command: `npm run build`  
   Publish directory: `dist`

### Способ B — перетащить папку

```bash
npm run build
```

Откройте [app.netlify.com/drop](https://app.netlify.com/drop) и перетащите папку `dist`.

## Промокоды

`WELCOME10` · `FJORD20` (от €200) · `FREESHIP` · `NORDIC15` · `LINEN25`

Тестовая карта: `4242 4242 4242 4242` — списаний нет.
