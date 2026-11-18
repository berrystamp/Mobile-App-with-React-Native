# Berrystamp Backend API Reference (`https://berrystamp-backend-production.up.railway.app/api/v1`)

- **Base API URL**: `https://berrystamp-backend-production.up.railway.app/api/v1`
- **OpenAPI v3 Spec**: `https://berrystamp-backend-production.up.railway.app/v3/api-docs`
- **Default Headers**:
  - `Content-Type: application/json` (or `multipart/form-data` for file upload endpoints)
  - `Authorization: Bearer <jwt_token>` (required on all authenticated endpoints; omitted on `/api/v1/auth/**` and `/api/v1/public/**`)
  - `profileType: CUSTOMER | DESIGNER | PRINTER` (passed on role-scoped endpoints as documented per route below)

**Total Endpoints**: 191  
**Total Component Schemas**: 129

## Table of Contents
- [user-controller (10 endpoints)](#user-controller)
- [profile-controller (2 endpoints)](#profile-controller)
- [order-request-controller (6 endpoints)](#order-request-controller)
- [design-controller (16 endpoints)](#design-controller)
- [collection-controller (6 endpoints)](#collection-controller)
- [admin-controller (7 endpoints)](#admin-controller)
- [admin-ticket-controller (5 endpoints)](#admin-ticket-controller)
- [admin-subscriber-controller (3 endpoints)](#admin-subscriber-controller)
- [admin-logistic-controller (3 endpoints)](#admin-logistic-controller)
- [admin-blog-controller (6 endpoints)](#admin-blog-controller)
- [web-hook-controller (1 endpoints)](#web-hook-controller)
- [wallet-controller (3 endpoints)](#wallet-controller)
- [referral-controller (5 endpoints)](#referral-controller)
- [rating-controller (1 endpoints)](#rating-controller)
- [order-controller (10 endpoints)](#order-controller)
- [notification-controller (3 endpoints)](#notification-controller)
- [message-controller (3 endpoints)](#message-controller)
- [logistic-controller (1 endpoints)](#logistic-controller)
- [gallery-controller (4 endpoints)](#gallery-controller)
- [follow-controller (3 endpoints)](#follow-controller)
- [file-controller (6 endpoints)](#file-controller)
- [custom-design-controller (7 endpoints)](#custom-design-controller)
- [cart-controller (4 endpoints)](#cart-controller)
- [admin-email-controller (1 endpoints)](#admin-email-controller)
- [bank-controller (2 endpoints)](#bank-controller)
- [auth-controller (12 endpoints)](#auth-controller)
- [admin-auth-controller (4 endpoints)](#admin-auth-controller)
- [admin-account-controller (5 endpoints)](#admin-account-controller)
- [admin-dispute-controller (3 endpoints)](#admin-dispute-controller)
- [admin-design-controller (3 endpoints)](#admin-design-controller)
- [users-controller (2 endpoints)](#users-controller)
- [transaction-controller (2 endpoints)](#transaction-controller)
- [public-rating-controller (1 endpoints)](#public-rating-controller)
- [public-profile-controller (2 endpoints)](#public-profile-controller)
- [public-follow-controller (2 endpoints)](#public-follow-controller)
- [public-design-controller (3 endpoints)](#public-design-controller)
- [public-collection-controller (3 endpoints)](#public-collection-controller)
- [public-blog-controller (3 endpoints)](#public-blog-controller)
- [insight-controller (3 endpoints)](#insight-controller)
- [fee-controller (1 endpoints)](#fee-controller)
- [conversation-controller (6 endpoints)](#conversation-controller)
- [admin-wallet-controller (4 endpoints)](#admin-wallet-controller)
- [admin-transaction-controller (2 endpoints)](#admin-transaction-controller)
- [file-similarity-controller (4 endpoints)](#file-similarity-controller)
- [admin-order-controller (2 endpoints)](#admin-order-controller)
- [admin-insight-controller (6 endpoints)](#admin-insight-controller)
- [Component Schemas Reference](#component-schemas-reference)

---

## user-controller

### `GET /api/v1/user`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user`
- **Operation ID**: `getUser`
- **Summary**: Get User
- **Description**: Get User
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`User`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
    ```

---

### `PUT /api/v1/user`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user`
- **Operation ID**: `updateUser`
- **Summary**: Update User
- **Description**: Update User
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdateUserRequest`)
  ```json
{
  "phoneNumber": "string",
  "areaCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "profilePicture": "string",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "name (required)": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "postalCode": "string",
  "longitude": "number (double)",
  "latitude": "number (double)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`User`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
    ```

---

### `GET /api/v1/user/payment-detail`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/payment-detail`
- **Operation ID**: `getPaymentDetails`
- **Summary**: Get Payment Detail
- **Description**: Get Payment Detail
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PaymentDetail`)
    ```json
{
  "bankName": "string",
  "bankCode": "string",
  "accountName": "string",
  "accountNumber": "string"
}
    ```

---

### `PUT /api/v1/user/payment-detail`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/payment-detail`
- **Operation ID**: `updatePaymentDetail`
- **Summary**: Update payment details
- **Description**: Update payment details
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`PaymentDetailDto`)
  ```json
{
  "bankName (required)": "string",
  "bankCode (required)": "string",
  "accountName": "string",
  "accountNumber (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PaymentDetail`)
    ```json
{
  "bankName": "string",
  "bankCode": "string",
  "accountName": "string",
  "accountNumber": "string"
}
    ```

---

### `GET /api/v1/user/mail-setting`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/mail-setting`
- **Operation ID**: `getMailSetting`
- **Summary**: Get mail setting
- **Description**: Get mail setting
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`MailSetting`)
    ```json
{
  "supportEmail": "boolean",
  "orderEmail": "boolean",
  "newsEmail": "boolean",
  "otherEmail": "boolean",
  "promotionEmail": "boolean"
}
    ```

---

### `PUT /api/v1/user/mail-setting`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/mail-setting`
- **Operation ID**: `updateMailSetting`
- **Summary**: Update mail setting
- **Description**: Update mail setting
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdateMailSettingRequest`)
  ```json
{
  "supportEmail": "boolean",
  "orderEmail": "boolean",
  "newsEmail": "boolean",
  "otherEmail": "boolean",
  "promotionEmail": "boolean"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`MailSetting`)
    ```json
{
  "supportEmail": "boolean",
  "orderEmail": "boolean",
  "newsEmail": "boolean",
  "otherEmail": "boolean",
  "promotionEmail": "boolean"
}
    ```

---

### `PUT /api/v1/user/design-interest`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/design-interest`
- **Operation ID**: `updateDesignInterest`
- **Summary**: Update Design interest
- **Description**: Update Design interest
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`DesignInterestRequest`)
  ```json
{
  "interests (required)": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`User`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
    ```

---

### `PATCH /api/v1/user/username`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/username`
- **Operation ID**: `updatePassword`
- **Summary**: Change username
- **Description**: Change username
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdateUsernameRequest`)
  ```json
{
  "name (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`User`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
    ```

---

### `PATCH /api/v1/user/password`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/password`
- **Operation ID**: `updatePassword_1`
- **Summary**: Change password
- **Description**: Change Password
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdatePasswordRequest`)
  ```json
{
  "oldPassword (required)": "string",
  "newPassword (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`User`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
    ```

---

### `GET /api/v1/user/address`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/user/address`
- **Operation ID**: `getAddress`
- **Summary**: Get Address
- **Description**: Get Address
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Address`)
    ```json
{
  "city": "string",
  "state": "string",
  "country": "string",
  "address": "string",
  "postalCode": "string",
  "longitude": "number (double)",
  "latitude": "number (double)"
}
    ```

---

## profile-controller

### `PUT /api/v1/profile`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/profile`
- **Operation ID**: `updateProfile`
- **Summary**: Update a profile
- **Description**: Update a profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdateProfileRequest`)
  ```json
{
  "name (required)": "string",
  "profilePic": "string",
  "coverPic": "string",
  "bio": "string",
  "categories": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Profile`)
    ```json
{
  "id": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
  "name": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "bio": "string",
  "reasonForProbation": "string",
  "reasonForTermination": "string",
  "probationDate": "string (date-time)",
  "terminationDate": "string (date-time)",
  "insight": {
    "totalFollowers": "integer (int32)",
    "totalFollowing": "integer (int32)",
    "totalUploads": "integer (int32)",
    "rating": {
      "id": "integer (int64)",
      "total1Star": "integer (int32)",
      "total2Star": "integer (int32)",
      "total3Star": "integer (int32)",
      "total4Star": "integer (int32)",
      "total5Star": "integer (int32)",
      "avgStars": "number (double)"
    },
    "totalEarnings": "number",
    "totalReviews": "integer (int32)",
    "totalCancelledOrders": "integer (int32)",
    "totalCompletedOrders": "integer (int32)",
    "jobSuccessPercentage": "integer (int32)"
  },
  "distanceInKm": "number (double)",
  "userId": "integer (int64)",
  "userName": "string",
  "userEmail": "string",
  "userPhone": "string",
  "coverPic": "string",
  "categories": [
    "string"
  ],
  "profilePic": "string"
}
    ```

---

### `POST /api/v1/profile`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/profile`
- **Operation ID**: `addProfile`
- **Summary**: Add a profile
- **Description**: Add a profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`AddProfileRequest`)
  ```json
{
  "profile (required)": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "name (required)": "string",
  "phoneNumber": "string",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  }
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`User`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
    ```

---

## order-request-controller

### `PUT /api/v1/orders-request/print/{requestId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders-request/print/{requestId}`
- **Operation ID**: `updateNewPrintRequest`
- **Summary**: Update an order request for type Print
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `requestId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`PrintRequestUpdateDto`)
  ```json
{
  "colour": "string",
  "quantity": "integer (int64)",
  "size": "string",
  "deliveryAddress": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "pickupAddress": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  }
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`OrderRequest`)
    ```json
{
  "id": "integer (int64)",
  "printRequest": {
    "id": "integer (int64)",
    "designId": "integer (int64)",
    "mockId": "integer (int64)",
    "designCoverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designAmount": "number",
    "mockName": "string",
    "sourceOfItem": "string",
    "quantity": "integer (int64)",
    "colour": "string",
    "size": "string",
    "deliveryAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "pickerAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "mockItemUrl": "string",
    "designFrontImageUrl": "string"
  },
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "customDesignRequest": {
    "id": "integer (int64)",
    "theme": "string",
    "purpose": "string",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designId": "integer (int64)",
    "isReferenceDesign": "boolean",
    "imageUrlFront": "string",
    "mockTypes": [
      "string"
    ]
  },
  "orderType": "string enum: [PRINT | DESIGN]",
  "budgetAmount": "number",
  "dateOfDelivery": "string (date)",
  "providerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "conversationId": "string"
}
    ```

---

### `POST /api/v1/orders-request/print`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders-request/print`
- **Operation ID**: `createNewPrintRequest`
- **Summary**: Create an order request for type Print
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`PrintRequestDto`)
  ```json
{
  "printerId": "integer (int64)",
  "designId": "integer (int64)",
  "colour": "string",
  "quantity": "integer (int64)",
  "size": "string",
  "sourceOfItem": "string",
  "mockItemId": "integer (int64)",
  "customDesign": "boolean",
  "deliveryAddress (required)": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "pickupAddress": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "estimatedAmount": "number",
  "dateOfDelivery": "string (date)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`OrderRequest`)
    ```json
{
  "id": "integer (int64)",
  "printRequest": {
    "id": "integer (int64)",
    "designId": "integer (int64)",
    "mockId": "integer (int64)",
    "designCoverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designAmount": "number",
    "mockName": "string",
    "sourceOfItem": "string",
    "quantity": "integer (int64)",
    "colour": "string",
    "size": "string",
    "deliveryAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "pickerAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "mockItemUrl": "string",
    "designFrontImageUrl": "string"
  },
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "customDesignRequest": {
    "id": "integer (int64)",
    "theme": "string",
    "purpose": "string",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designId": "integer (int64)",
    "isReferenceDesign": "boolean",
    "imageUrlFront": "string",
    "mockTypes": [
      "string"
    ]
  },
  "orderType": "string enum: [PRINT | DESIGN]",
  "budgetAmount": "number",
  "dateOfDelivery": "string (date)",
  "providerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "conversationId": "string"
}
    ```

---

### `POST /api/v1/orders-request/print/multi`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders-request/print/multi`
- **Operation ID**: `createNewPrintRequest_1`
- **Summary**: Create multiple order request for type Print
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`PrintRequestListDto`)
  ```json
{
  "printRequestDtoList": [
    {
      "printerId": "integer (int64)",
      "designId": "integer (int64)",
      "colour": "string",
      "quantity": "integer (int64)",
      "size": "string",
      "sourceOfItem": "string",
      "mockItemId": "integer (int64)",
      "customDesign": "boolean",
      "deliveryAddress (required)": {
        "name (required)": "string",
        "phoneNumber (required)": "string",
        "email": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "address (required)": "string",
        "postalCode": "string",
        "longitude": "number (double)",
        "latitude": "number (double)"
      },
      "pickupAddress": {
        "name (required)": "string",
        "phoneNumber (required)": "string",
        "email": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "address (required)": "string",
        "postalCode": "string",
        "longitude": "number (double)",
        "latitude": "number (double)"
      },
      "estimatedAmount": "number",
      "dateOfDelivery": "string (date)"
    }
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "string"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  }
]
    ```

---

### `POST /api/v1/orders-request/design`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders-request/design`
- **Operation ID**: `createDesignRequest`
- **Summary**: create new custom design request
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`CustomDesignRequestDto`)
  ```json
{
  "designerProfileId (required)": "integer (int64)",
  "mockTypes (required)": [
    "string"
  ],
  "purpose (required)": "string",
  "theme (required)": "string",
  "dateOfDelivery": "string (date)",
  "estimatedAmount": "number"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`OrderRequest`)
    ```json
{
  "id": "integer (int64)",
  "printRequest": {
    "id": "integer (int64)",
    "designId": "integer (int64)",
    "mockId": "integer (int64)",
    "designCoverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designAmount": "number",
    "mockName": "string",
    "sourceOfItem": "string",
    "quantity": "integer (int64)",
    "colour": "string",
    "size": "string",
    "deliveryAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "pickerAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "mockItemUrl": "string",
    "designFrontImageUrl": "string"
  },
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "customDesignRequest": {
    "id": "integer (int64)",
    "theme": "string",
    "purpose": "string",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designId": "integer (int64)",
    "isReferenceDesign": "boolean",
    "imageUrlFront": "string",
    "mockTypes": [
      "string"
    ]
  },
  "orderType": "string enum: [PRINT | DESIGN]",
  "budgetAmount": "number",
  "dateOfDelivery": "string (date)",
  "providerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "conversationId": "string"
}
    ```

---

### `POST /api/v1/orders-request/customization`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders-request/customization`
- **Operation ID**: `requestCustomization`
- **Summary**: request customization for design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`RequestCustomizationDTo`)
  ```json
{
  "designId (required)": "integer (int64)",
  "designerId (required)": "integer (int64)",
  "dateOfDelivery": "string (date)",
  "estimatedAmount": "number",
  "mockTypes": [
    "string"
  ],
  "purpose": "string",
  "theme": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`OrderRequest`)
    ```json
{
  "id": "integer (int64)",
  "printRequest": {
    "id": "integer (int64)",
    "designId": "integer (int64)",
    "mockId": "integer (int64)",
    "designCoverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designAmount": "number",
    "mockName": "string",
    "sourceOfItem": "string",
    "quantity": "integer (int64)",
    "colour": "string",
    "size": "string",
    "deliveryAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "pickerAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "mockItemUrl": "string",
    "designFrontImageUrl": "string"
  },
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "customDesignRequest": {
    "id": "integer (int64)",
    "theme": "string",
    "purpose": "string",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designId": "integer (int64)",
    "isReferenceDesign": "boolean",
    "imageUrlFront": "string",
    "mockTypes": [
      "string"
    ]
  },
  "orderType": "string enum: [PRINT | DESIGN]",
  "budgetAmount": "number",
  "dateOfDelivery": "string (date)",
  "providerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "conversationId": "string"
}
    ```

---

### `GET /api/v1/orders-request/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders-request/{id}`
- **Operation ID**: `getOrderRequestById`
- **Summary**: Get order request By Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`OrderRequest`)
    ```json
{
  "id": "integer (int64)",
  "printRequest": {
    "id": "integer (int64)",
    "designId": "integer (int64)",
    "mockId": "integer (int64)",
    "designCoverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designAmount": "number",
    "mockName": "string",
    "sourceOfItem": "string",
    "quantity": "integer (int64)",
    "colour": "string",
    "size": "string",
    "deliveryAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "pickerAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "mockItemUrl": "string",
    "designFrontImageUrl": "string"
  },
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "customDesignRequest": {
    "id": "integer (int64)",
    "theme": "string",
    "purpose": "string",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designId": "integer (int64)",
    "isReferenceDesign": "boolean",
    "imageUrlFront": "string",
    "mockTypes": [
      "string"
    ]
  },
  "orderType": "string enum: [PRINT | DESIGN]",
  "budgetAmount": "number",
  "dateOfDelivery": "string (date)",
  "providerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "conversationId": "string"
}
    ```

---

## design-controller

### `GET /api/v1/designs/{designId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}`
- **Operation ID**: `fetchApprovedDesignById`
- **Summary**: Fetch design by Id - with like option
- **Description**: Fetch design by Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `PUT /api/v1/designs/{designId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}`
- **Operation ID**: `updateDesign`
- **Summary**: Update Design
- **Description**: Update Design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdateDesignRequest`)
  ```json
{
  "name (required)": "string",
  "frontImageUrl (required)": "string",
  "description": "string",
  "printerId": "integer (int64)",
  "amount": "number",
  "tags": [
    "string"
  ],
  "openForCustomization": "boolean",
  "categories": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `DELETE /api/v1/designs/{designId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}`
- **Operation ID**: `deleteDesign`
- **Summary**: Delete Design
- **Description**: Delete Design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{
  "[key: string]": {}
}
    ```

---

### `PUT /api/v1/designs/{designId}/mock/{mockId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/mock/{mockId}`
- **Operation ID**: `editMockToDesign`
- **Summary**: Edit mock to design
- **Description**: Edit mock to design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
  - `mockId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`MockImagesDto`)
  ```json
{
  "limitedStatus": "boolean",
  "imageUrl (required)": "string",
  "availableQty": "integer (int64)",
  "name (required)": "string",
  "category (required)": "string",
  "colours": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`MockImages`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "category": "string",
  "limitedStatus": "boolean",
  "image": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "availableQty": "integer (int64)",
  "colours": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

### `DELETE /api/v1/designs/{designId}/mock/{mockId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/mock/{mockId}`
- **Operation ID**: `removeMockToDesign`
- **Summary**: remove mock to design
- **Description**: remove mock to design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
  - `mockId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{
  "[key: string]": {}
}
    ```

---

### `GET /api/v1/designs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs`
- **Operation ID**: `fetchAllApprovedDesigns`
- **Summary**: Get all Designs and filter - with like option
- **Description**: Fetch all designs
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Query Parameters**:
  - `designer`: `integer (int64)` (optional)
  - `tags`: `string` (optional)
  - `designCategories`: `string` (optional)
  - `mockName`: `string` (optional)
  - `mockCategory`: `string` (optional)
  - `upperPriceRange`: `integer (int32)` (optional)
  - `lowerPriceRange`: `integer (int32)` (optional)
  - `searchField`: `string` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageDesign`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `POST /api/v1/designs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs`
- **Operation ID**: `createDesign`
- **Summary**: Create Design
- **Description**: Create Design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`NewDesignRequest`)
  ```json
{
  "name (required)": "string",
  "frontImageUrl (required)": "string",
  "designImages (required)": [
    "string"
  ],
  "description": "string",
  "printerId": "integer (int64)",
  "openForCustomization": "boolean",
  "amount": "number",
  "mocks (required)": [
    {
      "limitedStatus": "boolean",
      "imageUrl (required)": "string",
      "availableQty": "integer (int64)",
      "name (required)": "string",
      "category (required)": "string",
      "colours": [
        "string"
      ]
    }
  ],
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `POST /api/v1/designs/{designId}/mock`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/mock`
- **Operation ID**: `addMockToDesign`
- **Summary**: Add mock to design
- **Description**: Add mock to design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`MockImagesDto`)
  ```json
{
  "limitedStatus": "boolean",
  "imageUrl (required)": "string",
  "availableQty": "integer (int64)",
  "name (required)": "string",
  "category (required)": "string",
  "colours": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`MockImages`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "category": "string",
  "limitedStatus": "boolean",
  "image": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "availableQty": "integer (int64)",
  "colours": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

### `GET /api/v1/designs/{designId}/design-uploads`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/design-uploads`
- **Operation ID**: `addMockToDesign_2`
- **Summary**: Add design-upload to design
- **Description**: Add design-upload to design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "fileUpload": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  }
]
    ```

---

### `POST /api/v1/designs/{designId}/design-uploads`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/design-uploads`
- **Operation ID**: `addMockToDesign_1`
- **Summary**: Add design-upload to design
- **Description**: Add design-upload to design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`AddDesignUpload`)
  ```json
{
  "imagePath (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`DesignUpload`)
    ```json
{
  "id": "integer (int64)",
  "fileUpload": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  }
}
    ```

---

### `PATCH /api/v1/designs/{designId}/likes`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/likes`
- **Operation ID**: `likeAndUnlikeDesign`
- **Summary**: Like and Unlike Design
- **Description**: Like and Unlike Design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `GET /api/v1/designs/{designId}/designer`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/designer`
- **Operation ID**: `designerGetDesignById`
- **Summary**: Designer Get Design by Id - returns design whether approved or not
- **Description**: Get Design by Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `GET /api/v1/designs/slug/{slug}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/slug/{slug}`
- **Operation ID**: `getDesignBySlug_1`
- **Summary**: Fetch design by slug
- **Description**: Fetch design by slug
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `slug`: `string` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `GET /api/v1/designs/all/likes`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/all/likes`
- **Operation ID**: `fetchAllLikedDesign`
- **Summary**: Like and Unlike Design
- **Description**: Like and Unlike Design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageDesign`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/designs/all/designer`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/all/designer`
- **Operation ID**: `fetchAllDesignForDesigner`
- **Summary**: Fetch all Designs By Designer
- **Description**: Fetch all Designs by designer
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageDesign`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `DELETE /api/v1/designs/{designId}/design-uploads/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/designs/{designId}/design-uploads/{id}`
- **Operation ID**: `deleteDesignUpload`
- **Summary**: remove design-upload from design
- **Description**: remove design-upload from design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{
  "[key: string]": {}
}
    ```

---

## collection-controller

### `PUT /api/v1/collections/{collectionId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/collections/{collectionId}`
- **Operation ID**: `updateCollection`
- **Summary**: Update Collection
- **Description**: Update Collection
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `collectionId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`NewCollectionRequest`)
  ```json
{
  "name (required)": "string",
  "description": "string",
  "picture": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Collection`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "slug": "string",
  "description": "string",
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "picture": "string"
}
    ```

---

### `DELETE /api/v1/collections/{collectionId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/collections/{collectionId}`
- **Operation ID**: `deleteCollection`
- **Summary**: Delete Collection
- **Description**: Delete Collection
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `collectionId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `PUT /api/v1/collections/{collectionId}/designs/move`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/collections/{collectionId}/designs/move`
- **Operation ID**: `moveDesignToCollection`
- **Summary**: Move / Remove(newCollection == null) designs from Collection
- **Description**: Move / Remove(newCollection == null) designs from Collection
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `collectionId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`CollectionMoveRequest`)
  ```json
{
  "designs": [
    "integer (int64)"
  ],
  "newCollection": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `PUT /api/v1/collections/{collectionId}/designs/add`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/collections/{collectionId}/designs/add`
- **Operation ID**: `addDesignToCollection`
- **Summary**: Add Design to Collection
- **Description**: Add Design to Collection
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `collectionId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`CollectionAdditionRequest`)
  ```json
{
  "designs": [
    "integer (int64)"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `GET /api/v1/collections`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/collections`
- **Operation ID**: `fetchDesignerCollection`
- **Summary**: Fetch all Collections By Designer
- **Description**: Fetch all Collections By Designer
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageCollection`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "slug": "string",
      "description": "string",
      "designs": [
        {
          "id": "integer (int64)",
          "name": "string",
          "coverImage": "object",
          "description": "string",
          "slug": "string",
          "designer": "object",
          "printer": "object",
          "mocks": [
            "object"
          ],
          "amount": "number",
          "approved": "boolean",
          "openForCustomization": "boolean",
          "reasonForRejection": "string",
          "designIsLiked": "boolean",
          "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
          "tags": [
            "object"
          ],
          "categories": [
            "object"
          ],
          "imageUrlFront": "string"
        }
      ],
      "picture": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `POST /api/v1/collections`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/collections`
- **Operation ID**: `createNewCollection`
- **Summary**: Create Collection
- **Description**: Create Collection
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`NewCollectionRequest`)
  ```json
{
  "name (required)": "string",
  "description": "string",
  "picture": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Collection`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "slug": "string",
  "description": "string",
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "picture": "string"
}
    ```

---

## admin-controller

### `GET /api/v1/berry/users`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/users`
- **Operation ID**: `getAdminUsers`
- **Summary**: Get Admin Users
- **Description**: Get Admin Users
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "permission": {
      "id": "integer (int64)",
      "canManagerAdmin": "boolean",
      "canManagerUsers": "boolean",
      "canManagerDesigns": "boolean",
      "canManagerOrders": "boolean",
      "canManagerTransactions": "boolean",
      "canManagerPayments": "boolean",
      "canManagerTickets": "boolean",
      "canManagerBlogs": "boolean",
      "canManagerEmails": "boolean",
      "canManagerWallets": "boolean",
      "canManagerLogistics": "boolean"
    },
    "profilePicture": "string",
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ]
  }
]
    ```

---

### `PUT /api/v1/berry/users`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/users`
- **Operation ID**: `updateAdminProfile`
- **Summary**: Update admin profile
- **Description**: Update admin profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdateAdminRequest`)
  ```json
{
  "name (required)": "string",
  "phoneNumber": "string",
  "profilePicture": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Admin`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "permission": {
    "id": "integer (int64)",
    "canManagerAdmin": "boolean",
    "canManagerUsers": "boolean",
    "canManagerDesigns": "boolean",
    "canManagerOrders": "boolean",
    "canManagerTransactions": "boolean",
    "canManagerPayments": "boolean",
    "canManagerTickets": "boolean",
    "canManagerBlogs": "boolean",
    "canManagerEmails": "boolean",
    "canManagerWallets": "boolean",
    "canManagerLogistics": "boolean"
  },
  "profilePicture": "string",
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ]
}
    ```

---

### `POST /api/v1/berry/users`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/users`
- **Operation ID**: `addAdmin`
- **Summary**: Add admin
- **Description**: Add admin
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`AddAdminRequest`)
  ```json
{
  "name (required)": "string",
  "email (required)": "string",
  "role": "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]",
  "canManagerAdmin": "boolean",
  "canManagerUsers": "boolean",
  "canManagerDesigns": "boolean",
  "canManagerOrders": "boolean",
  "canManagerTransactions": "boolean",
  "canManagerPayments": "boolean",
  "canManagerTickets": "boolean",
  "canManagerBlogs": "boolean",
  "canManagerEmails": "boolean",
  "canManagerWallets": "boolean",
  "canManagerLogistics": "boolean"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Admin`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "permission": {
    "id": "integer (int64)",
    "canManagerAdmin": "boolean",
    "canManagerUsers": "boolean",
    "canManagerDesigns": "boolean",
    "canManagerOrders": "boolean",
    "canManagerTransactions": "boolean",
    "canManagerPayments": "boolean",
    "canManagerTickets": "boolean",
    "canManagerBlogs": "boolean",
    "canManagerEmails": "boolean",
    "canManagerWallets": "boolean",
    "canManagerLogistics": "boolean"
  },
  "profilePicture": "string",
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ]
}
    ```

---

### `GET /api/v1/berry/users/{adminId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/users/{adminId}`
- **Operation ID**: `getAdminUserById`
- **Summary**: Get Admin User by Id
- **Description**: Get Admin User by Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `adminId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Admin`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "permission": {
    "id": "integer (int64)",
    "canManagerAdmin": "boolean",
    "canManagerUsers": "boolean",
    "canManagerDesigns": "boolean",
    "canManagerOrders": "boolean",
    "canManagerTransactions": "boolean",
    "canManagerPayments": "boolean",
    "canManagerTickets": "boolean",
    "canManagerBlogs": "boolean",
    "canManagerEmails": "boolean",
    "canManagerWallets": "boolean",
    "canManagerLogistics": "boolean"
  },
  "profilePicture": "string",
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ]
}
    ```

---

### `PUT /api/v1/berry/users/{adminId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/users/{adminId}`
- **Operation ID**: `editAdminUser`
- **Summary**: Edit Admin User
- **Description**: Edit Admin User
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `adminId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`EditAdminRequest`)
  ```json
{
  "name (required)": "string",
  "role (required)": "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]",
  "canManagerAdmin": "boolean",
  "canManagerUsers": "boolean",
  "canManagerDesigns": "boolean",
  "canManagerOrders": "boolean",
  "canManagerTransactions": "boolean",
  "canManagerPayments": "boolean",
  "canManagerTickets": "boolean",
  "canManagerBlogs": "boolean",
  "canManagerEmails": "boolean",
  "canManagerWallets": "boolean",
  "canManagerLogistics": "boolean"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Admin`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "permission": {
    "id": "integer (int64)",
    "canManagerAdmin": "boolean",
    "canManagerUsers": "boolean",
    "canManagerDesigns": "boolean",
    "canManagerOrders": "boolean",
    "canManagerTransactions": "boolean",
    "canManagerPayments": "boolean",
    "canManagerTickets": "boolean",
    "canManagerBlogs": "boolean",
    "canManagerEmails": "boolean",
    "canManagerWallets": "boolean",
    "canManagerLogistics": "boolean"
  },
  "profilePicture": "string",
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ]
}
    ```

---

### `DELETE /api/v1/berry/users/{adminId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/users/{adminId}`
- **Operation ID**: `deleteAdminUser`
- **Summary**: Delete Admin User
- **Description**: Delete Admin User
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `adminId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `POST /api/v1/berry/users/resend-code`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/users/resend-code`
- **Operation ID**: `resendAccountActivationCode`
- **Summary**: Resend Account Activation Code
- **Description**: Resend Account Activation Code
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BaseRequest`)
  ```json
{
  "email (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

## admin-ticket-controller

### `GET /api/v1/berry/tickets/{ticketId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/tickets/{ticketId}`
- **Operation ID**: `getTicketById`
- **Summary**: Admin Get Ticket By Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `ticketId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Ticket`)
    ```json
{
  "id": "integer (int64)",
  "ticketId": "string",
  "details": "string",
  "status": "string enum: [CLOSED | OPEN]",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedTo": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "permission": {
      "id": "integer (int64)",
      "canManagerAdmin": "boolean",
      "canManagerUsers": "boolean",
      "canManagerDesigns": "boolean",
      "canManagerOrders": "boolean",
      "canManagerTransactions": "boolean",
      "canManagerPayments": "boolean",
      "canManagerTickets": "boolean",
      "canManagerBlogs": "boolean",
      "canManagerEmails": "boolean",
      "canManagerWallets": "boolean",
      "canManagerLogistics": "boolean"
    },
    "profilePicture": "string",
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ]
  },
  "dispute": {
    "id": "integer (int64)",
    "disputeId": "string",
    "comment": "string",
    "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
    "status": "string enum: [CLOSED | OPEN]",
    "ticketCreated": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "order": {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": "object",
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    },
    "closedDate": "string (date-time)"
  },
  "closedDate": "string (date-time)"
}
    ```

---

### `PUT /api/v1/berry/tickets/{ticketId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/tickets/{ticketId}`
- **Operation ID**: `updateTicket`
- **Summary**: Admin Create Ticket
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `ticketId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`TicketDto`)
  ```json
{
  "details": "string",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedToId": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Ticket`)
    ```json
{
  "id": "integer (int64)",
  "ticketId": "string",
  "details": "string",
  "status": "string enum: [CLOSED | OPEN]",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedTo": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "permission": {
      "id": "integer (int64)",
      "canManagerAdmin": "boolean",
      "canManagerUsers": "boolean",
      "canManagerDesigns": "boolean",
      "canManagerOrders": "boolean",
      "canManagerTransactions": "boolean",
      "canManagerPayments": "boolean",
      "canManagerTickets": "boolean",
      "canManagerBlogs": "boolean",
      "canManagerEmails": "boolean",
      "canManagerWallets": "boolean",
      "canManagerLogistics": "boolean"
    },
    "profilePicture": "string",
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ]
  },
  "dispute": {
    "id": "integer (int64)",
    "disputeId": "string",
    "comment": "string",
    "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
    "status": "string enum: [CLOSED | OPEN]",
    "ticketCreated": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "order": {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": "object",
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    },
    "closedDate": "string (date-time)"
  },
  "closedDate": "string (date-time)"
}
    ```

---

### `POST /api/v1/berry/tickets/disputes/{disputeId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/tickets/disputes/{disputeId}`
- **Operation ID**: `createTicket`
- **Summary**: Admin Create Ticket
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `disputeId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`TicketDto`)
  ```json
{
  "details": "string",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedToId": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Ticket`)
    ```json
{
  "id": "integer (int64)",
  "ticketId": "string",
  "details": "string",
  "status": "string enum: [CLOSED | OPEN]",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedTo": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "permission": {
      "id": "integer (int64)",
      "canManagerAdmin": "boolean",
      "canManagerUsers": "boolean",
      "canManagerDesigns": "boolean",
      "canManagerOrders": "boolean",
      "canManagerTransactions": "boolean",
      "canManagerPayments": "boolean",
      "canManagerTickets": "boolean",
      "canManagerBlogs": "boolean",
      "canManagerEmails": "boolean",
      "canManagerWallets": "boolean",
      "canManagerLogistics": "boolean"
    },
    "profilePicture": "string",
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ]
  },
  "dispute": {
    "id": "integer (int64)",
    "disputeId": "string",
    "comment": "string",
    "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
    "status": "string enum: [CLOSED | OPEN]",
    "ticketCreated": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "order": {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": "object",
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    },
    "closedDate": "string (date-time)"
  },
  "closedDate": "string (date-time)"
}
    ```

---

### `PATCH /api/v1/berry/tickets/{ticketId}/close`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/tickets/{ticketId}/close`
- **Operation ID**: `closeTicket`
- **Summary**: Admin Close Ticket
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `ticketId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Ticket`)
    ```json
{
  "id": "integer (int64)",
  "ticketId": "string",
  "details": "string",
  "status": "string enum: [CLOSED | OPEN]",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedTo": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "permission": {
      "id": "integer (int64)",
      "canManagerAdmin": "boolean",
      "canManagerUsers": "boolean",
      "canManagerDesigns": "boolean",
      "canManagerOrders": "boolean",
      "canManagerTransactions": "boolean",
      "canManagerPayments": "boolean",
      "canManagerTickets": "boolean",
      "canManagerBlogs": "boolean",
      "canManagerEmails": "boolean",
      "canManagerWallets": "boolean",
      "canManagerLogistics": "boolean"
    },
    "profilePicture": "string",
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ]
  },
  "dispute": {
    "id": "integer (int64)",
    "disputeId": "string",
    "comment": "string",
    "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
    "status": "string enum: [CLOSED | OPEN]",
    "ticketCreated": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "order": {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": "object",
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    },
    "closedDate": "string (date-time)"
  },
  "closedDate": "string (date-time)"
}
    ```

---

### `GET /api/v1/berry/tickets`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/tickets`
- **Operation ID**: `getAllTickets`
- **Summary**: Admin Fetch all tickets
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `priority`: `string` (optional) — enum: `[URGENT, HIGH, MEDIUM, LOW]`
  - `status`: `string` (optional) — enum: `[CLOSED, OPEN]`
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageTicket`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "ticketId": "string",
      "details": "string",
      "status": "string enum: [CLOSED | OPEN]",
      "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
      "assignedTo": {
        "id": "integer (int64)",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "profileImage": "object",
        "enabled": "boolean",
        "activated": "boolean",
        "lastLoginDate": "string (date-time)",
        "lastPasswordResetDate": "string (date-time)",
        "permission": "object",
        "profilePicture": "string",
        "roles": [
          "object"
        ]
      },
      "dispute": {
        "id": "integer (int64)",
        "disputeId": "string",
        "comment": "string",
        "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
        "status": "string enum: [CLOSED | OPEN]",
        "ticketCreated": "boolean",
        "customerProfile": "object",
        "order": "object",
        "closedDate": "string (date-time)"
      },
      "closedDate": "string (date-time)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

## admin-subscriber-controller

### `PUT /api/v1/berry/subscribers/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/subscribers/{id}`
- **Operation ID**: `updateSubscriber`
- **Summary**: Subscriber
- **Description**: Update Subscriber
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`UpdateSubscriberRequest`)
  ```json
{
  "id": "integer (int64)",
  "name (required)": "string",
  "username": "string",
  "phoneNumber": "string",
  "email": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Subscriber`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "username": "string",
  "phoneNumber": "string",
  "email": "string",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]"
}
    ```

---

### `DELETE /api/v1/berry/subscribers/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/subscribers/{id}`
- **Operation ID**: `deleteSubscriber`
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `GET /api/v1/berry/subscribers`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/subscribers`
- **Operation ID**: `getAllSubscriber`
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageSubscriber`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "username": "string",
      "phoneNumber": "string",
      "email": "string",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

## admin-logistic-controller

### `GET /api/v1/berry/logistics/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/logistics/{id}`
- **Operation ID**: `adminFetchLogisticRequestById`
- **Summary**: admin fetch logistic requests by id
- **Description**: admin fetch logistic requests by id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LogisticRequest`)
    ```json
{
  "senderName": "string",
  "senderPhoneNumber": "string",
  "senderEmail": "string",
  "senderCity": "string",
  "senderState": "string",
  "senderCountry": "string",
  "senderAddress": "string",
  "senderPostalCode": "string",
  "senderLongitude": "number (double)",
  "senderLatitude": "number (double)",
  "requestType": "string enum: [PICKUP | DELIVERY]",
  "status": "string enum: [PENDING | IN_PROGRESS | DONE]",
  "receiverName": "string",
  "receiverPhoneNumber": "string",
  "receiverEmail": "string",
  "receiverCity": "string",
  "receiverState": "string",
  "receiverCountry": "string",
  "receiverAddress": "string",
  "receiverPostalCode": "string",
  "receiverLongitude": "number (double)",
  "receiverLatitude": "number (double)",
  "orderId": "integer (int64)"
}
    ```

---

### `PUT /api/v1/berry/logistics/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/logistics/{id}`
- **Operation ID**: `updateLogisticRequestStatus`
- **Summary**: admin update logistic request
- **Description**: admin update logistic request
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`LogisticRequestStatus`)
  ```json
{
  "status (required)": "string enum: [PENDING | IN_PROGRESS | DONE]"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LogisticRequest`)
    ```json
{
  "senderName": "string",
  "senderPhoneNumber": "string",
  "senderEmail": "string",
  "senderCity": "string",
  "senderState": "string",
  "senderCountry": "string",
  "senderAddress": "string",
  "senderPostalCode": "string",
  "senderLongitude": "number (double)",
  "senderLatitude": "number (double)",
  "requestType": "string enum: [PICKUP | DELIVERY]",
  "status": "string enum: [PENDING | IN_PROGRESS | DONE]",
  "receiverName": "string",
  "receiverPhoneNumber": "string",
  "receiverEmail": "string",
  "receiverCity": "string",
  "receiverState": "string",
  "receiverCountry": "string",
  "receiverAddress": "string",
  "receiverPostalCode": "string",
  "receiverLongitude": "number (double)",
  "receiverLatitude": "number (double)",
  "orderId": "integer (int64)"
}
    ```

---

### `GET /api/v1/berry/logistics`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/logistics`
- **Operation ID**: `adminFetchAllLogisticRequest`
- **Summary**: admin fetch all logistic requests
- **Description**: admin fetch all logistic requests
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `status`: `string` (optional) — enum: `[PENDING, IN_PROGRESS, DONE]`
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageLogisticRequest`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "senderName": "string",
      "senderPhoneNumber": "string",
      "senderEmail": "string",
      "senderCity": "string",
      "senderState": "string",
      "senderCountry": "string",
      "senderAddress": "string",
      "senderPostalCode": "string",
      "senderLongitude": "number (double)",
      "senderLatitude": "number (double)",
      "requestType": "string enum: [PICKUP | DELIVERY]",
      "status": "string enum: [PENDING | IN_PROGRESS | DONE]",
      "receiverName": "string",
      "receiverPhoneNumber": "string",
      "receiverEmail": "string",
      "receiverCity": "string",
      "receiverState": "string",
      "receiverCountry": "string",
      "receiverAddress": "string",
      "receiverPostalCode": "string",
      "receiverLongitude": "number (double)",
      "receiverLatitude": "number (double)",
      "orderId": "integer (int64)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

## admin-blog-controller

### `GET /api/v1/berry/blogs/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/blogs/{id}`
- **Operation ID**: `getBlogById`
- **Summary**: Get Blog By Id
- **Description**: Get blog by id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Blog`)
    ```json
{
  "id": "integer (int64)",
  "slug": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "title": "string",
  "category": "string",
  "details": "string",
  "description": "string",
  "enabled": "boolean",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

### `PUT /api/v1/berry/blogs/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/blogs/{id}`
- **Operation ID**: `editBlog`
- **Summary**: Edit Blog
- **Description**: Edit blog
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BlogDto`)
  ```json
{
  "imageUrl": "string",
  "title (required)": "string",
  "category (required)": "string",
  "detail (required)": "string",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "description": "string",
  "enabled": "boolean"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Blog`)
    ```json
{
  "id": "integer (int64)",
  "slug": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "title": "string",
  "category": "string",
  "details": "string",
  "description": "string",
  "enabled": "boolean",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

### `DELETE /api/v1/berry/blogs/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/blogs/{id}`
- **Operation ID**: `deleteBlog`
- **Summary**: Delete Blog
- **Description**: Delete blog
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `PATCH /api/v1/berry/blogs/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/blogs/{id}`
- **Operation ID**: `enableOrDisableBlogById`
- **Summary**: Enable or Disable Blog By Id
- **Description**: Enable or disable blog by id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Blog`)
    ```json
{
  "id": "integer (int64)",
  "slug": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "title": "string",
  "category": "string",
  "details": "string",
  "description": "string",
  "enabled": "boolean",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

### `GET /api/v1/berry/blogs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/blogs`
- **Operation ID**: `getBlogs`
- **Summary**: Get Blogs
- **Description**: Get blogs
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageBlog`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "slug": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "title": "string",
      "category": "string",
      "details": "string",
      "description": "string",
      "enabled": "boolean",
      "tags": [
        "string"
      ],
      "keywords": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `POST /api/v1/berry/blogs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/blogs`
- **Operation ID**: `addBlog`
- **Summary**: Add Blog
- **Description**: Add blog
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BlogDto`)
  ```json
{
  "imageUrl": "string",
  "title (required)": "string",
  "category (required)": "string",
  "detail (required)": "string",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "description": "string",
  "enabled": "boolean"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Blog`)
    ```json
{
  "id": "integer (int64)",
  "slug": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "title": "string",
  "category": "string",
  "details": "string",
  "description": "string",
  "enabled": "boolean",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

## web-hook-controller

### `POST /api/v1/webhook/paystack`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/webhook/paystack`
- **Operation ID**: `paymentWebhookUrl`
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`PaystackTransactionRequest`)
  ```json
{
  "event": "string",
  "data": {
    "id": "object",
    "domain": "string",
    "status": "string",
    "reference": "string",
    "gateway_response": "string",
    "ip_address": "string",
    "amount": "number",
    "message": "string",
    "paid_at": "string (date-time)",
    "created_at": "string (date-time)",
    "channel": "string",
    "currency": "string",
    "metadata": "object",
    "fees": "object",
    "customer": "object",
    "authorization": "object",
    "plan": "object",
    "split": "object",
    "source": "object",
    "paidAt": "string (date-time)"
  }
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

## wallet-controller

### `POST /api/v1/wallets/withdraw`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/wallets/withdraw`
- **Operation ID**: `withdraw`
- **Summary**: User withdraw from wallet
- **Description**: User withdraw from wallet
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`WalletWithdrawalRequest`)
  ```json
{
  "amount": "number"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`WalletHistory`)
    ```json
{
  "id": "integer (int64)",
  "amount": "number",
  "transactionType": "string enum: [CREDIT | DEBIT | REFUND]",
  "status": "string enum: [SUCCESS | FAILED | PENDING]",
  "transactionReference": "string",
  "accountDetails": {
    "bankName": "string",
    "bankCode": "string",
    "accountName": "string",
    "accountNumber": "string"
  }
}
    ```

---

### `GET /api/v1/wallets`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/wallets`
- **Operation ID**: `getProfileWallet`
- **Summary**: User get wallet
- **Description**: User get wallet
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Wallet`)
    ```json
{
  "id": "integer (int64)",
  "amount": "number",
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
    ```

---

### `GET /api/v1/wallets/histories`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/wallets/histories`
- **Operation ID**: `getWalletHistories`
- **Summary**: User get wallet histories
- **Description**: User get wallet histories
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Query Parameters**:
  - `status`: `string` (optional) — enum: `[SUCCESS, FAILED, PENDING]`
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageWalletHistory`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "amount": "number",
      "transactionType": "string enum: [CREDIT | DEBIT | REFUND]",
      "status": "string enum: [SUCCESS | FAILED | PENDING]",
      "transactionReference": "string",
      "accountDetails": {
        "bankName": "string",
        "bankCode": "string",
        "accountName": "string",
        "accountNumber": "string"
      }
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

## referral-controller

### `POST /api/v1/referral/redeem/wallet`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/referral/redeem/wallet`
- **Operation ID**: `redeemRewardToWallet`
- **Summary**: Redeem reward to wallet
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ReferralRedemption`)
    ```json
{
  "id": "integer (int64)",
  "user": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "areaCode": "string",
    "referralCode": "string",
    "gender": "string enum: [FEMALE | MALE]",
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "updateAddress": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "printerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "designerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ],
    "designInterests": [
      "string"
    ]
  },
  "totalAmount": "number",
  "method": "string enum: [WALLET | BANK_TRANSFER]",
  "beneficiary": {
    "bankName": "string",
    "bankCode": "string",
    "accountName": "string",
    "accountNumber": "string"
  },
  "status": "string enum: [PENDING | SUCCESS | FAILED]",
  "transactionReference": "string"
}
    ```

---

### `POST /api/v1/referral/redeem/bank`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/referral/redeem/bank`
- **Operation ID**: `redeemRewardToBank`
- **Summary**: Redeem reward to bank
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`PaymentDetailDto`)
  ```json
{
  "bankName (required)": "string",
  "bankCode (required)": "string",
  "accountName": "string",
  "accountNumber (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ReferralRedemption`)
    ```json
{
  "id": "integer (int64)",
  "user": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "areaCode": "string",
    "referralCode": "string",
    "gender": "string enum: [FEMALE | MALE]",
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "updateAddress": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "printerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "designerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ],
    "designInterests": [
      "string"
    ]
  },
  "totalAmount": "number",
  "method": "string enum: [WALLET | BANK_TRANSFER]",
  "beneficiary": {
    "bankName": "string",
    "bankCode": "string",
    "accountName": "string",
    "accountNumber": "string"
  },
  "status": "string enum: [PENDING | SUCCESS | FAILED]",
  "transactionReference": "string"
}
    ```

---

### `GET /api/v1/referral`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/referral`
- **Operation ID**: `searchReferrals`
- **Summary**: Search User referrals
- **Description**: Search user referrals
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `search`: `string` (optional)
  - `status`: `string` (optional) — enum: `[PENDING_REWARD, PENDING, COMPLETED, PENDING_REDEMPTION, REDEEMED]`
  - `minAmount`: `number` (optional)
  - `maxAmount`: `number` (optional)
  - `startDate`: `string (date-time)` (optional)
  - `endDate`: `string (date-time)` (optional)
  - `page`: `integer (int32)` (optional) — default: `0`
  - `size`: `integer (int32)` (optional) — default: `10`
  - `sidx`: `string` (optional) — default: `createdDate`
  - `sord`: `string` (optional) — default: `DESC`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageReferral`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "user": {
        "id": "integer (int64)",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "areaCode": "string",
        "referralCode": "string",
        "gender": "string enum: [FEMALE | MALE]",
        "enabled": "boolean",
        "activated": "boolean",
        "lastLoginDate": "string (date-time)",
        "lastPasswordResetDate": "string (date-time)",
        "updateAddress": "boolean",
        "customerProfile": "object",
        "printerProfile": "object",
        "designerProfile": "object",
        "roles": [
          "object"
        ],
        "designInterests": [
          "object"
        ]
      },
      "referred": {
        "id": "integer (int64)",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "areaCode": "string",
        "referralCode": "string",
        "gender": "string enum: [FEMALE | MALE]",
        "enabled": "boolean",
        "activated": "boolean",
        "lastLoginDate": "string (date-time)",
        "lastPasswordResetDate": "string (date-time)",
        "updateAddress": "boolean",
        "customerProfile": "object",
        "printerProfile": "object",
        "designerProfile": "object",
        "roles": [
          "object"
        ],
        "designInterests": [
          "object"
        ]
      },
      "referredProfileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "referralCode": "string",
      "referrerReward": "number",
      "status": "string enum: [PENDING_REWARD | PENDING | COMPLETED | PENDING_REDEMPTION | REDEEMED]",
      "redemption": {
        "id": "integer (int64)",
        "user": "object",
        "totalAmount": "number",
        "method": "string enum: [WALLET | BANK_TRANSFER]",
        "beneficiary": "object",
        "status": "string enum: [PENDING | SUCCESS | FAILED]",
        "transactionReference": "string"
      }
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/referral/stats`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/referral/stats`
- **Operation ID**: `getUserStatisticsReferral`
- **Summary**: Get Context User Referral Stats
- **Description**: Get User referral stats.
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ReferrerStatsResponse`)
    ```json
{
  "totalCount": "integer (int64)",
  "pendingCount": "integer (int64)",
  "completedCount": "integer (int64)",
  "redeemedCount": "integer (int64)",
  "totalReward": "number",
  "pendingReward": "number",
  "completedReward": "number",
  "redeemedReward": "number",
  "lastCreatedDate": "string (date-time)",
  "lastModifiedDate": "string (date-time)"
}
    ```

---

### `GET /api/v1/referral/code`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/referral/code`
- **Operation ID**: `getUserReferralCode`
- **Summary**: Get Context User Referral Code
- **Description**: Returns context user referral code or generate one if not existing.
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ReferrerCodeResponse`)
    ```json
{
  "referralCode": "string"
}
    ```

---

## rating-controller

### `POST /api/v1/ratings`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/ratings`
- **Operation ID**: `rateAProfile`
- **Summary**: Rate a Profile
- **Description**: Rate a Profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`ReviewDto`)
  ```json
{
  "comment": "string",
  "service": "integer (int32)",
  "deliveryTime": "integer (int32)",
  "recommendation": "integer (int32)",
  "communication": "integer (int32)",
  "profileId": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Review`)
    ```json
{
  "id": "integer (int64)",
  "comment": "string",
  "stars": "integer (int32)",
  "service": "integer (int32)",
  "deliveryTime": "integer (int32)",
  "recommendation": "integer (int32)",
  "communication": "integer (int32)",
  "ratedUser": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "ratingUser": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
    ```

---

## order-controller

### `GET /api/v1/orders`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders`
- **Operation ID**: `fetchAllOrders`
- **Summary**: Fetch all orders for logged In profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Query Parameters**:
  - `orderStatus`: `string` (optional) — enum: `[REVIEW, REJECTED, ACTIVE, CANCELLED, AWAITING_CONFIRMATION, COMPLETED, PICKUP_REQUESTED, DELIVER_REQUESTED]`
  - `startDate`: `string (date)` (optional)
  - `endDate`: `string (date)` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageOrder`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": {
        "id": "integer (int64)",
        "printRequest": "object",
        "customerProfile": "object",
        "customDesignRequest": "object",
        "orderType": "string enum: [PRINT | DESIGN]",
        "budgetAmount": "number",
        "dateOfDelivery": "string (date)",
        "providerProfile": "object",
        "conversationId": "string"
      },
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `POST /api/v1/orders`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders`
- **Operation ID**: `createNewOrder`
- **Summary**: create a new order for designer or printer
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`OrderDto`)
  ```json
{
  "orderRequestId": "integer (int64)",
  "title (required)": "string",
  "description": "string",
  "amount (required)": "number",
  "deliveryAmount (required)": "number",
  "itemPickupAmount": "number",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate (required)": "string (date)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

### `GET /api/v1/orders/{orderId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}`
- **Operation ID**: `fetchOrderById`
- **Summary**: Fetch order by id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

### `POST /api/v1/orders/{orderId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}`
- **Operation ID**: `payForOrder`
- **Summary**: pay for order
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`OrderPaymentDto`)
  ```json
{
  "callback (required)": "string",
  "orderId (required)": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{
  "[key: string]": "string"
}
    ```

---

### `PATCH /api/v1/orders/{orderId}/design-uploads`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}/design-uploads`
- **Operation ID**: `printerGetDesignUploads`
- **Summary**: Printer, get Design upload by order id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "fileUpload": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  }
]
    ```

---

### `PATCH /api/v1/orders/{orderId}/deliver`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}/deliver`
- **Operation ID**: `providerDeliverOrder`
- **Summary**: Printer, Designer Deliver order
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

### `PATCH /api/v1/orders/{orderId}/decline`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}/decline`
- **Operation ID**: `declineOrder`
- **Summary**: Decline order
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

### `PATCH /api/v1/orders/{orderId}/customer/cancel`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}/customer/cancel`
- **Operation ID**: `customerCancelOrder`
- **Summary**: Customer Cancel order
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`DisputeDto`)
  ```json
{
  "comment": "string",
  "disputeType (required)": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

### `PATCH /api/v1/orders/{orderId}/confirm`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}/confirm`
- **Operation ID**: `customerConfirmOrder`
- **Summary**: Customer Confirm order
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

### `PATCH /api/v1/orders/{orderId}/cancel`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/orders/{orderId}/cancel`
- **Operation ID**: `cancelOrder`
- **Summary**: Printer, Designer Cancel order
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

## notification-controller

### `POST /api/v1/notifications/read`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/notifications/read`
- **Operation ID**: `markAllAsRead`
- **Summary**: mark all notifications as read
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{
  "[key: string]": "string"
}
    ```

---

### `POST /api/v1/notifications/read/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/notifications/read/{id}`
- **Operation ID**: `markAsRead`
- **Summary**: mark a notification as read
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Notification`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "message": "string",
  "category": "string enum: [DESIGN | ORDER | CONVERSATION | DIRECT | PROFILE]",
  "objectId": "string",
  "read": "boolean",
  "readDateTime": "string (date-time)"
}
    ```

---

### `GET /api/v1/notifications`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/notifications`
- **Operation ID**: `getUserNotifications`
- **Summary**: Fetch all notifications for a profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageNotification`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "title": "string",
      "message": "string",
      "category": "string enum: [DESIGN | ORDER | CONVERSATION | DIRECT | PROFILE]",
      "objectId": "string",
      "read": "boolean",
      "readDateTime": "string (date-time)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

## message-controller

### `POST /api/v1/messages/send`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/messages/send`
- **Operation ID**: `sendMessage`
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`Message`)
  ```json
{
  "toProfileId": "integer (int64)",
  "content": "string",
  "caption": "string",
  "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ChatMessage`)
    ```json
{
  "content": "string",
  "caption": "string",
  "sender": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "receiver": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "read": "boolean",
  "readDateTime": "string (date-time)",
  "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
  "messageIdentifier": "string",
  "conversationId": "integer (int64)",
  "conversationName": "string"
}
    ```

---

### `POST /api/v1/messages/send/order/{orderId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/messages/send/order/{orderId}`
- **Operation ID**: `sendMessage_1`
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`Message`)
  ```json
{
  "toProfileId": "integer (int64)",
  "content": "string",
  "caption": "string",
  "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ChatMessage`)
    ```json
{
  "content": "string",
  "caption": "string",
  "sender": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "receiver": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "read": "boolean",
  "readDateTime": "string (date-time)",
  "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
  "messageIdentifier": "string",
  "conversationId": "integer (int64)",
  "conversationName": "string"
}
    ```

---

### `PATCH /api/v1/messages/send/{messageId}/read`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/messages/send/{messageId}/read`
- **Operation ID**: `markMessageAsRead`
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `messageId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

## logistic-controller

### `POST /api/v1/logistics/request`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/logistics/request`
- **Operation ID**: `createLogisticRequest`
- **Summary**: create logistic request
- **Description**: create logistic request
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`LogisticRequestDTO`)
  ```json
{
  "requestType (required)": "string enum: [PICKUP | DELIVERY]",
  "orderId": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LogisticRequest`)
    ```json
{
  "senderName": "string",
  "senderPhoneNumber": "string",
  "senderEmail": "string",
  "senderCity": "string",
  "senderState": "string",
  "senderCountry": "string",
  "senderAddress": "string",
  "senderPostalCode": "string",
  "senderLongitude": "number (double)",
  "senderLatitude": "number (double)",
  "requestType": "string enum: [PICKUP | DELIVERY]",
  "status": "string enum: [PENDING | IN_PROGRESS | DONE]",
  "receiverName": "string",
  "receiverPhoneNumber": "string",
  "receiverEmail": "string",
  "receiverCity": "string",
  "receiverState": "string",
  "receiverCountry": "string",
  "receiverAddress": "string",
  "receiverPostalCode": "string",
  "receiverLongitude": "number (double)",
  "receiverLatitude": "number (double)",
  "orderId": "integer (int64)"
}
    ```

---

## gallery-controller

### `GET /api/v1/gallery`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/gallery`
- **Operation ID**: `getProfileGalleries`
- **Summary**: Get Profile Gallery
- **Description**: Get Profile Gallery
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "profile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "url": "string"
  }
]
    ```

---

### `POST /api/v1/gallery`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/gallery`
- **Operation ID**: `addToGallery`
- **Summary**: Add image to gallery
- **Description**: Add image to gallery
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`GalleryRequest`)
  ```json
{
  "url (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Gallery`)
    ```json
{
  "id": "integer (int64)",
  "image": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "url": "string"
}
    ```

---

### `GET /api/v1/gallery/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/gallery/{id}`
- **Operation ID**: `getGalleryById`
- **Summary**: Get Gallery By Id
- **Description**: Get Gallery By Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Gallery`)
    ```json
{
  "id": "integer (int64)",
  "image": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "url": "string"
}
    ```

---

### `DELETE /api/v1/gallery/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/gallery/{id}`
- **Operation ID**: `removeFromGallery`
- **Summary**: Remove image from gallery
- **Description**: Remove image from gallery
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

## follow-controller

### `POST /api/v1/follow/remove`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/follow/remove`
- **Operation ID**: `unfollowProfile`
- **Summary**: Unfollow Profile
- **Description**: Unfollow Profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`FollowRequest`)
  ```json
{
  "followingProfileId (required)": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `POST /api/v1/follow/add`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/follow/add`
- **Operation ID**: `followProfile`
- **Summary**: Follow Profile
- **Description**: Follow Profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`FollowRequest`)
  ```json
{
  "followingProfileId (required)": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Follow`)
    ```json
{
  "id": "integer (int64)",
  "follower": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "following": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
    ```

---

### `GET /api/v1/follow/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/follow/{profileId}`
- **Operation ID**: `getConnection`
- **Summary**: Get Connection for a Profile
- **Description**: Get Connection (Check if you are following a profile or not)
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ConnectionStatus`)
    ```json
{
  "following": "boolean"
}
    ```

---

## file-controller

### `POST /api/v1/files/single`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/files/single`
- **Operation ID**: `uploadFile`
- **Summary**: Upload single image
- **Description**: Upload single image
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `multipart/form-data`
  ```json
{
  "file (required)": "string (binary)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`FileUpload`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "path": "string",
  "originalFilePath": "string",
  "size": "integer (int64)",
  "contentType": "string",
  "exactHash": "string",
  "perceptualHash": "integer (int64)",
  "url": "string",
  "originalUrl": "string"
}
    ```

---

### `POST /api/v1/files/presigned-url`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/files/presigned-url`
- **Operation ID**: `initiateUpload`
- **Summary**: Initiate presigned URL upload
- **Description**: Generates an S3 presigned URL for direct upload
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`GeneratePresignedUrlRequest`)
  ```json
{
  "fileName (required)": "string",
  "contentType (required)": "string",
  "size (required)": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PresignedUrlResponse`)
    ```json
{
  "presignedUrl": "string",
  "fileKey": "string"
}
    ```

---

### `POST /api/v1/files/presigned-url/bulk`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/files/presigned-url/bulk`
- **Operation ID**: `initiateUploadBulk`
- **Summary**: Initiate bulk presigned URL upload
- **Description**: Generates multiple S3 presigned URLs for direct upload
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json`
  ```json
[
  {
    "fileName (required)": "string",
    "contentType (required)": "string",
    "size (required)": "integer (int64)"
  }
]
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "presignedUrl": "string",
    "fileKey": "string"
  }
]
    ```

---

### `POST /api/v1/files/multi`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/files/multi`
- **Operation ID**: `uploadDesigns`
- **Summary**: Upload multiple images
- **Description**: Upload multiple images
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `files`: `array` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  }
]
    ```

---

### `POST /api/v1/files/complete-upload`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/files/complete-upload`
- **Operation ID**: `completeUpload`
- **Summary**: Complete direct upload
- **Description**: Completes the direct S3 upload block and creates the database file record
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`CompleteUploadRequest`)
  ```json
{
  "fileKey (required)": "string",
  "fileName (required)": "string",
  "contentType (required)": "string",
  "size (required)": "integer (int64)"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`FileUpload`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "path": "string",
  "originalFilePath": "string",
  "size": "integer (int64)",
  "contentType": "string",
  "exactHash": "string",
  "perceptualHash": "integer (int64)",
  "url": "string",
  "originalUrl": "string"
}
    ```

---

### `POST /api/v1/files/complete-upload/bulk`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/files/complete-upload/bulk`
- **Operation ID**: `completeUploadBulk`
- **Summary**: Complete bulk direct upload
- **Description**: Completes multiple direct S3 upload blocks and creates database file records
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json`
  ```json
[
  {
    "fileKey (required)": "string",
    "fileName (required)": "string",
    "contentType (required)": "string",
    "size (required)": "integer (int64)"
  }
]
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  }
]
    ```

---

## custom-design-controller

### `POST /api/v1/custom-designs/order/{orderId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/custom-designs/order/{orderId}`
- **Operation ID**: `uploadCustomDesign`
- **Summary**: create custom designs
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`NewDesignRequest`)
  ```json
{
  "name (required)": "string",
  "frontImageUrl (required)": "string",
  "designImages (required)": [
    "string"
  ],
  "description": "string",
  "printerId": "integer (int64)",
  "openForCustomization": "boolean",
  "amount": "number",
  "mocks (required)": [
    {
      "limitedStatus": "boolean",
      "imageUrl (required)": "string",
      "availableQty": "integer (int64)",
      "name (required)": "string",
      "category (required)": "string",
      "colours": [
        "string"
      ]
    }
  ],
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`CustomDesign`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "description": "string",
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  ],
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "review": {
    "id": "integer (int64)",
    "comment": "string"
  },
  "orderId": "integer (int64)",
  "completed": "boolean",
  "finalDesign": "boolean",
  "amount": "number",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `POST /api/v1/custom-designs/order/{orderId}/designs/{designId}/review`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/custom-designs/order/{orderId}/designs/{designId}/review`
- **Operation ID**: `reviewCustomDesign`
- **Summary**: review custom design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
  - `designId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`CustomDesignReviewDto`)
  ```json
{
  "comment": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`CustomDesign`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "description": "string",
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  ],
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "review": {
    "id": "integer (int64)",
    "comment": "string"
  },
  "orderId": "integer (int64)",
  "completed": "boolean",
  "finalDesign": "boolean",
  "amount": "number",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `GET /api/v1/custom-designs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/custom-designs`
- **Operation ID**: `fetchCompletedCustomDesigns`
- **Summary**: Fetch all completed custom design for customer
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "name": "string",
    "description": "string",
    "designerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designs": [
      {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      }
    ],
    "mocks": [
      {
        "id": "integer (int64)",
        "name": "string",
        "category": "string",
        "limitedStatus": "boolean",
        "image": "object",
        "availableQty": "integer (int64)",
        "colours": [
          "string"
        ],
        "imageUrl": "string"
      }
    ],
    "review": {
      "id": "integer (int64)",
      "comment": "string"
    },
    "orderId": "integer (int64)",
    "completed": "boolean",
    "finalDesign": "boolean",
    "amount": "number",
    "tags": [
      "string"
    ],
    "categories": [
      "string"
    ],
    "imageUrlFront": "string"
  }
]
    ```

---

### `GET /api/v1/custom-designs/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/custom-designs/{id}`
- **Operation ID**: `fetchCompletedCustomDesignById`
- **Summary**: Fetch completed custom design for customer
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`CustomDesign`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "description": "string",
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  ],
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "review": {
    "id": "integer (int64)",
    "comment": "string"
  },
  "orderId": "integer (int64)",
  "completed": "boolean",
  "finalDesign": "boolean",
  "amount": "number",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `DELETE /api/v1/custom-designs/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/custom-designs/{id}`
- **Operation ID**: `deleteCustomDesignById`
- **Summary**: Delete custom design for customer
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{
  "[key: string]": "string"
}
    ```

---

### `GET /api/v1/custom-designs/order/{orderId}/designs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/custom-designs/order/{orderId}/designs`
- **Operation ID**: `fetchAllCustomDesignsByOrderId`
- **Summary**: Fetch all custom design by Order Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "name": "string",
    "description": "string",
    "designerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designs": [
      {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      }
    ],
    "mocks": [
      {
        "id": "integer (int64)",
        "name": "string",
        "category": "string",
        "limitedStatus": "boolean",
        "image": "object",
        "availableQty": "integer (int64)",
        "colours": [
          "string"
        ],
        "imageUrl": "string"
      }
    ],
    "review": {
      "id": "integer (int64)",
      "comment": "string"
    },
    "orderId": "integer (int64)",
    "completed": "boolean",
    "finalDesign": "boolean",
    "amount": "number",
    "tags": [
      "string"
    ],
    "categories": [
      "string"
    ],
    "imageUrlFront": "string"
  }
]
    ```

---

### `GET /api/v1/custom-designs/order/{orderId}/designs/final`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/custom-designs/order/{orderId}/designs/final`
- **Operation ID**: `fetchFinalCustomDesignByOrderId`
- **Summary**: Fetch final custom design by Order Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`CustomDesign`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "description": "string",
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  ],
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "review": {
    "id": "integer (int64)",
    "comment": "string"
  },
  "orderId": "integer (int64)",
  "completed": "boolean",
  "finalDesign": "boolean",
  "amount": "number",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

## cart-controller

### `POST /api/v1/cart-items/{designId}/{mockId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/cart-items/{designId}/{mockId}`
- **Operation ID**: `addToCart`
- **Summary**: customer add to cart or edit cart item
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
  - `mockId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`CartItemDto`)
  ```json
{
  "quantity": "integer (int64)",
  "colour": "string",
  "size": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`CartItem`)
    ```json
{
  "id": "integer (int64)",
  "mock": {
    "id": "integer (int64)",
    "name": "string",
    "category": "string",
    "limitedStatus": "boolean",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "availableQty": "integer (int64)",
    "colours": [
      "string"
    ],
    "imageUrl": "string"
  },
  "quantity": "integer (int64)",
  "colour": "string",
  "size": "string",
  "designId": "integer (int64)",
  "amount": "number"
}
    ```

---

### `GET /api/v1/cart-items`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/cart-items`
- **Operation ID**: `getAllCartItem`
- **Summary**: Get all cart item
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "mock": {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": "object",
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    },
    "quantity": "integer (int64)",
    "colour": "string",
    "size": "string",
    "designId": "integer (int64)",
    "amount": "number"
  }
]
    ```

---

### `DELETE /api/v1/cart-items`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/cart-items`
- **Operation ID**: `emptyCart`
- **Summary**: empty cart
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `DELETE /api/v1/cart-items/{itemId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/cart-items/{itemId}`
- **Operation ID**: `deleteCartItem`
- **Summary**: remove item from cart
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `itemId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

## admin-email-controller

### `POST /api/v1/berry/email`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/email`
- **Operation ID**: `sendEmail`
- **Summary**: Add admin
- **Description**: Add admin
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`SendEmailRequest`)
  ```json
{
  "subject (required)": "string",
  "body (required)": "string",
  "templateId": "string",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "recipients": [
    "string"
  ]
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

## bank-controller

### `POST /api/v1/banks/verify`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/banks/verify`
- **Operation ID**: `verifyAccount`
- **Summary**: Verify bank account
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`VerifyBankAccountRequest`)
  ```json
{
  "accountNumber (required)": "string",
  "bankCode (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `GET /api/v1/banks`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/banks`
- **Operation ID**: `getAllBanks`
- **Summary**: Get all banks
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "name": "string",
    "country": "string",
    "currency": "string",
    "code": "string"
  }
]
    ```

---

## auth-controller

### `POST /api/v1/auth/validate-code/{otp}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/validate-code/{otp}`
- **Operation ID**: `validateCode`
- **Summary**: Validate OTP
- **Description**: Validate if OTP is correct
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `otp`: `string` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BaseRequest`)
  ```json
{
  "email (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `POST /api/v1/auth/reset-password`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/reset-password`
- **Operation ID**: `resetPassword`
- **Summary**: Forget Password - Send OTP
- **Description**: Forget Password - Send OTP
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BaseRequest`)
  ```json
{
  "email (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `PATCH /api/v1/auth/reset-password`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/reset-password`
- **Operation ID**: `completeResetPassword`
- **Summary**: Forget Password - Reset Password
- **Description**: Forget Password - Reset Password
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**:
  - **Content-Type**: `application/json` (`ResetPasswordRequest`)
  ```json
{
  "email (required)": "string",
  "otp (required)": "string",
  "password (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `POST /api/v1/auth/resend-code`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/resend-code`
- **Operation ID**: `resendCode`
- **Summary**: Resend OTP
- **Description**: Resend OTP
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BaseRequest`)
  ```json
{
  "email (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `POST /api/v1/auth/register`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/register`
- **Operation ID**: `userRegistration`
- **Summary**: Register user
- **Description**: Register user
- **Request Headers**:
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`RegistrationRequest`)
  ```json
{
  "name (required)": "string",
  "email (required)": "string",
  "username": "string",
  "businessName": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "password (required)": "string",
  "sendPromotionEmail": "boolean",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "referralCode": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`RegistrationResponse`)
    ```json
{
  "emailVerified": "boolean"
}
    ```

---

### `POST /api/v1/auth/register/google`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/register/google`
- **Operation ID**: `userRegistrationWithGoogle`
- **Summary**: User - Registration with google
- **Request Headers**:
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`SocialReqistrationRequest`)
  ```json
{
  "accessToken (required)": "string",
  "username": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "businessName": "string",
  "sendPromotionEmail": "boolean",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "referralCode": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LoginResponse`)
    ```json
{
  "user": "object",
  "token": "string"
}
    ```

---

### `POST /api/v1/auth/register/facebook`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/register/facebook`
- **Operation ID**: `userRegistrationWithFacebook`
- **Summary**: User - Registration with facebook
- **Request Headers**:
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`SocialReqistrationRequest`)
  ```json
{
  "accessToken (required)": "string",
  "username": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "businessName": "string",
  "sendPromotionEmail": "boolean",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "referralCode": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LoginResponse`)
    ```json
{
  "user": "object",
  "token": "string"
}
    ```

---

### `POST /api/v1/auth/login`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/login`
- **Operation ID**: `login`
- **Summary**: Login to all profile
- **Description**: Login to all profile
- **Request Headers**:
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`LoginRequest`)
  ```json
{
  "email (required)": "string",
  "password (required)": "string",
  "rememberMe": "boolean"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LoginResponse`)
    ```json
{
  "user": "object",
  "token": "string"
}
    ```

---

### `POST /api/v1/auth/login/google`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/login/google`
- **Operation ID**: `loginGoogle`
- **Summary**: User - Login with google
- **Request Headers**:
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`SocialReqistrationRequest`)
  ```json
{
  "accessToken (required)": "string",
  "username": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "businessName": "string",
  "sendPromotionEmail": "boolean",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "referralCode": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LoginResponse`)
    ```json
{
  "user": "object",
  "token": "string"
}
    ```

---

### `POST /api/v1/auth/login/facebook`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/login/facebook`
- **Operation ID**: `loginFacebook`
- **Summary**: User - Login with facebook
- **Request Headers**:
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**:
  - **Content-Type**: `application/json` (`SocialReqistrationRequest`)
  ```json
{
  "accessToken (required)": "string",
  "username": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "businessName": "string",
  "sendPromotionEmail": "boolean",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "referralCode": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LoginResponse`)
    ```json
{
  "user": "object",
  "token": "string"
}
    ```

---

### `PATCH /api/v1/auth/activate/{otp}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/activate/{otp}`
- **Operation ID**: `userActivation`
- **Summary**: Activate Account
- **Description**: Activate Account
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `otp`: `string` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BaseRequest`)
  ```json
{
  "email (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LoginResponse`)
    ```json
{
  "user": "object",
  "token": "string"
}
    ```

---

### `GET /api/v1/auth/status`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/status`
- **Operation ID**: `test`
- **Summary**: Check App Status
- **Description**: Check App Status
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

## admin-auth-controller

### `POST /api/v1/auth/berry/reset-password`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/berry/reset-password`
- **Operation ID**: `resetPassword_1`
- **Summary**: Forget Password - Send OTP
- **Description**: Forget Password - Send OTP
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**:
  - **Content-Type**: `application/json` (`BaseRequest`)
  ```json
{
  "email (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `PATCH /api/v1/auth/berry/reset-password`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/berry/reset-password`
- **Operation ID**: `completeResetPassword_1`
- **Summary**: Forget Password - Reset Password
- **Description**: Forget Password - Reset Password
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**:
  - **Content-Type**: `application/json` (`ResetPasswordRequest`)
  ```json
{
  "email (required)": "string",
  "otp (required)": "string",
  "password (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{}
    ```

---

### `POST /api/v1/auth/berry/register`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/berry/register`
- **Operation ID**: `superAdminRegistration`
- **Summary**: Register user
- **Description**: Register user
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Admin`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "permission": {
    "id": "integer (int64)",
    "canManagerAdmin": "boolean",
    "canManagerUsers": "boolean",
    "canManagerDesigns": "boolean",
    "canManagerOrders": "boolean",
    "canManagerTransactions": "boolean",
    "canManagerPayments": "boolean",
    "canManagerTickets": "boolean",
    "canManagerBlogs": "boolean",
    "canManagerEmails": "boolean",
    "canManagerWallets": "boolean",
    "canManagerLogistics": "boolean"
  },
  "profilePicture": "string",
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ]
}
    ```

---

### `POST /api/v1/auth/berry/login`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/auth/berry/login`
- **Operation ID**: `login_1`
- **Summary**: Admin Login
- **Request Headers**:
  - None required (Public endpoint)
- **Request Payload**:
  - **Content-Type**: `application/json` (`LoginRequest`)
  ```json
{
  "email (required)": "string",
  "password (required)": "string",
  "rememberMe": "boolean"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`LoginResponse`)
    ```json
{
  "user": "object",
  "token": "string"
}
    ```

---

## admin-account-controller

### `PATCH /api/v1/berry/profiles/{profileId}/termination`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/profiles/{profileId}/termination`
- **Operation ID**: `terminateProfile`
- **Summary**: Terminate User profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`ReasonRequest`)
  ```json
{
  "reason (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Profile`)
    ```json
{
  "id": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
  "name": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "bio": "string",
  "reasonForProbation": "string",
  "reasonForTermination": "string",
  "probationDate": "string (date-time)",
  "terminationDate": "string (date-time)",
  "insight": {
    "totalFollowers": "integer (int32)",
    "totalFollowing": "integer (int32)",
    "totalUploads": "integer (int32)",
    "rating": {
      "id": "integer (int64)",
      "total1Star": "integer (int32)",
      "total2Star": "integer (int32)",
      "total3Star": "integer (int32)",
      "total4Star": "integer (int32)",
      "total5Star": "integer (int32)",
      "avgStars": "number (double)"
    },
    "totalEarnings": "number",
    "totalReviews": "integer (int32)",
    "totalCancelledOrders": "integer (int32)",
    "totalCompletedOrders": "integer (int32)",
    "jobSuccessPercentage": "integer (int32)"
  },
  "distanceInKm": "number (double)",
  "userId": "integer (int64)",
  "userName": "string",
  "userEmail": "string",
  "userPhone": "string",
  "coverPic": "string",
  "categories": [
    "string"
  ],
  "profilePic": "string"
}
    ```

---

### `PATCH /api/v1/berry/profiles/{profileId}/probation`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/profiles/{profileId}/probation`
- **Operation ID**: `suspendProfile`
- **Summary**: Suspend User profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`ReasonRequest`)
  ```json
{
  "reason (required)": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Profile`)
    ```json
{
  "id": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
  "name": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "bio": "string",
  "reasonForProbation": "string",
  "reasonForTermination": "string",
  "probationDate": "string (date-time)",
  "terminationDate": "string (date-time)",
  "insight": {
    "totalFollowers": "integer (int32)",
    "totalFollowing": "integer (int32)",
    "totalUploads": "integer (int32)",
    "rating": {
      "id": "integer (int64)",
      "total1Star": "integer (int32)",
      "total2Star": "integer (int32)",
      "total3Star": "integer (int32)",
      "total4Star": "integer (int32)",
      "total5Star": "integer (int32)",
      "avgStars": "number (double)"
    },
    "totalEarnings": "number",
    "totalReviews": "integer (int32)",
    "totalCancelledOrders": "integer (int32)",
    "totalCompletedOrders": "integer (int32)",
    "jobSuccessPercentage": "integer (int32)"
  },
  "distanceInKm": "number (double)",
  "userId": "integer (int64)",
  "userName": "string",
  "userEmail": "string",
  "userPhone": "string",
  "coverPic": "string",
  "categories": [
    "string"
  ],
  "profilePic": "string"
}
    ```

---

### `PATCH /api/v1/berry/profiles/{profileId}/activation`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/profiles/{profileId}/activation`
- **Operation ID**: `activateProfile`
- **Summary**: Terminate User profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Profile`)
    ```json
{
  "id": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
  "name": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "bio": "string",
  "reasonForProbation": "string",
  "reasonForTermination": "string",
  "probationDate": "string (date-time)",
  "terminationDate": "string (date-time)",
  "insight": {
    "totalFollowers": "integer (int32)",
    "totalFollowing": "integer (int32)",
    "totalUploads": "integer (int32)",
    "rating": {
      "id": "integer (int64)",
      "total1Star": "integer (int32)",
      "total2Star": "integer (int32)",
      "total3Star": "integer (int32)",
      "total4Star": "integer (int32)",
      "total5Star": "integer (int32)",
      "avgStars": "number (double)"
    },
    "totalEarnings": "number",
    "totalReviews": "integer (int32)",
    "totalCancelledOrders": "integer (int32)",
    "totalCompletedOrders": "integer (int32)",
    "jobSuccessPercentage": "integer (int32)"
  },
  "distanceInKm": "number (double)",
  "userId": "integer (int64)",
  "userName": "string",
  "userEmail": "string",
  "userPhone": "string",
  "coverPic": "string",
  "categories": [
    "string"
  ],
  "profilePic": "string"
}
    ```

---

### `GET /api/v1/berry/profiles`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/profiles`
- **Operation ID**: `getAllProfiles_1`
- **Summary**: Admin Fetch all profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `profile`: `string` (optional) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
  - `field`: `string` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageProfile`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": {
        "totalFollowers": "integer (int32)",
        "totalFollowing": "integer (int32)",
        "totalUploads": "integer (int32)",
        "rating": "object",
        "totalEarnings": "number",
        "totalReviews": "integer (int32)",
        "totalCancelledOrders": "integer (int32)",
        "totalCompletedOrders": "integer (int32)",
        "jobSuccessPercentage": "integer (int32)"
      },
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/profiles/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/profiles/{profileId}`
- **Operation ID**: `getUserProfile_1`
- **Summary**: Fetch User profile
- **Description**: Fetch User profile
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Profile`)
    ```json
{
  "id": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
  "name": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "bio": "string",
  "reasonForProbation": "string",
  "reasonForTermination": "string",
  "probationDate": "string (date-time)",
  "terminationDate": "string (date-time)",
  "insight": {
    "totalFollowers": "integer (int32)",
    "totalFollowing": "integer (int32)",
    "totalUploads": "integer (int32)",
    "rating": {
      "id": "integer (int64)",
      "total1Star": "integer (int32)",
      "total2Star": "integer (int32)",
      "total3Star": "integer (int32)",
      "total4Star": "integer (int32)",
      "total5Star": "integer (int32)",
      "avgStars": "number (double)"
    },
    "totalEarnings": "number",
    "totalReviews": "integer (int32)",
    "totalCancelledOrders": "integer (int32)",
    "totalCompletedOrders": "integer (int32)",
    "jobSuccessPercentage": "integer (int32)"
  },
  "distanceInKm": "number (double)",
  "userId": "integer (int64)",
  "userName": "string",
  "userEmail": "string",
  "userPhone": "string",
  "coverPic": "string",
  "categories": [
    "string"
  ],
  "profilePic": "string"
}
    ```

---

## admin-dispute-controller

### `PATCH /api/v1/berry/disputes/{id}/close`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/disputes/{id}/close`
- **Operation ID**: `closeDispute`
- **Summary**: Admin Close Dispute
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Dispute`)
    ```json
{
  "id": "integer (int64)",
  "disputeId": "string",
  "comment": "string",
  "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
  "status": "string enum: [CLOSED | OPEN]",
  "ticketCreated": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "order": {
    "id": "integer (int64)",
    "title": "string",
    "description": "string",
    "printingAmount": "number",
    "designAmount": "number",
    "pickupAmount": "number",
    "deliveryAmount": "number",
    "totalAmount": "number",
    "paid": "boolean",
    "transactionRef": "string",
    "paymentUrl": "string",
    "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
    "itemProvidedByCustomer": "boolean",
    "deliveryDate": "string (date)",
    "orderRequest": {
      "id": "integer (int64)",
      "printRequest": "object",
      "customerProfile": "object",
      "customDesignRequest": "object",
      "orderType": "string enum: [PRINT | DESIGN]",
      "budgetAmount": "number",
      "dateOfDelivery": "string (date)",
      "providerProfile": "object",
      "conversationId": "string"
    },
    "noOfReviews": "integer (int64)",
    "canceledByCustomer": "boolean",
    "amountPaidToProvider": "number",
    "amountPaidForDesign": "number",
    "ref": "string"
  },
  "closedDate": "string (date-time)"
}
    ```

---

### `GET /api/v1/berry/disputes`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/disputes`
- **Operation ID**: `getAllDisputes`
- **Summary**: Admin Fetch all Disputes
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `disputeType`: `string` (optional) — enum: `[PAYMENT_ISSUES, UNRESPONSIVE_VENDOR, FRAUDULENT_ACT, VIOLATION_OF_TERMS]`
  - `disputeId`: `string` (optional)
  - `transactionId`: `string` (optional)
  - `status`: `string` (optional) — enum: `[CLOSED, OPEN]`
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageDispute`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "disputeId": "string",
      "comment": "string",
      "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
      "status": "string enum: [CLOSED | OPEN]",
      "ticketCreated": "boolean",
      "customerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "order": {
        "id": "integer (int64)",
        "title": "string",
        "description": "string",
        "printingAmount": "number",
        "designAmount": "number",
        "pickupAmount": "number",
        "deliveryAmount": "number",
        "totalAmount": "number",
        "paid": "boolean",
        "transactionRef": "string",
        "paymentUrl": "string",
        "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
        "itemProvidedByCustomer": "boolean",
        "deliveryDate": "string (date)",
        "orderRequest": "object",
        "noOfReviews": "integer (int64)",
        "canceledByCustomer": "boolean",
        "amountPaidToProvider": "number",
        "amountPaidForDesign": "number",
        "ref": "string"
      },
      "closedDate": "string (date-time)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/disputes/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/disputes/{id}`
- **Operation ID**: `getDisputeById`
- **Summary**: Admin Dispute By Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Dispute`)
    ```json
{
  "id": "integer (int64)",
  "disputeId": "string",
  "comment": "string",
  "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
  "status": "string enum: [CLOSED | OPEN]",
  "ticketCreated": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "order": {
    "id": "integer (int64)",
    "title": "string",
    "description": "string",
    "printingAmount": "number",
    "designAmount": "number",
    "pickupAmount": "number",
    "deliveryAmount": "number",
    "totalAmount": "number",
    "paid": "boolean",
    "transactionRef": "string",
    "paymentUrl": "string",
    "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
    "itemProvidedByCustomer": "boolean",
    "deliveryDate": "string (date)",
    "orderRequest": {
      "id": "integer (int64)",
      "printRequest": "object",
      "customerProfile": "object",
      "customDesignRequest": "object",
      "orderType": "string enum: [PRINT | DESIGN]",
      "budgetAmount": "number",
      "dateOfDelivery": "string (date)",
      "providerProfile": "object",
      "conversationId": "string"
    },
    "noOfReviews": "integer (int64)",
    "canceledByCustomer": "boolean",
    "amountPaidToProvider": "number",
    "amountPaidForDesign": "number",
    "ref": "string"
  },
  "closedDate": "string (date-time)"
}
    ```

---

## admin-design-controller

### `PATCH /api/v1/berry/designs/{id}/review`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/designs/{id}/review`
- **Operation ID**: `adminAcceptOrRejectDesign`
- **Summary**: Review Design
- **Description**: Accept or Reject Design
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**:
  - **Content-Type**: `application/json` (`AdminReviewDesignRequest`)
  ```json
{
  "approved": "boolean",
  "comment": "string"
}
  ```
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `GET /api/v1/berry/designs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/designs`
- **Operation ID**: `adminFetchAllDesign`
- **Summary**: Fetch all Designs
- **Description**: Fetch all Designs with filter options
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `status`: `string` (optional) — enum: `[APPROVED, DECLINED, AWAITING_APPROVAL]`
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageDesign`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/designs/{id}/uploads`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/designs/{id}/uploads`
- **Operation ID**: `adminFetchDesignUploads`
- **Summary**: Fetch Design Upload by ID
- **Description**: Fetch Design Upload by ID
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "fileUpload": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  }
]
    ```

---

## users-controller

### `GET /api/v1/users`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/users`
- **Operation ID**: `getAllUser`
- **Summary**: Get all users
- **Description**: Get all users
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageUser`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "email": "string",
      "phoneNumber": "string",
      "areaCode": "string",
      "referralCode": "string",
      "gender": "string enum: [FEMALE | MALE]",
      "enabled": "boolean",
      "activated": "boolean",
      "lastLoginDate": "string (date-time)",
      "lastPasswordResetDate": "string (date-time)",
      "updateAddress": "boolean",
      "customerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "designerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "roles": [
        "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
      ],
      "designInterests": [
        "string"
      ]
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/users/{userId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/users/{userId}`
- **Operation ID**: `getUserById`
- **Summary**: Get user by id
- **Description**: Get user by id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `userId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`User`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
    ```

---

## transaction-controller

### `GET /api/v1/transactions`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/transactions`
- **Operation ID**: `fetchAllTransactions`
- **Summary**: Fetch all logged in  profile transactions
- **Description**: Fetch all logged in profile transactions
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageTransaction`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "orderId": "integer (int64)",
      "intTransactionRef": "string",
      "extTransactionRef": "string",
      "status": "string enum: [SUCCESS | FAILED | PENDING]",
      "paymentProvider": "string enum: [PAYSTACK | FLUTTERWAVE]",
      "amount": "number",
      "userProfileId": "integer (int64)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/transactions/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/transactions/{id}`
- **Operation ID**: `userFetchTransactionById`
- **Summary**: Fetch all logged in  user transactions
- **Description**: Fetch all logged in user transactions
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Transaction`)
    ```json
{
  "id": "integer (int64)",
  "orderId": "integer (int64)",
  "intTransactionRef": "string",
  "extTransactionRef": "string",
  "status": "string enum: [SUCCESS | FAILED | PENDING]",
  "paymentProvider": "string enum: [PAYSTACK | FLUTTERWAVE]",
  "amount": "number",
  "userProfileId": "integer (int64)"
}
    ```

---

## public-rating-controller

### `GET /api/v1/public/ratings/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/ratings/{profileId}`
- **Operation ID**: `getFollowersForProfile`
- **Summary**: Get Profile Rating
- **Description**: Get Profile Rating
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
{
  "[key: string]": {}
}
    ```

---

## public-profile-controller

### `GET /api/v1/public/profile`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/profile`
- **Operation ID**: `getAllProfiles`
- **Summary**: Fetch all profile filter by profile type
- **Description**: Fetch design by Id
- **Request Headers**:
  - None required (Public endpoint)
- **Query Parameters**:
  - `profile`: `string` (required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
  - `latitude`: `number (double)` (optional)
  - `longitude`: `number (double)` (optional)
  - `name`: `string` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageProfile`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": {
        "totalFollowers": "integer (int32)",
        "totalFollowing": "integer (int32)",
        "totalUploads": "integer (int32)",
        "rating": "object",
        "totalEarnings": "number",
        "totalReviews": "integer (int32)",
        "totalCancelledOrders": "integer (int32)",
        "totalCompletedOrders": "integer (int32)",
        "jobSuccessPercentage": "integer (int32)"
      },
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/public/profile/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/profile/{profileId}`
- **Operation ID**: `getUserProfile`
- **Summary**: Fetch User profile
- **Description**: Fetch User profile
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Profile`)
    ```json
{
  "id": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
  "name": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "bio": "string",
  "reasonForProbation": "string",
  "reasonForTermination": "string",
  "probationDate": "string (date-time)",
  "terminationDate": "string (date-time)",
  "insight": {
    "totalFollowers": "integer (int32)",
    "totalFollowing": "integer (int32)",
    "totalUploads": "integer (int32)",
    "rating": {
      "id": "integer (int64)",
      "total1Star": "integer (int32)",
      "total2Star": "integer (int32)",
      "total3Star": "integer (int32)",
      "total4Star": "integer (int32)",
      "total5Star": "integer (int32)",
      "avgStars": "number (double)"
    },
    "totalEarnings": "number",
    "totalReviews": "integer (int32)",
    "totalCancelledOrders": "integer (int32)",
    "totalCompletedOrders": "integer (int32)",
    "jobSuccessPercentage": "integer (int32)"
  },
  "distanceInKm": "number (double)",
  "userId": "integer (int64)",
  "userName": "string",
  "userEmail": "string",
  "userPhone": "string",
  "coverPic": "string",
  "categories": [
    "string"
  ],
  "profilePic": "string"
}
    ```

---

## public-follow-controller

### `GET /api/v1/public/follows/following/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/follows/following/{profileId}`
- **Operation ID**: `getFollowingsForProfile`
- **Summary**: Get Followings For Profile
- **Description**: Get Followings For Profile
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
]
    ```

---

### `GET /api/v1/public/follows/follower/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/follows/follower/{profileId}`
- **Operation ID**: `getFollowersForProfile_1`
- **Summary**: Get Followers For Profile
- **Description**: Get Followers For Profile
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
]
    ```

---

## public-design-controller

### `GET /api/v1/public/designs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/designs`
- **Operation ID**: `fetchAllDesigns`
- **Summary**: Fetch all designs
- **Description**: Fetch all designs
- **Request Headers**:
  - None required (Public endpoint)
- **Query Parameters**:
  - `designer`: `integer (int64)` (optional)
  - `tags`: `string` (optional)
  - `designCategories`: `string` (optional)
  - `mockName`: `string` (optional)
  - `mockCategory`: `string` (optional)
  - `upperPriceRange`: `integer (int32)` (optional)
  - `lowerPriceRange`: `integer (int32)` (optional)
  - `searchField`: `string` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageDesign`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/public/designs/{designId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/designs/{designId}`
- **Operation ID**: `fetchDesignById`
- **Summary**: Fetch design by Id
- **Description**: Fetch design by Id
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

### `GET /api/v1/public/designs/slug/{slug}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/designs/slug/{slug}`
- **Operation ID**: `getDesignBySlug`
- **Summary**: Fetch design by slug
- **Description**: Fetch design by slug
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `slug`: `string` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Design`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
    ```

---

## public-collection-controller

### `GET /api/v1/public/collections`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/collections`
- **Operation ID**: `fetchAllCollections`
- **Summary**: Fetch all collections
- **Description**: Fetch all collections
- **Request Headers**:
  - None required (Public endpoint)
- **Query Parameters**:
  - `designer`: `integer (int64)` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `application/json` (`PageCollection`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "slug": "string",
      "description": "string",
      "designs": [
        {
          "id": "integer (int64)",
          "name": "string",
          "coverImage": "object",
          "description": "string",
          "slug": "string",
          "designer": "object",
          "printer": "object",
          "mocks": [
            "object"
          ],
          "amount": "number",
          "approved": "boolean",
          "openForCustomization": "boolean",
          "reasonForRejection": "string",
          "designIsLiked": "boolean",
          "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
          "tags": [
            "object"
          ],
          "categories": [
            "object"
          ],
          "imageUrlFront": "string"
        }
      ],
      "picture": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/public/collections/{collectionId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/collections/{collectionId}`
- **Operation ID**: `getCollectionById`
- **Summary**: Get Collection By Id
- **Description**: Get Collection By Id
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `collectionId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Collection`)
    ```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "slug": "string",
  "description": "string",
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "object"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "picture": "string"
}
    ```

---

### `GET /api/v1/public/collections/{collectionId}/designs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/collections/{collectionId}/designs`
- **Operation ID**: `getCollectionDesigns`
- **Summary**: Get Collection Designs
- **Description**: Get Collection Designs
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `collectionId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "name": "string",
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "description": "string",
    "slug": "string",
    "designer": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "printer": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "mocks": [
      {
        "id": "integer (int64)",
        "name": "string",
        "category": "string",
        "limitedStatus": "boolean",
        "image": "object",
        "availableQty": "integer (int64)",
        "colours": [
          "string"
        ],
        "imageUrl": "string"
      }
    ],
    "amount": "number",
    "approved": "boolean",
    "openForCustomization": "boolean",
    "reasonForRejection": "string",
    "designIsLiked": "boolean",
    "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
    "tags": [
      "string"
    ],
    "categories": [
      "string"
    ],
    "imageUrlFront": "string"
  }
]
    ```

---

## public-blog-controller

### `GET /api/v1/public/blogs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/blogs`
- **Operation ID**: `fetchAllEnabledBlogs`
- **Summary**: Fetch all Enabled Blogs
- **Description**: Fetch all Enabled Blogs
- **Request Headers**:
  - None required (Public endpoint)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageBlog`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "slug": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "title": "string",
      "category": "string",
      "details": "string",
      "description": "string",
      "enabled": "boolean",
      "tags": [
        "string"
      ],
      "keywords": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/public/blogs/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/blogs/{id}`
- **Operation ID**: `fetchEnabledBlogById`
- **Summary**: Get Enabled Blog By Id
- **Description**: Get Enabled blog by id
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Blog`)
    ```json
{
  "id": "integer (int64)",
  "slug": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "title": "string",
  "category": "string",
  "details": "string",
  "description": "string",
  "enabled": "boolean",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

### `GET /api/v1/public/blogs/slug/{slug}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/public/blogs/slug/{slug}`
- **Operation ID**: `fetchEnabledBlogBySlug`
- **Summary**: Get Enabled Blog by slug
- **Description**: Get Enabled Blog by slug
- **Request Headers**:
  - None required (Public endpoint)
- **Path Parameters**:
  - `slug`: `string` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Blog`)
    ```json
{
  "id": "integer (int64)",
  "slug": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "title": "string",
  "category": "string",
  "details": "string",
  "description": "string",
  "enabled": "boolean",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "imageUrl": "string"
}
    ```

---

## insight-controller

### `GET /api/v1/insights/profile/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/insights/profile/{id}`
- **Operation ID**: `getProfileInsights`
- **Summary**: Get profile insights
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ProfileInsightResponse`)
    ```json
{
  "totalFollowers": "integer (int32)",
  "totalFollowing": "integer (int32)",
  "totalUploads": "integer (int32)",
  "rating": {
    "id": "integer (int64)",
    "total1Star": "integer (int32)",
    "total2Star": "integer (int32)",
    "total3Star": "integer (int32)",
    "total4Star": "integer (int32)",
    "total5Star": "integer (int32)",
    "avgStars": "number (double)"
  },
  "totalEarnings": "number",
  "totalReviews": "integer (int32)",
  "totalCancelledOrders": "integer (int32)",
  "totalCompletedOrders": "integer (int32)",
  "jobSuccessPercentage": "integer (int32)"
}
    ```

---

### `GET /api/v1/insights/activity-pie-chart`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/insights/activity-pie-chart`
- **Operation ID**: `getPaymentChartData`
- **Summary**: Get Order Bar graph data
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PieChartResponse`)
    ```json
{
  "data": [
    {
      "type": "string",
      "count": "integer (int64)"
    }
  ]
}
    ```

---

### `GET /api/v1/insights/activity-bar-graph`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/insights/activity-bar-graph`
- **Operation ID**: `getProfileOrderChartData`
- **Summary**: Get Order Bar graph data
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Query Parameters**:
  - `interval`: `string` (required) — enum: `[DAILY, WEEKLY, MONTHLY]`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "key": "string (date-time)",
    "data": [
      {
        "type": "string",
        "count": "integer (int64)"
      }
    ]
  }
]
    ```

---

## fee-controller

### `GET /api/v1/fees`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/fees`
- **Operation ID**: `getFee`
- **Summary**: Temporary Get Fee
- **Description**: Temporary Get Fee
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Fee`)
    ```json
{
  "amount": "number"
}
    ```

---

## conversation-controller

### `GET /api/v1/conversations`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/conversations`
- **Operation ID**: `fetchAllConversations`
- **Summary**: Fetch All Conversations
- **Description**: Fetch All Conversations
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "conversationName": "string",
    "type": "string enum: [INDIVIDUAL | ORDER]",
    "hasUnreadMessages": "boolean",
    "unreadMessageCount": "integer (int32)",
    "lastMessageTimestamp": "string (date-time)",
    "participants": [
      {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      }
    ],
    "lastMessage": {
      "content": "string",
      "caption": "string",
      "sender": "object",
      "receiver": "object",
      "read": "boolean",
      "readDateTime": "string (date-time)",
      "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
      "messageIdentifier": "string",
      "conversationId": "integer (int64)",
      "conversationName": "string"
    }
  }
]
    ```

---

### `GET /api/v1/conversations/{conversationId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/conversations/{conversationId}`
- **Operation ID**: `fetchConversationById`
- **Summary**: Fetch Conversation By Id
- **Description**: Fetch Conversation By Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `conversationId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Conversation`)
    ```json
{
  "id": "integer (int64)",
  "conversationName": "string",
  "type": "string enum: [INDIVIDUAL | ORDER]",
  "hasUnreadMessages": "boolean",
  "unreadMessageCount": "integer (int32)",
  "lastMessageTimestamp": "string (date-time)",
  "participants": [
    {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": {
        "totalFollowers": "integer (int32)",
        "totalFollowing": "integer (int32)",
        "totalUploads": "integer (int32)",
        "rating": "object",
        "totalEarnings": "number",
        "totalReviews": "integer (int32)",
        "totalCancelledOrders": "integer (int32)",
        "totalCompletedOrders": "integer (int32)",
        "jobSuccessPercentage": "integer (int32)"
      },
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  ],
  "lastMessage": {
    "content": "string",
    "caption": "string",
    "sender": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "receiver": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "read": "boolean",
    "readDateTime": "string (date-time)",
    "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
    "messageIdentifier": "string",
    "conversationId": "integer (int64)",
    "conversationName": "string"
  }
}
    ```

---

### `GET /api/v1/conversations/{conversationId}/messages`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/conversations/{conversationId}/messages`
- **Operation ID**: `fetchConversationMessages`
- **Summary**: Fetch Conversation Messages
- **Description**: Fetch Conversation Messages
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `conversationId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "content": "string",
    "caption": "string",
    "sender": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "receiver": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "read": "boolean",
    "readDateTime": "string (date-time)",
    "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
    "messageIdentifier": "string",
    "conversationId": "integer (int64)",
    "conversationName": "string"
  }
]
    ```

---

### `GET /api/v1/conversations/profiles/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/conversations/profiles/{profileId}`
- **Operation ID**: `fetchConversationByProfileId`
- **Summary**: Fetch Conversation By Profile Id
- **Description**: Fetch Conversation By Profile Id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Conversation`)
    ```json
{
  "id": "integer (int64)",
  "conversationName": "string",
  "type": "string enum: [INDIVIDUAL | ORDER]",
  "hasUnreadMessages": "boolean",
  "unreadMessageCount": "integer (int32)",
  "lastMessageTimestamp": "string (date-time)",
  "participants": [
    {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": {
        "totalFollowers": "integer (int32)",
        "totalFollowing": "integer (int32)",
        "totalUploads": "integer (int32)",
        "rating": "object",
        "totalEarnings": "number",
        "totalReviews": "integer (int32)",
        "totalCancelledOrders": "integer (int32)",
        "totalCompletedOrders": "integer (int32)",
        "jobSuccessPercentage": "integer (int32)"
      },
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  ],
  "lastMessage": {
    "content": "string",
    "caption": "string",
    "sender": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "receiver": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "read": "boolean",
    "readDateTime": "string (date-time)",
    "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
    "messageIdentifier": "string",
    "conversationId": "integer (int64)",
    "conversationName": "string"
  }
}
    ```

---

### `GET /api/v1/conversations/profiles/{profileId}/messages`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/conversations/profiles/{profileId}/messages`
- **Operation ID**: `fetchConversationMessagesByProfile`
- **Summary**: Fetch Conversation Messages By Profile
- **Description**: Fetch Conversation Messages
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "content": "string",
    "caption": "string",
    "sender": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "receiver": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "read": "boolean",
    "readDateTime": "string (date-time)",
    "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
    "messageIdentifier": "string",
    "conversationId": "integer (int64)",
    "conversationName": "string"
  }
]
    ```

---

### `GET /api/v1/conversations/order/{orderId}/messages`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/conversations/order/{orderId}/messages`
- **Operation ID**: `fetchOrderIdMessages`
- **Summary**: Fetch Conversation Messages
- **Description**: Fetch Conversation Messages
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
  - `profileType` (`string`, required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "content": "string",
    "caption": "string",
    "sender": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "receiver": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "read": "boolean",
    "readDateTime": "string (date-time)",
    "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
    "messageIdentifier": "string",
    "conversationId": "integer (int64)",
    "conversationName": "string"
  }
]
    ```

---

## admin-wallet-controller

### `GET /api/v1/berry/wallets`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/wallets`
- **Operation ID**: `wallets`
- **Summary**: Fetch all wallets
- **Description**: Fetch All wallets
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `profileType`: `string` (required) — enum: `[CUSTOMER, DESIGNER, PRINTER]`
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageWallet`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "amount": "number",
      "profile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "object"
        ],
        "profilePic": "string"
      }
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/wallets/{walletId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/wallets/{walletId}`
- **Operation ID**: `adminGetWalletById`
- **Summary**: Admin get wallet by wallet id
- **Description**: Admin get wallet by wallet id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `walletId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Wallet`)
    ```json
{
  "id": "integer (int64)",
  "amount": "number",
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
    ```

---

### `GET /api/v1/berry/wallets/{walletId}/histories`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/wallets/{walletId}/histories`
- **Operation ID**: `adminGetWalletHistoriesByWalletId`
- **Summary**: Admin get wallet histories by wallet id
- **Description**: Admin get wallet histories by wallet id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `walletId`: `integer (int64)` (required)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageWalletHistory`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "amount": "number",
      "transactionType": "string enum: [CREDIT | DEBIT | REFUND]",
      "status": "string enum: [SUCCESS | FAILED | PENDING]",
      "transactionReference": "string",
      "accountDetails": {
        "bankName": "string",
        "bankCode": "string",
        "accountName": "string",
        "accountNumber": "string"
      }
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/wallets/profiles/{profileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/wallets/profiles/{profileId}`
- **Operation ID**: `adminGetWalletByProfileId`
- **Summary**: Admin get wallet by profile id
- **Description**: Admin get wallet by wallet id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `profileId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Wallet`)
    ```json
{
  "id": "integer (int64)",
  "amount": "number",
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
    ```

---

## admin-transaction-controller

### `GET /api/v1/berry/transactions`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/transactions`
- **Operation ID**: `adminFetchAllTransactions`
- **Summary**: Fetch all transactions
- **Description**: Fetch All transactions
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `profileId`: `integer (int64)` (optional)
  - `status`: `string` (optional) — enum: `[SUCCESS, FAILED, PENDING]`
  - `searchField`: `string` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageTransaction`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "orderId": "integer (int64)",
      "intTransactionRef": "string",
      "extTransactionRef": "string",
      "status": "string enum: [SUCCESS | FAILED | PENDING]",
      "paymentProvider": "string enum: [PAYSTACK | FLUTTERWAVE]",
      "amount": "number",
      "userProfileId": "integer (int64)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/transactions/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/transactions/{id}`
- **Operation ID**: `adminFetchTransactionById`
- **Summary**: Fetch all transactions
- **Description**: Fetch All transactions
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Transaction`)
    ```json
{
  "id": "integer (int64)",
  "orderId": "integer (int64)",
  "intTransactionRef": "string",
  "extTransactionRef": "string",
  "status": "string enum: [SUCCESS | FAILED | PENDING]",
  "paymentProvider": "string enum: [PAYSTACK | FLUTTERWAVE]",
  "amount": "number",
  "userProfileId": "integer (int64)"
}
    ```

---

## file-similarity-controller

### `GET /api/v1/berry/similarity/files/{fileId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/similarity/files/{fileId}`
- **Operation ID**: `getSimilarFiles`
- **Summary**: Find similar raw files
- **Description**: Returns a list of FileUpload entities that are visually similar to the given file ID based on Hamming Distance.
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `fileId`: `integer (int64)` (required)
- **Query Parameters**:
  - `threshold`: `string` (optional) — default: `10`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: Successfully retrieved similar files
    - **Content-Type**: `*/*`
    ```json
[
  {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  }
]
    ```
  - **Status `404`**: Original file not found

---

### `GET /api/v1/berry/similarity/files/{fileId}/score`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/similarity/files/{fileId}/score`
- **Operation ID**: `getSimilarFilesWithScores`
- **Summary**: Find similar files with distance scores
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `fileId`: `integer (int64)` (required)
- **Query Parameters**:
  - `threshold`: `integer (int32)` (optional) — default: `10`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "fileUpload": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "distance": "integer (int32)",
    "percentageMatch": "number (double)"
  }
]
    ```

---

### `GET /api/v1/berry/similarity/design/{designId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/similarity/design/{designId}`
- **Operation ID**: `getSimilarDesigns`
- **Summary**: Find similar Design
- **Description**: Search specifically within the Design context.
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designId`: `integer (int64)` (required)
- **Query Parameters**:
  - `threshold`: `string` (optional) — default: `10`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: Successfully retrieved similar designs
    - **Content-Type**: `*/*`
    ```json
[
  {
    "designId": "integer (int64)",
    "designUploadId": "integer (int64)",
    "fileUpload": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "percentageMatch": "number (double)",
    "designName": "string",
    "description": "string",
    "amount": "number"
  }
]
    ```
  - **Status `404`**: Design upload not found

---

### `GET /api/v1/berry/similarity/design-upload/{designUploadId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/similarity/design-upload/{designUploadId}`
- **Operation ID**: `findSimilarDesignsForDesignUploads`
- **Summary**: Find similar Design Uploads
- **Description**: Search specifically within the Design context. Joins FileUpload and DesignUpload tables to return similar designs.
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `designUploadId`: `integer (int64)` (required)
- **Query Parameters**:
  - `threshold`: `string` (optional) — default: `10`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: Successfully retrieved similar designs
    - **Content-Type**: `*/*`
    ```json
[
  {
    "designId": "integer (int64)",
    "designUploadId": "integer (int64)",
    "fileUpload": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "percentageMatch": "number (double)",
    "designName": "string",
    "description": "string",
    "amount": "number"
  }
]
    ```
  - **Status `404`**: Design upload not found

---

## admin-order-controller

### `GET /api/v1/berry/orders`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/orders`
- **Operation ID**: `fetchAllOrders_1`
- **Summary**: fetch all orders present
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `orderStatus`: `string` (optional) — enum: `[REVIEW, REJECTED, ACTIVE, CANCELLED, AWAITING_CONFIRMATION, COMPLETED, PICKUP_REQUESTED, DELIVER_REQUESTED]`
  - `startDate`: `string (date)` (optional)
  - `endDate`: `string (date)` (optional)
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageOrder`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": {
        "id": "integer (int64)",
        "printRequest": "object",
        "customerProfile": "object",
        "customDesignRequest": "object",
        "orderType": "string enum: [PRINT | DESIGN]",
        "budgetAmount": "number",
        "dateOfDelivery": "string (date)",
        "providerProfile": "object",
        "conversationId": "string"
      },
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/orders/{orderId}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/orders/{orderId}`
- **Operation ID**: `fetchOrderById_1`
- **Summary**: fetch order by id
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `orderId`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`Order`)
    ```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "object"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "object"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
    ```

---

## admin-insight-controller

### `GET /api/v1/berry/insights/profile/{id}`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/insights/profile/{id}`
- **Operation ID**: `getProfileInsights_1`
- **Summary**: Get profile insights
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Path Parameters**:
  - `id`: `integer (int64)` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`ProfileInsightResponse`)
    ```json
{
  "totalFollowers": "integer (int32)",
  "totalFollowing": "integer (int32)",
  "totalUploads": "integer (int32)",
  "rating": {
    "id": "integer (int64)",
    "total1Star": "integer (int32)",
    "total2Star": "integer (int32)",
    "total3Star": "integer (int32)",
    "total4Star": "integer (int32)",
    "total5Star": "integer (int32)",
    "avgStars": "number (double)"
  },
  "totalEarnings": "number",
  "totalReviews": "integer (int32)",
  "totalCancelledOrders": "integer (int32)",
  "totalCompletedOrders": "integer (int32)",
  "jobSuccessPercentage": "integer (int32)"
}
    ```

---

### `GET /api/v1/berry/insights/dispute`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/insights/dispute`
- **Operation ID**: `getDisputeInsights`
- **Summary**: Get Dispute insights
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`DisputeInsightResponse`)
    ```json
{
  "pendingDisputeCount": "object"
}
    ```

---

### `GET /api/v1/berry/insights/dashboard`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/insights/dashboard`
- **Operation ID**: `getDashboardInsights`
- **Summary**: Get Dashboard insights
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`DashboardInsightResponse`)
    ```json
{
  "totalUsers": "integer (int64)",
  "totalNewUsers": "integer (int64)",
  "totalOrders": "integer (int64)",
  "totalNewOrders": "integer (int64)",
  "totalDesigns": "integer (int64)",
  "totalNewDesigns": "integer (int64)",
  "retentionRate": "integer (int64)",
  "avgUserActivePerDay": "integer (int32)",
  "avgUserActivePerWeek": "integer (int32)"
}
    ```

---

### `GET /api/v1/berry/insights/activity-logs`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/insights/activity-logs`
- **Operation ID**: `getActivityLogs`
- **Summary**: Get Activity logs
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `pageable` (`Pageable`, required): `{"page":"integer (int32)","size":"integer (int32)","sort":["string"]}`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*` (`PageAuditLog`)
    ```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "actorId": "integer (int64)",
      "actorProfileId": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "type": "string enum: [ADMIN_LOGIN | ADMIN_ACCOUNT_CREATION | ADMIN_ACCOUNT_UPDATE | ADMIN_PASSWORD_RESET | BLOG_CREATION | BLOG_UPDATE | BLOG_DELETE | ADD_TO_CART | REMOVE_FROM_CART | CREATE_COLLECTION | UPDATE_COLLECTION | DELETE_COLLECTION | DESIGN_ORDER_REQUEST | PRINT_ORDER_REQUEST | USER_REGISTRATION | USER_LOGIN | USER_ACCOUNT_ACTIVATION | USER_GOOGLE_REGISTRATION | USER_GOOGLE_LOGIN | USER_FACEBOOK_REGISTRATION | USER_FACEBOOK_LOGIN | USER_RESET_PASSWORD | USER_CHANGE_PASSWORD | USER_UPDATE | CREATE_DESIGN | UPDATE_DESIGN | DELETE_DESIGN | APPROVE_DESIGN | DECLINE_DESIGN | LIKE_DESIGN | UNLIKE_DESIGN | CREATE_ORDER | CANCEL_ORDER | TRANSACTION | FOLLOW_PROFILE | UNFOLLOW_PROFILE | DISPUTE_CREATED | DISPUTE_CLOSED | ORDER_CREATED | ORDER_CANCELLED | ORDER_REJECTED | ORDER_DELIVERED | ORDER_COMPLETED | PROFILE_CREATED | PROFILE_UPDATED | PROFILE_SUSPENDED | PROFILE_DEACTIVATED | PROFILE_REACTIVATED | PROFILE_RATE | TICKET_CREATED | TICKET_UPDATED | TICKET_CLOSED]",
      "productId": "integer (int64)",
      "ipAddress": "string",
      "location": "string",
      "userAgent": "string",
      "browserType": "string",
      "userIsAdmin": "boolean"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
    ```

---

### `GET /api/v1/berry/insights/activity-line-graph`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/insights/activity-line-graph`
- **Operation ID**: `getUserActivityByInterval`
- **Summary**: Get Activity line graph data
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `interval`: `string` (required) — enum: `[DAILY, WEEKLY, MONTHLY]`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "key": "string enum: [ADMIN_LOGIN | ADMIN_ACCOUNT_CREATION | ADMIN_ACCOUNT_UPDATE | ADMIN_PASSWORD_RESET | BLOG_CREATION | BLOG_UPDATE | BLOG_DELETE | ADD_TO_CART | REMOVE_FROM_CART | CREATE_COLLECTION | UPDATE_COLLECTION | DELETE_COLLECTION | DESIGN_ORDER_REQUEST | PRINT_ORDER_REQUEST | USER_REGISTRATION | USER_LOGIN | USER_ACCOUNT_ACTIVATION | USER_GOOGLE_REGISTRATION | USER_GOOGLE_LOGIN | USER_FACEBOOK_REGISTRATION | USER_FACEBOOK_LOGIN | USER_RESET_PASSWORD | USER_CHANGE_PASSWORD | USER_UPDATE | CREATE_DESIGN | UPDATE_DESIGN | DELETE_DESIGN | APPROVE_DESIGN | DECLINE_DESIGN | LIKE_DESIGN | UNLIKE_DESIGN | CREATE_ORDER | CANCEL_ORDER | TRANSACTION | FOLLOW_PROFILE | UNFOLLOW_PROFILE | DISPUTE_CREATED | DISPUTE_CLOSED | ORDER_CREATED | ORDER_CANCELLED | ORDER_REJECTED | ORDER_DELIVERED | ORDER_COMPLETED | PROFILE_CREATED | PROFILE_UPDATED | PROFILE_SUSPENDED | PROFILE_DEACTIVATED | PROFILE_REACTIVATED | PROFILE_RATE | TICKET_CREATED | TICKET_UPDATED | TICKET_CLOSED]",
    "counts": [
      {
        "count": "integer (int64)",
        "date": "string (date-time)"
      }
    ]
  }
]
    ```

---

### `GET /api/v1/berry/insights/activity-bar-graph`

- **Full URL**: `https://berrystamp-backend-production.up.railway.app/api/v1/berry/insights/activity-bar-graph`
- **Operation ID**: `getUserActivityByRating`
- **Summary**: Get review Bar graph data
- **Request Headers**:
  - `Authorization`: `Bearer <JWT>` (required)
- **Query Parameters**:
  - `interval`: `string` (required) — enum: `[DAILY, WEEKLY, MONTHLY]`
  - `activityType`: `string` (required) — enum: `[ORDER, REVIEW]`
- **Request Payload**: None
- **Responses**:
  - **Status `200`**: OK
    - **Content-Type**: `*/*`
    ```json
[
  {
    "key": "string (date-time)",
    "data": [
      {
        "type": "string",
        "count": "integer (int64)"
      }
    ]
  }
]
    ```

---

## Component Schemas Reference

### `UpdateUserRequest`
```json
{
  "phoneNumber": "string",
  "areaCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "profilePicture": "string",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "name (required)": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "postalCode": "string",
  "longitude": "number (double)",
  "latitude": "number (double)"
}
```

### `FileUpload`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "path": "string",
  "originalFilePath": "string",
  "size": "integer (int64)",
  "contentType": "string",
  "exactHash": "string",
  "perceptualHash": "integer (int64)",
  "url": "string",
  "originalUrl": "string"
}
```

### `Profile`
```json
{
  "id": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
  "name": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "bio": "string",
  "reasonForProbation": "string",
  "reasonForTermination": "string",
  "probationDate": "string (date-time)",
  "terminationDate": "string (date-time)",
  "insight": {
    "totalFollowers": "integer (int32)",
    "totalFollowing": "integer (int32)",
    "totalUploads": "integer (int32)",
    "rating": {
      "id": "integer (int64)",
      "total1Star": "integer (int32)",
      "total2Star": "integer (int32)",
      "total3Star": "integer (int32)",
      "total4Star": "integer (int32)",
      "total5Star": "integer (int32)",
      "avgStars": "number (double)"
    },
    "totalEarnings": "number",
    "totalReviews": "integer (int32)",
    "totalCancelledOrders": "integer (int32)",
    "totalCompletedOrders": "integer (int32)",
    "jobSuccessPercentage": "integer (int32)"
  },
  "distanceInKm": "number (double)",
  "userId": "integer (int64)",
  "userName": "string",
  "userEmail": "string",
  "userPhone": "string",
  "coverPic": "string",
  "categories": [
    "string"
  ],
  "profilePic": "string"
}
```

### `ProfileInsightResponse`
```json
{
  "totalFollowers": "integer (int32)",
  "totalFollowing": "integer (int32)",
  "totalUploads": "integer (int32)",
  "rating": {
    "id": "integer (int64)",
    "total1Star": "integer (int32)",
    "total2Star": "integer (int32)",
    "total3Star": "integer (int32)",
    "total4Star": "integer (int32)",
    "total5Star": "integer (int32)",
    "avgStars": "number (double)"
  },
  "totalEarnings": "number",
  "totalReviews": "integer (int32)",
  "totalCancelledOrders": "integer (int32)",
  "totalCompletedOrders": "integer (int32)",
  "jobSuccessPercentage": "integer (int32)"
}
```

### `Rating`
```json
{
  "id": "integer (int64)",
  "total1Star": "integer (int32)",
  "total2Star": "integer (int32)",
  "total3Star": "integer (int32)",
  "total4Star": "integer (int32)",
  "total5Star": "integer (int32)",
  "avgStars": "number (double)"
}
```

### `User`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "referralCode": "string",
  "gender": "string enum: [FEMALE | MALE]",
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "updateAddress": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ],
  "designInterests": [
    "string"
  ]
}
```

### `PaymentDetailDto`
```json
{
  "bankName (required)": "string",
  "bankCode (required)": "string",
  "accountName": "string",
  "accountNumber (required)": "string"
}
```

### `PaymentDetail`
```json
{
  "bankName": "string",
  "bankCode": "string",
  "accountName": "string",
  "accountNumber": "string"
}
```

### `UpdateMailSettingRequest`
```json
{
  "supportEmail": "boolean",
  "orderEmail": "boolean",
  "newsEmail": "boolean",
  "otherEmail": "boolean",
  "promotionEmail": "boolean"
}
```

### `MailSetting`
```json
{
  "supportEmail": "boolean",
  "orderEmail": "boolean",
  "newsEmail": "boolean",
  "otherEmail": "boolean",
  "promotionEmail": "boolean"
}
```

### `DesignInterestRequest`
```json
{
  "interests (required)": [
    "string"
  ]
}
```

### `UpdateProfileRequest`
```json
{
  "name (required)": "string",
  "profilePic": "string",
  "coverPic": "string",
  "bio": "string",
  "categories": [
    "string"
  ]
}
```

### `LogisticAddressDTO`
```json
{
  "name (required)": "string",
  "phoneNumber (required)": "string",
  "email": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "address (required)": "string",
  "postalCode": "string",
  "longitude": "number (double)",
  "latitude": "number (double)"
}
```

### `PrintRequestUpdateDto`
```json
{
  "colour": "string",
  "quantity": "integer (int64)",
  "size": "string",
  "deliveryAddress": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "pickupAddress": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  }
}
```

### `CustomDesignRequest`
```json
{
  "id": "integer (int64)",
  "theme": "string",
  "purpose": "string",
  "image": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "designId": "integer (int64)",
  "isReferenceDesign": "boolean",
  "imageUrlFront": "string",
  "mockTypes": [
    "string"
  ]
}
```

### `LogisticAddress`
```json
{
  "city": "string",
  "state": "string",
  "country": "string",
  "address": "string",
  "postalCode": "string",
  "longitude": "number (double)",
  "latitude": "number (double)",
  "name": "string",
  "phoneNumber": "string",
  "email": "string",
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
```

### `OrderRequest`
```json
{
  "id": "integer (int64)",
  "printRequest": {
    "id": "integer (int64)",
    "designId": "integer (int64)",
    "mockId": "integer (int64)",
    "designCoverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designAmount": "number",
    "mockName": "string",
    "sourceOfItem": "string",
    "quantity": "integer (int64)",
    "colour": "string",
    "size": "string",
    "deliveryAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "pickerAddress": {
      "city": "string",
      "state": "string",
      "country": "string",
      "address": "string",
      "postalCode": "string",
      "longitude": "number (double)",
      "latitude": "number (double)",
      "name": "string",
      "phoneNumber": "string",
      "email": "string",
      "profile": "object"
    },
    "mockItemUrl": "string",
    "designFrontImageUrl": "string"
  },
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "customDesignRequest": {
    "id": "integer (int64)",
    "theme": "string",
    "purpose": "string",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "designId": "integer (int64)",
    "isReferenceDesign": "boolean",
    "imageUrlFront": "string",
    "mockTypes": [
      "string"
    ]
  },
  "orderType": "string enum: [PRINT | DESIGN]",
  "budgetAmount": "number",
  "dateOfDelivery": "string (date)",
  "providerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "conversationId": "string"
}
```

### `PrintRequest`
```json
{
  "id": "integer (int64)",
  "designId": "integer (int64)",
  "mockId": "integer (int64)",
  "designCoverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "designAmount": "number",
  "mockName": "string",
  "sourceOfItem": "string",
  "quantity": "integer (int64)",
  "colour": "string",
  "size": "string",
  "deliveryAddress": {
    "city": "string",
    "state": "string",
    "country": "string",
    "address": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)",
    "name": "string",
    "phoneNumber": "string",
    "email": "string",
    "profile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  },
  "pickerAddress": {
    "city": "string",
    "state": "string",
    "country": "string",
    "address": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)",
    "name": "string",
    "phoneNumber": "string",
    "email": "string",
    "profile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  },
  "mockItemUrl": "string",
  "designFrontImageUrl": "string"
}
```

### `UpdateDesignRequest`
```json
{
  "name (required)": "string",
  "frontImageUrl (required)": "string",
  "description": "string",
  "printerId": "integer (int64)",
  "amount": "number",
  "tags": [
    "string"
  ],
  "openForCustomization": "boolean",
  "categories": [
    "string"
  ]
}
```

### `Design`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "description": "string",
  "slug": "string",
  "designer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "printer": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "amount": "number",
  "approved": "boolean",
  "openForCustomization": "boolean",
  "reasonForRejection": "string",
  "designIsLiked": "boolean",
  "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
```

### `MockImages`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "category": "string",
  "limitedStatus": "boolean",
  "image": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "availableQty": "integer (int64)",
  "colours": [
    "string"
  ],
  "imageUrl": "string"
}
```

### `MockImagesDto`
```json
{
  "limitedStatus": "boolean",
  "imageUrl (required)": "string",
  "availableQty": "integer (int64)",
  "name (required)": "string",
  "category (required)": "string",
  "colours": [
    "string"
  ]
}
```

### `NewCollectionRequest`
```json
{
  "name (required)": "string",
  "description": "string",
  "picture": "string"
}
```

### `Collection`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "slug": "string",
  "description": "string",
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "string"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "picture": "string"
}
```

### `CollectionMoveRequest`
```json
{
  "designs": [
    "integer (int64)"
  ],
  "newCollection": "integer (int64)"
}
```

### `CollectionAdditionRequest`
```json
{
  "designs": [
    "integer (int64)"
  ]
}
```

### `UpdateAdminRequest`
```json
{
  "name (required)": "string",
  "phoneNumber": "string",
  "profilePicture": "string"
}
```

### `Admin`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "profileImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "enabled": "boolean",
  "activated": "boolean",
  "lastLoginDate": "string (date-time)",
  "lastPasswordResetDate": "string (date-time)",
  "permission": {
    "id": "integer (int64)",
    "canManagerAdmin": "boolean",
    "canManagerUsers": "boolean",
    "canManagerDesigns": "boolean",
    "canManagerOrders": "boolean",
    "canManagerTransactions": "boolean",
    "canManagerPayments": "boolean",
    "canManagerTickets": "boolean",
    "canManagerBlogs": "boolean",
    "canManagerEmails": "boolean",
    "canManagerWallets": "boolean",
    "canManagerLogistics": "boolean"
  },
  "profilePicture": "string",
  "roles": [
    "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
  ]
}
```

### `Permission`
```json
{
  "id": "integer (int64)",
  "canManagerAdmin": "boolean",
  "canManagerUsers": "boolean",
  "canManagerDesigns": "boolean",
  "canManagerOrders": "boolean",
  "canManagerTransactions": "boolean",
  "canManagerPayments": "boolean",
  "canManagerTickets": "boolean",
  "canManagerBlogs": "boolean",
  "canManagerEmails": "boolean",
  "canManagerWallets": "boolean",
  "canManagerLogistics": "boolean"
}
```

### `EditAdminRequest`
```json
{
  "name (required)": "string",
  "role (required)": "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]",
  "canManagerAdmin": "boolean",
  "canManagerUsers": "boolean",
  "canManagerDesigns": "boolean",
  "canManagerOrders": "boolean",
  "canManagerTransactions": "boolean",
  "canManagerPayments": "boolean",
  "canManagerTickets": "boolean",
  "canManagerBlogs": "boolean",
  "canManagerEmails": "boolean",
  "canManagerWallets": "boolean",
  "canManagerLogistics": "boolean"
}
```

### `TicketDto`
```json
{
  "details": "string",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedToId": "integer (int64)"
}
```

### `Dispute`
```json
{
  "id": "integer (int64)",
  "disputeId": "string",
  "comment": "string",
  "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
  "status": "string enum: [CLOSED | OPEN]",
  "ticketCreated": "boolean",
  "customerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "order": {
    "id": "integer (int64)",
    "title": "string",
    "description": "string",
    "printingAmount": "number",
    "designAmount": "number",
    "pickupAmount": "number",
    "deliveryAmount": "number",
    "totalAmount": "number",
    "paid": "boolean",
    "transactionRef": "string",
    "paymentUrl": "string",
    "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
    "itemProvidedByCustomer": "boolean",
    "deliveryDate": "string (date)",
    "orderRequest": {
      "id": "integer (int64)",
      "printRequest": "object",
      "customerProfile": "object",
      "customDesignRequest": "object",
      "orderType": "string enum: [PRINT | DESIGN]",
      "budgetAmount": "number",
      "dateOfDelivery": "string (date)",
      "providerProfile": "object",
      "conversationId": "string"
    },
    "noOfReviews": "integer (int64)",
    "canceledByCustomer": "boolean",
    "amountPaidToProvider": "number",
    "amountPaidForDesign": "number",
    "ref": "string"
  },
  "closedDate": "string (date-time)"
}
```

### `Order`
```json
{
  "id": "integer (int64)",
  "title": "string",
  "description": "string",
  "printingAmount": "number",
  "designAmount": "number",
  "pickupAmount": "number",
  "deliveryAmount": "number",
  "totalAmount": "number",
  "paid": "boolean",
  "transactionRef": "string",
  "paymentUrl": "string",
  "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate": "string (date)",
  "orderRequest": {
    "id": "integer (int64)",
    "printRequest": {
      "id": "integer (int64)",
      "designId": "integer (int64)",
      "mockId": "integer (int64)",
      "designCoverImage": "object",
      "designAmount": "number",
      "mockName": "string",
      "sourceOfItem": "string",
      "quantity": "integer (int64)",
      "colour": "string",
      "size": "string",
      "deliveryAddress": "object",
      "pickerAddress": "object",
      "mockItemUrl": "string",
      "designFrontImageUrl": "string"
    },
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "customDesignRequest": {
      "id": "integer (int64)",
      "theme": "string",
      "purpose": "string",
      "image": "object",
      "designId": "integer (int64)",
      "isReferenceDesign": "boolean",
      "imageUrlFront": "string",
      "mockTypes": [
        "string"
      ]
    },
    "orderType": "string enum: [PRINT | DESIGN]",
    "budgetAmount": "number",
    "dateOfDelivery": "string (date)",
    "providerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "conversationId": "string"
  },
  "noOfReviews": "integer (int64)",
  "canceledByCustomer": "boolean",
  "amountPaidToProvider": "number",
  "amountPaidForDesign": "number",
  "ref": "string"
}
```

### `Ticket`
```json
{
  "id": "integer (int64)",
  "ticketId": "string",
  "details": "string",
  "status": "string enum: [CLOSED | OPEN]",
  "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
  "assignedTo": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "permission": {
      "id": "integer (int64)",
      "canManagerAdmin": "boolean",
      "canManagerUsers": "boolean",
      "canManagerDesigns": "boolean",
      "canManagerOrders": "boolean",
      "canManagerTransactions": "boolean",
      "canManagerPayments": "boolean",
      "canManagerTickets": "boolean",
      "canManagerBlogs": "boolean",
      "canManagerEmails": "boolean",
      "canManagerWallets": "boolean",
      "canManagerLogistics": "boolean"
    },
    "profilePicture": "string",
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ]
  },
  "dispute": {
    "id": "integer (int64)",
    "disputeId": "string",
    "comment": "string",
    "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
    "status": "string enum: [CLOSED | OPEN]",
    "ticketCreated": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "order": {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": "object",
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    },
    "closedDate": "string (date-time)"
  },
  "closedDate": "string (date-time)"
}
```

### `UpdateSubscriberRequest`
```json
{
  "id": "integer (int64)",
  "name (required)": "string",
  "username": "string",
  "phoneNumber": "string",
  "email": "string"
}
```

### `Subscriber`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "username": "string",
  "phoneNumber": "string",
  "email": "string",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]"
}
```

### `LogisticRequestStatus`
```json
{
  "status (required)": "string enum: [PENDING | IN_PROGRESS | DONE]"
}
```

### `LogisticRequest`
```json
{
  "senderName": "string",
  "senderPhoneNumber": "string",
  "senderEmail": "string",
  "senderCity": "string",
  "senderState": "string",
  "senderCountry": "string",
  "senderAddress": "string",
  "senderPostalCode": "string",
  "senderLongitude": "number (double)",
  "senderLatitude": "number (double)",
  "requestType": "string enum: [PICKUP | DELIVERY]",
  "status": "string enum: [PENDING | IN_PROGRESS | DONE]",
  "receiverName": "string",
  "receiverPhoneNumber": "string",
  "receiverEmail": "string",
  "receiverCity": "string",
  "receiverState": "string",
  "receiverCountry": "string",
  "receiverAddress": "string",
  "receiverPostalCode": "string",
  "receiverLongitude": "number (double)",
  "receiverLatitude": "number (double)",
  "orderId": "integer (int64)"
}
```

### `BlogDto`
```json
{
  "imageUrl": "string",
  "title (required)": "string",
  "category (required)": "string",
  "detail (required)": "string",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "description": "string",
  "enabled": "boolean"
}
```

### `Blog`
```json
{
  "id": "integer (int64)",
  "slug": "string",
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "title": "string",
  "category": "string",
  "details": "string",
  "description": "string",
  "enabled": "boolean",
  "tags": [
    "string"
  ],
  "keywords": [
    "string"
  ],
  "imageUrl": "string"
}
```

### `PaystackData`
```json
{
  "id": "object",
  "domain": "string",
  "status": "string",
  "reference": "string",
  "gateway_response": "string",
  "ip_address": "string",
  "amount": "number",
  "message": "string",
  "paid_at": "string (date-time)",
  "created_at": "string (date-time)",
  "channel": "string",
  "currency": "string",
  "metadata": "object",
  "fees": "object",
  "customer": "object",
  "authorization": "object",
  "plan": "object",
  "split": "object",
  "source": "object",
  "paidAt": "string (date-time)"
}
```

### `PaystackTransactionRequest`
```json
{
  "event": "string",
  "data": {
    "id": "object",
    "domain": "string",
    "status": "string",
    "reference": "string",
    "gateway_response": "string",
    "ip_address": "string",
    "amount": "number",
    "message": "string",
    "paid_at": "string (date-time)",
    "created_at": "string (date-time)",
    "channel": "string",
    "currency": "string",
    "metadata": "object",
    "fees": "object",
    "customer": "object",
    "authorization": "object",
    "plan": "object",
    "split": "object",
    "source": "object",
    "paidAt": "string (date-time)"
  }
}
```

### `WalletWithdrawalRequest`
```json
{
  "amount": "number"
}
```

### `Beneficiary`
```json
{
  "bankName": "string",
  "bankCode": "string",
  "accountName": "string",
  "accountNumber": "string"
}
```

### `WalletHistory`
```json
{
  "id": "integer (int64)",
  "amount": "number",
  "transactionType": "string enum: [CREDIT | DEBIT | REFUND]",
  "status": "string enum: [SUCCESS | FAILED | PENDING]",
  "transactionReference": "string",
  "accountDetails": {
    "bankName": "string",
    "bankCode": "string",
    "accountName": "string",
    "accountNumber": "string"
  }
}
```

### `ReferralRedemption`
```json
{
  "id": "integer (int64)",
  "user": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "areaCode": "string",
    "referralCode": "string",
    "gender": "string enum: [FEMALE | MALE]",
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "updateAddress": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "printerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "designerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ],
    "designInterests": [
      "string"
    ]
  },
  "totalAmount": "number",
  "method": "string enum: [WALLET | BANK_TRANSFER]",
  "beneficiary": {
    "bankName": "string",
    "bankCode": "string",
    "accountName": "string",
    "accountNumber": "string"
  },
  "status": "string enum: [PENDING | SUCCESS | FAILED]",
  "transactionReference": "string"
}
```

### `ReviewDto`
```json
{
  "comment": "string",
  "service": "integer (int32)",
  "deliveryTime": "integer (int32)",
  "recommendation": "integer (int32)",
  "communication": "integer (int32)",
  "profileId": "integer (int64)"
}
```

### `Review`
```json
{
  "id": "integer (int64)",
  "comment": "string",
  "stars": "integer (int32)",
  "service": "integer (int32)",
  "deliveryTime": "integer (int32)",
  "recommendation": "integer (int32)",
  "communication": "integer (int32)",
  "ratedUser": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "ratingUser": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
```

### `AddProfileRequest`
```json
{
  "profile (required)": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "name (required)": "string",
  "phoneNumber": "string",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  }
}
```

### `AddressDTO`
```json
{
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "postalCode": "string",
  "longitude": "number (double)",
  "latitude": "number (double)"
}
```

### `OrderDto`
```json
{
  "orderRequestId": "integer (int64)",
  "title (required)": "string",
  "description": "string",
  "amount (required)": "number",
  "deliveryAmount (required)": "number",
  "itemPickupAmount": "number",
  "itemProvidedByCustomer": "boolean",
  "deliveryDate (required)": "string (date)"
}
```

### `OrderPaymentDto`
```json
{
  "callback (required)": "string",
  "orderId (required)": "integer (int64)"
}
```

### `PrintRequestDto`
```json
{
  "printerId": "integer (int64)",
  "designId": "integer (int64)",
  "colour": "string",
  "quantity": "integer (int64)",
  "size": "string",
  "sourceOfItem": "string",
  "mockItemId": "integer (int64)",
  "customDesign": "boolean",
  "deliveryAddress (required)": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "pickupAddress": {
    "name (required)": "string",
    "phoneNumber (required)": "string",
    "email": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "address (required)": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "estimatedAmount": "number",
  "dateOfDelivery": "string (date)"
}
```

### `PrintRequestListDto`
```json
{
  "printRequestDtoList": [
    {
      "printerId": "integer (int64)",
      "designId": "integer (int64)",
      "colour": "string",
      "quantity": "integer (int64)",
      "size": "string",
      "sourceOfItem": "string",
      "mockItemId": "integer (int64)",
      "customDesign": "boolean",
      "deliveryAddress (required)": {
        "name (required)": "string",
        "phoneNumber (required)": "string",
        "email": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "address (required)": "string",
        "postalCode": "string",
        "longitude": "number (double)",
        "latitude": "number (double)"
      },
      "pickupAddress": {
        "name (required)": "string",
        "phoneNumber (required)": "string",
        "email": "string",
        "city": "string",
        "state": "string",
        "country": "string",
        "address (required)": "string",
        "postalCode": "string",
        "longitude": "number (double)",
        "latitude": "number (double)"
      },
      "estimatedAmount": "number",
      "dateOfDelivery": "string (date)"
    }
  ]
}
```

### `CustomDesignRequestDto`
```json
{
  "designerProfileId (required)": "integer (int64)",
  "mockTypes (required)": [
    "string"
  ],
  "purpose (required)": "string",
  "theme (required)": "string",
  "dateOfDelivery": "string (date)",
  "estimatedAmount": "number"
}
```

### `RequestCustomizationDTo`
```json
{
  "designId (required)": "integer (int64)",
  "designerId (required)": "integer (int64)",
  "dateOfDelivery": "string (date)",
  "estimatedAmount": "number",
  "mockTypes": [
    "string"
  ],
  "purpose": "string",
  "theme": "string"
}
```

### `Notification`
```json
{
  "id": "integer (int64)",
  "title": "string",
  "message": "string",
  "category": "string enum: [DESIGN | ORDER | CONVERSATION | DIRECT | PROFILE]",
  "objectId": "string",
  "read": "boolean",
  "readDateTime": "string (date-time)"
}
```

### `Message`
```json
{
  "toProfileId": "integer (int64)",
  "content": "string",
  "caption": "string",
  "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]"
}
```

### `ChatMessage`
```json
{
  "content": "string",
  "caption": "string",
  "sender": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "receiver": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "read": "boolean",
  "readDateTime": "string (date-time)",
  "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
  "messageIdentifier": "string",
  "conversationId": "integer (int64)",
  "conversationName": "string"
}
```

### `LogisticRequestDTO`
```json
{
  "requestType (required)": "string enum: [PICKUP | DELIVERY]",
  "orderId": "integer (int64)"
}
```

### `GalleryRequest`
```json
{
  "url (required)": "string"
}
```

### `Gallery`
```json
{
  "id": "integer (int64)",
  "image": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "url": "string"
}
```

### `FollowRequest`
```json
{
  "followingProfileId (required)": "integer (int64)"
}
```

### `Follow`
```json
{
  "id": "integer (int64)",
  "follower": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "following": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
```

### `GeneratePresignedUrlRequest`
```json
{
  "fileName (required)": "string",
  "contentType (required)": "string",
  "size (required)": "integer (int64)"
}
```

### `PresignedUrlResponse`
```json
{
  "presignedUrl": "string",
  "fileKey": "string"
}
```

### `CompleteUploadRequest`
```json
{
  "fileKey (required)": "string",
  "fileName (required)": "string",
  "contentType (required)": "string",
  "size (required)": "integer (int64)"
}
```

### `NewDesignRequest`
```json
{
  "name (required)": "string",
  "frontImageUrl (required)": "string",
  "designImages (required)": [
    "string"
  ],
  "description": "string",
  "printerId": "integer (int64)",
  "openForCustomization": "boolean",
  "amount": "number",
  "mocks (required)": [
    {
      "limitedStatus": "boolean",
      "imageUrl (required)": "string",
      "availableQty": "integer (int64)",
      "name (required)": "string",
      "category (required)": "string",
      "colours": [
        "string"
      ]
    }
  ],
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ]
}
```

### `AddDesignUpload`
```json
{
  "imagePath (required)": "string"
}
```

### `DesignUpload`
```json
{
  "id": "integer (int64)",
  "fileUpload": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  }
}
```

### `CustomDesign`
```json
{
  "id": "integer (int64)",
  "name": "string",
  "description": "string",
  "designerProfile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  },
  "coverImage": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "designs": [
    {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    }
  ],
  "mocks": [
    {
      "id": "integer (int64)",
      "name": "string",
      "category": "string",
      "limitedStatus": "boolean",
      "image": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "availableQty": "integer (int64)",
      "colours": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "review": {
    "id": "integer (int64)",
    "comment": "string"
  },
  "orderId": "integer (int64)",
  "completed": "boolean",
  "finalDesign": "boolean",
  "amount": "number",
  "tags": [
    "string"
  ],
  "categories": [
    "string"
  ],
  "imageUrlFront": "string"
}
```

### `CustomDesignReview`
```json
{
  "id": "integer (int64)",
  "comment": "string"
}
```

### `CustomDesignReviewDto`
```json
{
  "comment": "string"
}
```

### `CartItemDto`
```json
{
  "quantity": "integer (int64)",
  "colour": "string",
  "size": "string"
}
```

### `CartItem`
```json
{
  "id": "integer (int64)",
  "mock": {
    "id": "integer (int64)",
    "name": "string",
    "category": "string",
    "limitedStatus": "boolean",
    "image": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "availableQty": "integer (int64)",
    "colours": [
      "string"
    ],
    "imageUrl": "string"
  },
  "quantity": "integer (int64)",
  "colour": "string",
  "size": "string",
  "designId": "integer (int64)",
  "amount": "number"
}
```

### `AddAdminRequest`
```json
{
  "name (required)": "string",
  "email (required)": "string",
  "role": "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]",
  "canManagerAdmin": "boolean",
  "canManagerUsers": "boolean",
  "canManagerDesigns": "boolean",
  "canManagerOrders": "boolean",
  "canManagerTransactions": "boolean",
  "canManagerPayments": "boolean",
  "canManagerTickets": "boolean",
  "canManagerBlogs": "boolean",
  "canManagerEmails": "boolean",
  "canManagerWallets": "boolean",
  "canManagerLogistics": "boolean"
}
```

### `BaseRequest`
```json
{
  "email (required)": "string"
}
```

### `SendEmailRequest`
```json
{
  "subject (required)": "string",
  "body (required)": "string",
  "templateId": "string",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "recipients": [
    "string"
  ]
}
```

### `VerifyBankAccountRequest`
```json
{
  "accountNumber (required)": "string",
  "bankCode (required)": "string"
}
```

### `RegistrationRequest`
```json
{
  "name (required)": "string",
  "email (required)": "string",
  "username": "string",
  "businessName": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "password (required)": "string",
  "sendPromotionEmail": "boolean",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "referralCode": "string"
}
```

### `RegistrationResponse`
```json
{
  "emailVerified": "boolean"
}
```

### `SocialReqistrationRequest`
```json
{
  "accessToken (required)": "string",
  "username": "string",
  "phoneNumber": "string",
  "areaCode": "string",
  "businessName": "string",
  "sendPromotionEmail": "boolean",
  "address": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "longitude": "number (double)",
    "latitude": "number (double)"
  },
  "referralCode": "string"
}
```

### `LoginResponse`
```json
{
  "user": "object",
  "token": "string"
}
```

### `LoginRequest`
```json
{
  "email (required)": "string",
  "password (required)": "string",
  "rememberMe": "boolean"
}
```

### `UpdateUsernameRequest`
```json
{
  "name (required)": "string"
}
```

### `UpdatePasswordRequest`
```json
{
  "oldPassword (required)": "string",
  "newPassword (required)": "string"
}
```

### `DisputeDto`
```json
{
  "comment": "string",
  "disputeType (required)": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]"
}
```

### `ReasonRequest`
```json
{
  "reason (required)": "string"
}
```

### `AdminReviewDesignRequest`
```json
{
  "approved": "boolean",
  "comment": "string"
}
```

### `ResetPasswordRequest`
```json
{
  "email (required)": "string",
  "otp (required)": "string",
  "password (required)": "string"
}
```

### `Wallet`
```json
{
  "id": "integer (int64)",
  "amount": "number",
  "profile": {
    "id": "integer (int64)",
    "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
    "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
    "name": "string",
    "profileImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "coverImage": {
      "id": "integer (int64)",
      "name": "string",
      "path": "string",
      "originalFilePath": "string",
      "size": "integer (int64)",
      "contentType": "string",
      "exactHash": "string",
      "perceptualHash": "integer (int64)",
      "url": "string",
      "originalUrl": "string"
    },
    "bio": "string",
    "reasonForProbation": "string",
    "reasonForTermination": "string",
    "probationDate": "string (date-time)",
    "terminationDate": "string (date-time)",
    "insight": {
      "totalFollowers": "integer (int32)",
      "totalFollowing": "integer (int32)",
      "totalUploads": "integer (int32)",
      "rating": "object",
      "totalEarnings": "number",
      "totalReviews": "integer (int32)",
      "totalCancelledOrders": "integer (int32)",
      "totalCompletedOrders": "integer (int32)",
      "jobSuccessPercentage": "integer (int32)"
    },
    "distanceInKm": "number (double)",
    "userId": "integer (int64)",
    "userName": "string",
    "userEmail": "string",
    "userPhone": "string",
    "coverPic": "string",
    "categories": [
      "string"
    ],
    "profilePic": "string"
  }
}
```

### `Pageable`
```json
{
  "page": "integer (int32)",
  "size": "integer (int32)",
  "sort": [
    "string"
  ]
}
```

### `PageWalletHistory`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "amount": "number",
      "transactionType": "string enum: [CREDIT | DEBIT | REFUND]",
      "status": "string enum: [SUCCESS | FAILED | PENDING]",
      "transactionReference": "string",
      "accountDetails": {
        "bankName": "string",
        "bankCode": "string",
        "accountName": "string",
        "accountNumber": "string"
      }
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageableObject`
```json
{
  "pageNumber": "integer (int32)",
  "pageSize": "integer (int32)",
  "offset": "integer (int64)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "paged": "boolean",
  "unpaged": "boolean"
}
```

### `SortObject`
```json
{
  "sorted": "boolean",
  "empty": "boolean",
  "unsorted": "boolean"
}
```

### `PageUser`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "email": "string",
      "phoneNumber": "string",
      "areaCode": "string",
      "referralCode": "string",
      "gender": "string enum: [FEMALE | MALE]",
      "enabled": "boolean",
      "activated": "boolean",
      "lastLoginDate": "string (date-time)",
      "lastPasswordResetDate": "string (date-time)",
      "updateAddress": "boolean",
      "customerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "printerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "designerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "roles": [
        "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
      ],
      "designInterests": [
        "string"
      ]
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `Address`
```json
{
  "city": "string",
  "state": "string",
  "country": "string",
  "address": "string",
  "postalCode": "string",
  "longitude": "number (double)",
  "latitude": "number (double)"
}
```

### `PageTransaction`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "orderId": "integer (int64)",
      "intTransactionRef": "string",
      "extTransactionRef": "string",
      "status": "string enum: [SUCCESS | FAILED | PENDING]",
      "paymentProvider": "string enum: [PAYSTACK | FLUTTERWAVE]",
      "amount": "number",
      "userProfileId": "integer (int64)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `Transaction`
```json
{
  "id": "integer (int64)",
  "orderId": "integer (int64)",
  "intTransactionRef": "string",
  "extTransactionRef": "string",
  "status": "string enum: [SUCCESS | FAILED | PENDING]",
  "paymentProvider": "string enum: [PAYSTACK | FLUTTERWAVE]",
  "amount": "number",
  "userProfileId": "integer (int64)"
}
```

### `PageReferral`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "user": {
        "id": "integer (int64)",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "areaCode": "string",
        "referralCode": "string",
        "gender": "string enum: [FEMALE | MALE]",
        "enabled": "boolean",
        "activated": "boolean",
        "lastLoginDate": "string (date-time)",
        "lastPasswordResetDate": "string (date-time)",
        "updateAddress": "boolean",
        "customerProfile": "object",
        "printerProfile": "object",
        "designerProfile": "object",
        "roles": [
          "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
        ],
        "designInterests": [
          "string"
        ]
      },
      "referred": {
        "id": "integer (int64)",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "areaCode": "string",
        "referralCode": "string",
        "gender": "string enum: [FEMALE | MALE]",
        "enabled": "boolean",
        "activated": "boolean",
        "lastLoginDate": "string (date-time)",
        "lastPasswordResetDate": "string (date-time)",
        "updateAddress": "boolean",
        "customerProfile": "object",
        "printerProfile": "object",
        "designerProfile": "object",
        "roles": [
          "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
        ],
        "designInterests": [
          "string"
        ]
      },
      "referredProfileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "referralCode": "string",
      "referrerReward": "number",
      "status": "string enum: [PENDING_REWARD | PENDING | COMPLETED | PENDING_REDEMPTION | REDEEMED]",
      "redemption": {
        "id": "integer (int64)",
        "user": "object",
        "totalAmount": "number",
        "method": "string enum: [WALLET | BANK_TRANSFER]",
        "beneficiary": "object",
        "status": "string enum: [PENDING | SUCCESS | FAILED]",
        "transactionReference": "string"
      }
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `Referral`
```json
{
  "id": "integer (int64)",
  "user": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "areaCode": "string",
    "referralCode": "string",
    "gender": "string enum: [FEMALE | MALE]",
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "updateAddress": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "printerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "designerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ],
    "designInterests": [
      "string"
    ]
  },
  "referred": {
    "id": "integer (int64)",
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "areaCode": "string",
    "referralCode": "string",
    "gender": "string enum: [FEMALE | MALE]",
    "enabled": "boolean",
    "activated": "boolean",
    "lastLoginDate": "string (date-time)",
    "lastPasswordResetDate": "string (date-time)",
    "updateAddress": "boolean",
    "customerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "printerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "designerProfile": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "roles": [
      "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
    ],
    "designInterests": [
      "string"
    ]
  },
  "referredProfileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "referralCode": "string",
  "referrerReward": "number",
  "status": "string enum: [PENDING_REWARD | PENDING | COMPLETED | PENDING_REDEMPTION | REDEEMED]",
  "redemption": {
    "id": "integer (int64)",
    "user": {
      "id": "integer (int64)",
      "name": "string",
      "email": "string",
      "phoneNumber": "string",
      "areaCode": "string",
      "referralCode": "string",
      "gender": "string enum: [FEMALE | MALE]",
      "enabled": "boolean",
      "activated": "boolean",
      "lastLoginDate": "string (date-time)",
      "lastPasswordResetDate": "string (date-time)",
      "updateAddress": "boolean",
      "customerProfile": "object",
      "printerProfile": "object",
      "designerProfile": "object",
      "roles": [
        "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
      ],
      "designInterests": [
        "string"
      ]
    },
    "totalAmount": "number",
    "method": "string enum: [WALLET | BANK_TRANSFER]",
    "beneficiary": {
      "bankName": "string",
      "bankCode": "string",
      "accountName": "string",
      "accountNumber": "string"
    },
    "status": "string enum: [PENDING | SUCCESS | FAILED]",
    "transactionReference": "string"
  }
}
```

### `ReferrerStatsResponse`
```json
{
  "totalCount": "integer (int64)",
  "pendingCount": "integer (int64)",
  "completedCount": "integer (int64)",
  "redeemedCount": "integer (int64)",
  "totalReward": "number",
  "pendingReward": "number",
  "completedReward": "number",
  "redeemedReward": "number",
  "lastCreatedDate": "string (date-time)",
  "lastModifiedDate": "string (date-time)"
}
```

### `ReferrerCodeResponse`
```json
{
  "referralCode": "string"
}
```

### `PageProfile`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": {
        "totalFollowers": "integer (int32)",
        "totalFollowing": "integer (int32)",
        "totalUploads": "integer (int32)",
        "rating": "object",
        "totalEarnings": "number",
        "totalReviews": "integer (int32)",
        "totalCancelledOrders": "integer (int32)",
        "totalCompletedOrders": "integer (int32)",
        "jobSuccessPercentage": "integer (int32)"
      },
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageDesign`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "description": "string",
      "slug": "string",
      "designer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "printer": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "mocks": [
        {
          "id": "integer (int64)",
          "name": "string",
          "category": "string",
          "limitedStatus": "boolean",
          "image": "object",
          "availableQty": "integer (int64)",
          "colours": [
            "string"
          ],
          "imageUrl": "string"
        }
      ],
      "amount": "number",
      "approved": "boolean",
      "openForCustomization": "boolean",
      "reasonForRejection": "string",
      "designIsLiked": "boolean",
      "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
      "tags": [
        "string"
      ],
      "categories": [
        "string"
      ],
      "imageUrlFront": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageCollection`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "slug": "string",
      "description": "string",
      "designs": [
        {
          "id": "integer (int64)",
          "name": "string",
          "coverImage": "object",
          "description": "string",
          "slug": "string",
          "designer": "object",
          "printer": "object",
          "mocks": [
            "object"
          ],
          "amount": "number",
          "approved": "boolean",
          "openForCustomization": "boolean",
          "reasonForRejection": "string",
          "designIsLiked": "boolean",
          "status": "string enum: [APPROVED | DECLINED | AWAITING_APPROVAL]",
          "tags": [
            "string"
          ],
          "categories": [
            "string"
          ],
          "imageUrlFront": "string"
        }
      ],
      "picture": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageBlog`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "slug": "string",
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "title": "string",
      "category": "string",
      "details": "string",
      "description": "string",
      "enabled": "boolean",
      "tags": [
        "string"
      ],
      "keywords": [
        "string"
      ],
      "imageUrl": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageOrder`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "title": "string",
      "description": "string",
      "printingAmount": "number",
      "designAmount": "number",
      "pickupAmount": "number",
      "deliveryAmount": "number",
      "totalAmount": "number",
      "paid": "boolean",
      "transactionRef": "string",
      "paymentUrl": "string",
      "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
      "itemProvidedByCustomer": "boolean",
      "deliveryDate": "string (date)",
      "orderRequest": {
        "id": "integer (int64)",
        "printRequest": "object",
        "customerProfile": "object",
        "customDesignRequest": "object",
        "orderType": "string enum: [PRINT | DESIGN]",
        "budgetAmount": "number",
        "dateOfDelivery": "string (date)",
        "providerProfile": "object",
        "conversationId": "string"
      },
      "noOfReviews": "integer (int64)",
      "canceledByCustomer": "boolean",
      "amountPaidToProvider": "number",
      "amountPaidForDesign": "number",
      "ref": "string"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageNotification`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "title": "string",
      "message": "string",
      "category": "string enum: [DESIGN | ORDER | CONVERSATION | DIRECT | PROFILE]",
      "objectId": "string",
      "read": "boolean",
      "readDateTime": "string (date-time)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `BarChartCount`
```json
{
  "type": "string",
  "count": "integer (int64)"
}
```

### `PieChartResponse`
```json
{
  "data": [
    {
      "type": "string",
      "count": "integer (int64)"
    }
  ]
}
```

### `BarChartResponse`
```json
{
  "key": "string (date-time)",
  "data": [
    {
      "type": "string",
      "count": "integer (int64)"
    }
  ]
}
```

### `ConnectionStatus`
```json
{
  "following": "boolean"
}
```

### `Fee`
```json
{
  "amount": "number"
}
```

### `Conversation`
```json
{
  "id": "integer (int64)",
  "conversationName": "string",
  "type": "string enum: [INDIVIDUAL | ORDER]",
  "hasUnreadMessages": "boolean",
  "unreadMessageCount": "integer (int32)",
  "lastMessageTimestamp": "string (date-time)",
  "participants": [
    {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "coverImage": {
        "id": "integer (int64)",
        "name": "string",
        "path": "string",
        "originalFilePath": "string",
        "size": "integer (int64)",
        "contentType": "string",
        "exactHash": "string",
        "perceptualHash": "integer (int64)",
        "url": "string",
        "originalUrl": "string"
      },
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": {
        "totalFollowers": "integer (int32)",
        "totalFollowing": "integer (int32)",
        "totalUploads": "integer (int32)",
        "rating": "object",
        "totalEarnings": "number",
        "totalReviews": "integer (int32)",
        "totalCancelledOrders": "integer (int32)",
        "totalCompletedOrders": "integer (int32)",
        "jobSuccessPercentage": "integer (int32)"
      },
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    }
  ],
  "lastMessage": {
    "content": "string",
    "caption": "string",
    "sender": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "receiver": {
      "id": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
      "name": "string",
      "profileImage": "object",
      "coverImage": "object",
      "bio": "string",
      "reasonForProbation": "string",
      "reasonForTermination": "string",
      "probationDate": "string (date-time)",
      "terminationDate": "string (date-time)",
      "insight": "object",
      "distanceInKm": "number (double)",
      "userId": "integer (int64)",
      "userName": "string",
      "userEmail": "string",
      "userPhone": "string",
      "coverPic": "string",
      "categories": [
        "string"
      ],
      "profilePic": "string"
    },
    "read": "boolean",
    "readDateTime": "string (date-time)",
    "chatType": "string enum: [ORDER | ORDER_REQUEST | DIRECT | FILE]",
    "messageIdentifier": "string",
    "conversationId": "integer (int64)",
    "conversationName": "string"
  }
}
```

### `PageWallet`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "amount": "number",
      "profile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      }
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageTicket`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "ticketId": "string",
      "details": "string",
      "status": "string enum: [CLOSED | OPEN]",
      "priority": "string enum: [URGENT | HIGH | MEDIUM | LOW]",
      "assignedTo": {
        "id": "integer (int64)",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "profileImage": "object",
        "enabled": "boolean",
        "activated": "boolean",
        "lastLoginDate": "string (date-time)",
        "lastPasswordResetDate": "string (date-time)",
        "permission": "object",
        "profilePicture": "string",
        "roles": [
          "string enum: [ROLE_CUSTOMER | ROLE_DESIGNER | ROLE_PRINTER | ROLE_ADMIN | ROLE_SUPER_ADMIN | ROLE_MEMBER]"
        ]
      },
      "dispute": {
        "id": "integer (int64)",
        "disputeId": "string",
        "comment": "string",
        "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
        "status": "string enum: [CLOSED | OPEN]",
        "ticketCreated": "boolean",
        "customerProfile": "object",
        "order": "object",
        "closedDate": "string (date-time)"
      },
      "closedDate": "string (date-time)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `PageSubscriber`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "name": "string",
      "username": "string",
      "phoneNumber": "string",
      "email": "string",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `FileSimilarity`
```json
{
  "fileUpload": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "distance": "integer (int32)",
  "percentageMatch": "number (double)"
}
```

### `DesignSimilarity`
```json
{
  "designId": "integer (int64)",
  "designUploadId": "integer (int64)",
  "fileUpload": {
    "id": "integer (int64)",
    "name": "string",
    "path": "string",
    "originalFilePath": "string",
    "size": "integer (int64)",
    "contentType": "string",
    "exactHash": "string",
    "perceptualHash": "integer (int64)",
    "url": "string",
    "originalUrl": "string"
  },
  "percentageMatch": "number (double)",
  "designName": "string",
  "description": "string",
  "amount": "number"
}
```

### `PageLogisticRequest`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "senderName": "string",
      "senderPhoneNumber": "string",
      "senderEmail": "string",
      "senderCity": "string",
      "senderState": "string",
      "senderCountry": "string",
      "senderAddress": "string",
      "senderPostalCode": "string",
      "senderLongitude": "number (double)",
      "senderLatitude": "number (double)",
      "requestType": "string enum: [PICKUP | DELIVERY]",
      "status": "string enum: [PENDING | IN_PROGRESS | DONE]",
      "receiverName": "string",
      "receiverPhoneNumber": "string",
      "receiverEmail": "string",
      "receiverCity": "string",
      "receiverState": "string",
      "receiverCountry": "string",
      "receiverAddress": "string",
      "receiverPostalCode": "string",
      "receiverLongitude": "number (double)",
      "receiverLatitude": "number (double)",
      "orderId": "integer (int64)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `DisputeInsightResponse`
```json
{
  "pendingDisputeCount": "object"
}
```

### `DashboardInsightResponse`
```json
{
  "totalUsers": "integer (int64)",
  "totalNewUsers": "integer (int64)",
  "totalOrders": "integer (int64)",
  "totalNewOrders": "integer (int64)",
  "totalDesigns": "integer (int64)",
  "totalNewDesigns": "integer (int64)",
  "retentionRate": "integer (int64)",
  "avgUserActivePerDay": "integer (int32)",
  "avgUserActivePerWeek": "integer (int32)"
}
```

### `AuditLog`
```json
{
  "actorId": "integer (int64)",
  "actorProfileId": "integer (int64)",
  "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
  "type": "string enum: [ADMIN_LOGIN | ADMIN_ACCOUNT_CREATION | ADMIN_ACCOUNT_UPDATE | ADMIN_PASSWORD_RESET | BLOG_CREATION | BLOG_UPDATE | BLOG_DELETE | ADD_TO_CART | REMOVE_FROM_CART | CREATE_COLLECTION | UPDATE_COLLECTION | DELETE_COLLECTION | DESIGN_ORDER_REQUEST | PRINT_ORDER_REQUEST | USER_REGISTRATION | USER_LOGIN | USER_ACCOUNT_ACTIVATION | USER_GOOGLE_REGISTRATION | USER_GOOGLE_LOGIN | USER_FACEBOOK_REGISTRATION | USER_FACEBOOK_LOGIN | USER_RESET_PASSWORD | USER_CHANGE_PASSWORD | USER_UPDATE | CREATE_DESIGN | UPDATE_DESIGN | DELETE_DESIGN | APPROVE_DESIGN | DECLINE_DESIGN | LIKE_DESIGN | UNLIKE_DESIGN | CREATE_ORDER | CANCEL_ORDER | TRANSACTION | FOLLOW_PROFILE | UNFOLLOW_PROFILE | DISPUTE_CREATED | DISPUTE_CLOSED | ORDER_CREATED | ORDER_CANCELLED | ORDER_REJECTED | ORDER_DELIVERED | ORDER_COMPLETED | PROFILE_CREATED | PROFILE_UPDATED | PROFILE_SUSPENDED | PROFILE_DEACTIVATED | PROFILE_REACTIVATED | PROFILE_RATE | TICKET_CREATED | TICKET_UPDATED | TICKET_CLOSED]",
  "productId": "integer (int64)",
  "ipAddress": "string",
  "location": "string",
  "userAgent": "string",
  "browserType": "string",
  "userIsAdmin": "boolean"
}
```

### `PageAuditLog`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "actorId": "integer (int64)",
      "actorProfileId": "integer (int64)",
      "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
      "type": "string enum: [ADMIN_LOGIN | ADMIN_ACCOUNT_CREATION | ADMIN_ACCOUNT_UPDATE | ADMIN_PASSWORD_RESET | BLOG_CREATION | BLOG_UPDATE | BLOG_DELETE | ADD_TO_CART | REMOVE_FROM_CART | CREATE_COLLECTION | UPDATE_COLLECTION | DELETE_COLLECTION | DESIGN_ORDER_REQUEST | PRINT_ORDER_REQUEST | USER_REGISTRATION | USER_LOGIN | USER_ACCOUNT_ACTIVATION | USER_GOOGLE_REGISTRATION | USER_GOOGLE_LOGIN | USER_FACEBOOK_REGISTRATION | USER_FACEBOOK_LOGIN | USER_RESET_PASSWORD | USER_CHANGE_PASSWORD | USER_UPDATE | CREATE_DESIGN | UPDATE_DESIGN | DELETE_DESIGN | APPROVE_DESIGN | DECLINE_DESIGN | LIKE_DESIGN | UNLIKE_DESIGN | CREATE_ORDER | CANCEL_ORDER | TRANSACTION | FOLLOW_PROFILE | UNFOLLOW_PROFILE | DISPUTE_CREATED | DISPUTE_CLOSED | ORDER_CREATED | ORDER_CANCELLED | ORDER_REJECTED | ORDER_DELIVERED | ORDER_COMPLETED | PROFILE_CREATED | PROFILE_UPDATED | PROFILE_SUSPENDED | PROFILE_DEACTIVATED | PROFILE_REACTIVATED | PROFILE_RATE | TICKET_CREATED | TICKET_UPDATED | TICKET_CLOSED]",
      "productId": "integer (int64)",
      "ipAddress": "string",
      "location": "string",
      "userAgent": "string",
      "browserType": "string",
      "userIsAdmin": "boolean"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `ChartCount`
```json
{
  "count": "integer (int64)",
  "date": "string (date-time)"
}
```

### `ChartResponse`
```json
{
  "key": "string enum: [ADMIN_LOGIN | ADMIN_ACCOUNT_CREATION | ADMIN_ACCOUNT_UPDATE | ADMIN_PASSWORD_RESET | BLOG_CREATION | BLOG_UPDATE | BLOG_DELETE | ADD_TO_CART | REMOVE_FROM_CART | CREATE_COLLECTION | UPDATE_COLLECTION | DELETE_COLLECTION | DESIGN_ORDER_REQUEST | PRINT_ORDER_REQUEST | USER_REGISTRATION | USER_LOGIN | USER_ACCOUNT_ACTIVATION | USER_GOOGLE_REGISTRATION | USER_GOOGLE_LOGIN | USER_FACEBOOK_REGISTRATION | USER_FACEBOOK_LOGIN | USER_RESET_PASSWORD | USER_CHANGE_PASSWORD | USER_UPDATE | CREATE_DESIGN | UPDATE_DESIGN | DELETE_DESIGN | APPROVE_DESIGN | DECLINE_DESIGN | LIKE_DESIGN | UNLIKE_DESIGN | CREATE_ORDER | CANCEL_ORDER | TRANSACTION | FOLLOW_PROFILE | UNFOLLOW_PROFILE | DISPUTE_CREATED | DISPUTE_CLOSED | ORDER_CREATED | ORDER_CANCELLED | ORDER_REJECTED | ORDER_DELIVERED | ORDER_COMPLETED | PROFILE_CREATED | PROFILE_UPDATED | PROFILE_SUSPENDED | PROFILE_DEACTIVATED | PROFILE_REACTIVATED | PROFILE_RATE | TICKET_CREATED | TICKET_UPDATED | TICKET_CLOSED]",
  "counts": [
    {
      "count": "integer (int64)",
      "date": "string (date-time)"
    }
  ]
}
```

### `PageDispute`
```json
{
  "totalPages": "integer (int32)",
  "totalElements": "integer (int64)",
  "pageable": {
    "pageNumber": "integer (int32)",
    "pageSize": "integer (int32)",
    "offset": "integer (int64)",
    "sort": {
      "sorted": "boolean",
      "empty": "boolean",
      "unsorted": "boolean"
    },
    "paged": "boolean",
    "unpaged": "boolean"
  },
  "size": "integer (int32)",
  "content": [
    {
      "id": "integer (int64)",
      "disputeId": "string",
      "comment": "string",
      "disputeType": "string enum: [PAYMENT_ISSUES | UNRESPONSIVE_VENDOR | FRAUDULENT_ACT | VIOLATION_OF_TERMS]",
      "status": "string enum: [CLOSED | OPEN]",
      "ticketCreated": "boolean",
      "customerProfile": {
        "id": "integer (int64)",
        "profileType": "string enum: [CUSTOMER | DESIGNER | PRINTER]",
        "status": "string enum: [ACTIVE | PROBATION | TERMINATED]",
        "name": "string",
        "profileImage": "object",
        "coverImage": "object",
        "bio": "string",
        "reasonForProbation": "string",
        "reasonForTermination": "string",
        "probationDate": "string (date-time)",
        "terminationDate": "string (date-time)",
        "insight": "object",
        "distanceInKm": "number (double)",
        "userId": "integer (int64)",
        "userName": "string",
        "userEmail": "string",
        "userPhone": "string",
        "coverPic": "string",
        "categories": [
          "string"
        ],
        "profilePic": "string"
      },
      "order": {
        "id": "integer (int64)",
        "title": "string",
        "description": "string",
        "printingAmount": "number",
        "designAmount": "number",
        "pickupAmount": "number",
        "deliveryAmount": "number",
        "totalAmount": "number",
        "paid": "boolean",
        "transactionRef": "string",
        "paymentUrl": "string",
        "orderStatus": "string enum: [REVIEW | REJECTED | ACTIVE | CANCELLED | AWAITING_CONFIRMATION | COMPLETED | PICKUP_REQUESTED | DELIVER_REQUESTED]",
        "itemProvidedByCustomer": "boolean",
        "deliveryDate": "string (date)",
        "orderRequest": "object",
        "noOfReviews": "integer (int64)",
        "canceledByCustomer": "boolean",
        "amountPaidToProvider": "number",
        "amountPaidForDesign": "number",
        "ref": "string"
      },
      "closedDate": "string (date-time)"
    }
  ],
  "number": "integer (int32)",
  "sort": {
    "sorted": "boolean",
    "empty": "boolean",
    "unsorted": "boolean"
  },
  "first": "boolean",
  "last": "boolean",
  "numberOfElements": "integer (int32)",
  "empty": "boolean"
}
```

### `Bank`
```json
{
  "name": "string",
  "country": "string",
  "currency": "string",
  "code": "string"
}
```
