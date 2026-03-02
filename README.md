# Milkman Backend (Django + DRF)

A Django REST API for managing users, categories, products, subscriptions, and subscribers with stateless JWT authentication.

## Features

- Email-based login that returns a JWT
- Logout via token blacklist (revocation)
- Subscriber endpoints scoped to the authenticated user
- CRUD endpoints for Category, Product, Subscription

## Prerequisites

- Python 3.11+
- pip
- Windows PowerShell or a Unix-like shell

## Quick Start (Windows)

```powershell
cd milkman/backend
python -m venv .venv
.\\.venv\\Scripts\\activate
pip install Django==5.2.11 djangorestframework==3.16.1
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Open http://localhost:8000/ in your browser.

## Quick Start (macOS/Linux)

```bash
cd milkman/backend
python3 -m venv .venv
source .venv/bin/activate
pip install Django==5.2.11 djangorestframework==3.16.1
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

## Project Layout

- milkman/backend/config: Django project configuration (settings, urls, wsgi/asgi)
- milkman/backend/user: Custom User model, JWT utils, auth, views, urls
- milkman/backend/category: Category models, serializers, views, urls
- milkman/backend/product: Product models, serializers, views, urls
- milkman/backend/subscription: Subscription models, serializers, views, urls
- milkman/backend/subscribers: Subscriber models, serializers, views, urls

## Authentication

- Login uses email/password and returns a JWT (HS256)
- Include the token in requests using header: `Authorization: Bearer <token>`
- Logout adds the token’s `jti` to a blacklist

## API Endpoints

- User
  - POST /user/ — create user
  - POST /user/login/ — login with email/password, returns JWT
  - POST /user/logout/ — logout (Bearer token required)
  - GET /user/admin-users/ — list Django admin/staff users (for diagnostics)
- Category
  - GET/POST /category/
  - GET/PUT/DELETE /category/<id>/
- Product
  - GET/POST /product/
  - GET/PUT/DELETE /product/<id>/
- Subscription
  - GET/POST /subscription/
  - GET/PUT/DELETE /subscription/<id>/
- Subscribers (requires Authorization: Bearer <token>)
  - GET/POST /subscribers/
  - GET/DELETE /subscribers/<id>/

## Example Requests (curl)

Create a user:
```bash
curl -X POST "http://localhost:8000/user/" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123","age":30,"gender":"female","phone":"1234567890","address":"123 Street"}'
```

Login:
```bash
curl -X POST "http://localhost:8000/user/login/" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
# Response: {"token":"<jwt>", "user_id":1}
```

Create a subscription:
```bash
curl -X POST "http://localhost:8000/subscription/" \
  -H "Content-Type: application/json" \
  -d '{"title":"Basic Plan","desc":"Milk subscription","quantity":10,"duration":30,"price":100}'
```

Create a subscriber (attach token from login):
```bash
TOKEN="<jwt>"
SUB_ID="<subscription_id>"
curl -X POST "http://localhost:8000/subscribers/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{\"subscription\": ${SUB_ID}}"
```

List subscribers:
```bash
curl -X GET "http://localhost:8000/subscribers/" \
  -H "Authorization: Bearer ${TOKEN}"
```

Logout:
```bash
curl -X POST "http://localhost:8000/user/logout/" \
  -H "Authorization: Bearer ${TOKEN}"
```

## Development Notes

- Settings module: `config.settings`
- If models change, generate migrations and apply:
  - `python manage.py makemigrations`
  - `python manage.py migrate`
- Default token expiry is 60 minutes

## License

BSD-3-Clause (Django and DRF are BSD-licensed)
