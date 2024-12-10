# **📖 API Documentation - Recycly**
Welcome to the Recycly API documentation! 

# **📋 Table of Contents**
1. Getting Started
1. Authentication
1. API Endpoints
    * Users 
    * WasteCollection
    * Rewards
    * Redeem
1. Error Handling
1. Changelog
1. Contributing


# 🚀 Getting Started
To use the API, ensure you have the following:

Base URL for all API requests:

*https://recycle-api-412072547738.asia-southeast2.run.app*

Base URL for model Machine Learning

*https://ml-prediction-api-412072547738.asia-southeast2.run.app/WasteCollection*


# **📌 API Endpoints**

### User

`POST /auth/register`

this endpoint handle user register

#### Request 

**Headers:**

- `Content-type`: `multipart/form-data`

**Body:**
- `email`
- `password`
- `fullname`
- `address`
- `ktp` : this is image file. Support formats includ JPEG and PNG.

#### Response

**Success Response (201 OK)**

```json
{
    "status": "success",
    "message": "Registrasi berhasil",
    "data": {
        "userId": ""
    }
}
```

`POST /auth/login`

this endpoint handle user login with jwt token

#### Request 

**Headers:**

- `Content-type`: `application/json`

**Body:**
- `email`
- `password`

#### Response

**Success Response (201 OK)**

```json
{
    "status": "success",
    "message": "Login berhasil",
    "data": {
        "token": 
        "user": {
            "id": "",
            "email": "testnew@gmail.com",
            "fullName": "Test User New",
            "isAdmin": false
        }
    }
}
```

`POST /auth/logout`

this endpoint handle user logout

#### Response

**Success Response (201 OK)**

```json
{
    "status": "success",
    "message": "Logout berhasil"
}
```


# **📜 Changelog**
Version	Date	Description
1.0.0	2024-11-27	Initial release of the Recycly API

# **🛠️ Contributing**
We welcome contributions to improve the API. Please refer to the CONTRIBUTING.md file for guidelines.
