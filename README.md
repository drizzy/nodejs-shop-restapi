# NodeShop

![Node](https://img.shields.io/badge/nodejs-v18.14.2-026e00)
![npm](https://img.shields.io/badge/npm-9.6.4-red)
![Psql](https://img.shields.io/badge/psql-15.4-699eca)

## ENDPOINTS

- [Auth](#authentication)
- [Password](#reset-password)
- [Users](#users)
- [Address](#address)
- [Categories](#categories)
- [Brands](#brands)
- [Products](#products)
- [Cart](#cart)
- [Orders](#orders)
- [Payments](#payments)
- [Paypal](#paypal)
- [Stripe](#stripe)

## Get Started

```bash
git clone https://github.com/drizzy/nodejs-shop-restapi.git
```

`OR`

```bash
git clone git@github.com:drizzy/nodejs-shop-restapi.git
```

Firstly, you have to install npm packages.
```bash
npm install
```

Import the file from the db/nodeshop.sql directory into `postgres`, or create an empty `psql` database and pass the contents of the db manually.

Create **.env** file by copying *.env.example* file in **root directory**.

Modify **.env** file.

## Scripts 

Mode(development)
```bash 
npm run dev
```

Compile code
```bash 
npm run build 
```

Mode(production), compile first
```bash
npm run start
```

Tests
```bash
npm run test
```

## URL

Local
```bash
http://localhost:3000/api/v1/products
```

`OR`

```bash
http://127.0.0.1:3000/api/v1/products
```

Configured domain
```bash
https://mydomain.com/api/version/products
```

Headers

```bash
x-token
```

## Authentication

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /auth/register | `POST` | No | {"name": "NodeShop", "lastname": "", "username": "nodeshop", "email": "admin@drizzy.dev", "phone": "121-312-5147","password": "nodetest"} | Registration for new users, the first user is assigned the `SUPER_ADMIN` and `ADMIN` role. |
| /auth/login | `POST` | No | {"username": "nodeshop", "password": "nodetest"} | Login, Returns an access token. |
| /auth/activate-account | `POST` | Yes | {"pin": "123456"} | Activate account, a message will be sent to the email with the activation code at the time of registration. |

## Reset password

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /change-passwd/check | `POST` | No | {"email": "test@drizzy.dev"} | Check if the email exists, if it exists, an email with a token will be sent to you. |
| /change-passwd/reset?token=your-token | `PUT` | No | {"password": "newPassword", "repetPassword": "newPassword"} | Change password. |

## USERS

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /users | `POST` | Yes | {"name": "Harry", "lastname": "Drizzy", "username": "drizzy", "email": "drizzy@drizzy.dev", "phone": "1809-1220-1219", "password": "nodetest", "role": ["SUPPORT", "USER"] } | Create a new user, this action is only allowed for the `SUPER_ADMIN` and `ADMIN` roles. |
| /users | `GET` | Yes | | Get the list of users. this action is only allowed for the `SUPER_ADMIN` and `ADMIN` roles. |
| /users/{id} | `GET` | Yes | | Get details of a user. |
| /users/{id} | `PUT` | Yes | {"name": "Harry", "lastname": "New", "username": "newUsername", "email": "newEmail@drizzy.dev", "phone": "1809-1220-1212", "password": "newPassword", "role": ["SELLER", "USER"] } | Update an user. |
| /users/{id} | `DELETE` | Yes | | Delete an user. |

## ADDRESS

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /address | `POST` | Yes | {"fullname": "John Doe", "country": "United States", "address": "8260 NW 14TH ST", "city": "Miami", "state": "Florida", "postal_code": "33191"} | Add an address. |
| /address | `GET` | Yes | | Get details of all addresses. |
| /address/{id} | `GET` | Yes | | Get details of an address. |
| /address/{id} | `PUT` | Yes | {"fullname": "newFullName", "country": "newCountry", "address": "newAddress", "city": "newCity", "state": "newState", "postal_code": "newPostal"} | Update an address. |
| /address/{id} | `DELETE` | Yes | | Delete an address. |

## CATEGORIES

| Route | HTTP Verb | Token Needed  | Request Body | Description |
| --- | --- | --- | --- | --- |
| /categories | `POST` | Yes | {"name": "Electronics"} | Create a new category. |
| /categories | `GET` | No | | Get all categories. |
| /categories/{id} | `GET` | No | | Get a single categorie. |
| /categories/{id} | `PUT` | Yes | {"name": "newName"} | Update categorie. |
| /categories/{id} | `DELETE` | Yes | | Remove categorie. |

## BRANDS

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /brands | `POST` | Yes | {"name": "TEAMGROUP"} | Create a new brand. |
| /brands | `GET` | No | | Get all brands. |
| /brands/{id} | `GET` | No | | Get a single brand. |
| /brands/{id} | `PUT` | Yes | {"name": "newName"} | Update brand. |
| /brands/{id} | `DELETE` | Yes | | Remove brand. |

## PRODUCTS

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /products | `POST` | Yes | Send as form-data: `name, description, stock, price, category[], brand_id, image` | Add a new product. |
| /products | `GET` | No | | Get all products |
| /products/{id} | `GET` | No | | Get a product by its ID |
| /products/slug/{id} | `GET` | No | | Get a product by its slug and ID |
| /products/{id} | `PUT` | Yes | Send as form-data: `name, description, stock, price, category[], brand_id, image` | Update product |
| /products/{id} | `DELETE` | Yes | | Remove product |

## CART

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /cart | `POST` | Yes | {"product_id": 1, "quantity": 2} | Add a product to cart. |
| /cart | `GET` | Yes | | Get all products from cart. |
| /cart/{product_id} | `DELETE` | Yes | | Remove a product from the cart. |


## ORDERS

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /orders | `POST` | Yes | {"address_id": 1, "products": [{ "id": 1, "quantity": 2}] } | Place an order. |
| /orders | `GET` | Yes | | Get all orders. |
| /orders/{id} | `DELETE` | Yes | | Remove order. |

## ORDERS PRODUCTS

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /orders-products | `GET` | Yes | | Order and product history. This action is only allowed for the `SUPER_ADMIN` and `ADMIN` roles. |
| /orders-products/{id} | `GET` | Yes | | History of a single order and product. This action is only allowed for the `SUPER_ADMIN` and `ADMIN` roles. |

## PAYMENTS

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /payments | `GET` | Yes | | Get all payments received.This action is only allowed for the `SUPER_ADMIN` and `ADMIN` roles. |
| /payments/{id} | `GET` | Yes | | Get a single payments received. This action is only allowed for the `SUPER_ADMIN` and `ADMIN` roles. |


## PAYPAL

| Route | HTTP Verb | Token Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /pay/paypal/create | `POST` | Yes | {"orderID": 1, "value": 66.99, "description": "Product name"} | Create a payment through PayPal. |
| /pay/paypal/success | `POST` | Yes | {"orderID": "", "addressID": 1, "productID": 1} | Confirmation of successful payment via PayPal. |

## STRIPE

| Route | HTTP Verb | Tooken Needed | Request Body | Description |
| --- | --- | --- | --- | --- |
| /pay/stripe/checkout | `POST` | Yes | { "id": "", "amount": 66.99, "description": "Product name", "addressID": 1, "productID": 1} | Make a payment through Stripe. |


## Response format

All responses are returned in JSON format.

## Author

- [Drizzy](https://drizzy.dev)

## License

This project is licensed under the terms of the MIT license. Please refer to [LICENSE](LICENSE) for the full terms.

