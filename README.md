# Milkman Full Stack Project

Milkman is a full-stack subscription and ordering application with:

- Django + Django REST Framework backend (`milkman/backend`)
- React + Vite admin frontend (`milkman/frontend/admin_site`)
- React + Vite user frontend (`milkman/frontend/user_site`)

The backend exposes APIs for users, products, categories, subscriptions, subscribers, orders, and order items, using custom stateless JWT authentication.

## Tech Stack

### Backend

- Python 3.11+
- Django 5.2.11
- Django REST Framework 3.16.1
- django-cors-headers 4.7.0
- Pillow 11.3.0
- SQLite (default: `milkman/backend/db.sqlite3`)

### Frontend

- React 18
- Vite 5
- TailwindCSS (both frontends)
- Bootstrap (admin site)

## Repository Structure

```text
milkman/
  backend/
    config/           # Django settings, root urls, WSGI/ASGI
    user/             # app user model, JWT auth/login/logout
    category/         # category CRUD
    product/          # product CRUD + image upload
    subscription/     # subscription plan CRUD
    subscribers/      # user subscription ownership + subscription checkout
    order/            # order checkout/list/update/delete
    order_item/       # individual order-item endpoints
  frontend/
    admin_site/       # admin React app
    user_site/        # customer React app
requirements.txt      # Python dependencies
```

## Quick Start

### 1. Backend Setup (Windows PowerShell)

```powershell
Set-Location D:\FullStackProject
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Set-Location .\milkman\backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Backend base URL: `http://localhost:8000`

### 2. Backend Setup (macOS/Linux)

```bash
cd /path/to/FullStackProject
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd milkman/backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 3. Run Frontend Apps

Admin site:

```powershell
Set-Location D:\FullStackProject\milkman\frontend\admin_site
npm install
npm run dev
```

User site:

```powershell
Set-Location D:\FullStackProject\milkman\frontend\user_site
npm install
npm run dev
```

## Authentication Model

- Login endpoint: `POST /user/login/`
- Returns JWT + mapped app `user_id`
- Token is sent as: `Authorization: Bearer <token>`
- DRF default auth class: `user.auth.JWTAuthentication`
- Logout endpoint blacklists JWT `jti`: `POST /user/logout/`
- Access token expiry: 60 minutes (from login implementation)

Notes:

- Login accepts either `email` or `username`.
- If a Django staff/superuser logs in successfully, the backend maps that account to an app-level `user.User` record.

## API Routing Overview

Root routes from `config/urls.py`:

- `/user/`
- `/category/`
- `/product/`
- `/subscription/`
- `/subscribers/`
- `/order/`
- `/order_item/`

## Endpoint Reference

### User

- `GET /user/` list app users
- `POST /user/` create app user
- `GET /user/<id>/` retrieve user
- `PUT /user/<id>/` update user
- `DELETE /user/<id>/` delete user
- `GET /user/admin-users/` list Django auth users
- `POST /user/login/` login and receive JWT
- `POST /user/logout/` revoke JWT (requires bearer token)

### Category

- `GET /category/`
- `POST /category/`
- `PUT /category/<id>/`
- `DELETE /category/<id>/`

### Product

- `GET /product/`
- `POST /product/` (supports multipart for image upload)
- `PUT /product/<id>/`
- `DELETE /product/<id>/`

### Subscription

- `GET /subscription/`
- `POST /subscription/`
- `GET /subscription/<id>/`
- `PUT /subscription/<id>/`
- `DELETE /subscription/<id>/`

### Subscribers (Authenticated)

- `GET /subscribers/` list own subscribers (admin/staff-mapped users can view all)
- `POST /subscribers/` create subscriber for current user
- `GET /subscribers/<id>/`
- `PUT /subscribers/<id>/`
- `DELETE /subscribers/<id>/`
- `POST /subscribers/checkout/` mark one or more subscriber plans as paid and create order records

### Orders (Authenticated)

- `GET /order/` list orders
- `POST /order/` create order using checkout payload
- `GET /order/<id>/` retrieve order
- `PUT /order/<id>/` partial update order
- `DELETE /order/<id>/` delete order
- `PUT /order/update/<id>/` update order (alternate route)
- `DELETE /order/delete/<id>/` delete order (alternate route)

### Order Items

- `GET /order_item/`
- `POST /order_item/`
- `GET /order_item/<id>/`
- `PUT /order_item/<id>/`
- `DELETE /order_item/<id>/`

## Example Payloads

Create user:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123",
  "age": 27,
  "gender": "female",
  "phone": "9876543210",
  "address": "Pune"
}
```

Login:

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Order checkout (`POST /order/`):

```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 4, "quantity": 1 }
  ],
  "payment_method": "dummy_payment"
}
```

Subscriber checkout (`POST /subscribers/checkout/`):

```json
{
  "subscriber_ids": [3, 4],
  "payment_method": "dummy_payment",
  "payment_reference": "SUB-20260310-001"
}
```

## Detailed Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor C as Client (Web/Mobile)
    participant R as Django URL Router
    participant UV as user.views (Login/Logout/User)
    participant JA as JWTAuthentication
    participant SV as subscribers.views
    participant OV as order.views
    participant OCS as OrderCheckoutSerializer
    participant DB as SQLite DB

    Note over C,DB: 1) Signup and Login
    C->>R: POST /user/ (register app user)
    R->>UV: UserView.post(request)
    UV->>DB: INSERT user.User
    DB-->>UV: created user
    UV-->>C: 201 Created + user payload

    C->>R: POST /user/login/ (email/username + password)
    R->>UV: LoginView.post(request)
    UV->>DB: SELECT app user by email/username
    alt App user credentials valid
        UV-->>UV: generate_jwt(user_id, exp=60m, jti)
        UV-->>C: 200 OK + {token, user_id}
    else App user invalid, check Django admin/staff
        UV->>DB: SELECT auth user (is_staff/is_superuser)
        alt Admin/staff valid
            UV->>DB: UPSERT mapped app user.User
            UV-->>UV: generate_jwt(mapped_user)
            UV-->>C: 200 OK + {token, user_id}
        else Invalid credentials
            UV-->>C: 401 Unauthorized
        end
    end

    Note over C,DB: 2) Authenticated product/order flow
    C->>R: GET /product/ + Bearer token
    R->>JA: authenticate(request)
    JA->>DB: Validate token payload + user lookup + blacklist check
    alt token valid and not blacklisted
        JA-->>R: request.user + request.auth
        R-->>C: 200 OK + products list
    else token missing/invalid/revoked
        JA-->>C: 401 Authentication Failed
    end

    C->>R: POST /order/ + Bearer token + items[]
    R->>JA: authenticate(request)
    JA->>DB: user + jti verification
    JA-->>R: authenticated user
    R->>OV: OrderListCreateAPIView.post()
    OV->>OCS: validate(items, product_ids)
    OCS->>DB: SELECT products by ids
    alt all product ids valid
        OCS-->>OCS: merge duplicate product rows
        OCS-->>OCS: compute total_amount
        OCS->>DB: INSERT order.Order (payment_status=success)
        loop each merged item
            OCS->>DB: INSERT order_item.OrderItem
        end
        OCS-->>OV: created order instance
        OV-->>C: 201 Created + order + line items
    else invalid product ids
        OCS-->>OV: validation error
        OV-->>C: 400 Bad Request
    end

    Note over C,DB: 3) Subscription enrollment and subscriber checkout
    C->>R: POST /subscribers/ + Bearer token + subscription id
    R->>JA: authenticate(request)
    JA->>DB: verify token/user
    JA-->>R: authenticated user
    R->>SV: SubscriberListCreateAPIView.post()
    SV->>DB: INSERT subscribers.Subscriber(user=request.user)
    SV-->>C: 201 Created + subscriber

    C->>R: POST /subscribers/checkout/ + subscriber_ids[]
    R->>JA: authenticate(request)
    JA->>DB: verify token/user
    JA-->>R: authenticated user
    R->>SV: SubscriberCheckoutAPIView.post()
    SV->>DB: SELECT subscriber rows (+ subscription/user)
    alt requested subscribers valid for actor
        loop each subscriber
            SV->>DB: check existing successful payment_orders
            alt not paid yet
                SV->>DB: INSERT order.Order linked to subscriber (completed/success)
            else already paid
                SV-->>SV: add subscriber id to skipped list
            end
        end
        SV-->>C: 201 Created + paid_count + skipped_subscriber_ids + order_ids
    else invalid subscriber ids
        SV-->>C: 400 Bad Request
    end

    Note over C,DB: 4) Logout and token revocation
    C->>R: POST /user/logout/ + Bearer token
    R->>JA: authenticate(request)
    JA->>DB: verify token and user
    JA-->>R: request.auth contains jti
    R->>UV: LogoutView.post()
    UV->>DB: INSERT user.BlacklistedToken(jti)
    UV-->>C: 200 OK Logged out

    C->>R: Any protected endpoint with same token
    R->>JA: authenticate(request)
    JA->>DB: lookup jti in BlacklistedToken
    JA-->>C: 401 Token has been revoked
```

## Development Notes

- Media files are served in debug mode via `settings.MEDIA_URL` and `settings.MEDIA_ROOT`.
- CORS is permissive in current development settings (`CORS_ALLOW_ALL_ORIGINS = True`).
- If models change:

```bash
python manage.py makemigrations
python manage.py migrate
```

## Troubleshooting

- `401 Invalid Authorization header`: ensure header format is exactly `Bearer <token>`.
- `Token has been revoked`: login again to obtain a fresh token.
- Product image URLs missing host: send requests with proper host and scheme so `image_url` is fully built.
- `python` not found: activate the virtual environment first.
