# Bruno API Test Cases — College Club Portal

## 1. Purpose

This document contains API test cases for the **actual College Club Portal backend**.

The backend is implemented in `server.js` using Node.js, Express and SQLite. Bruno sends HTTP requests directly to that backend.

```text
Bruno
  |
  | HTTP request
  v
Express API
  |
  v
SQLite (portal.db)
```

The frontend is not required when testing an endpoint in Bruno. The only requirement is that the backend is running.

---

## 2. Backend Base URL

For local testing:

```text
http://localhost:3000
```

Therefore:

```text
http://localhost:3000/api/clubs
```

is the full URL for the Clubs GET request.

---

## 3. Bruno Collection in This Project

The project contains:

```text
bruno/
└── Club Portal API/
    ├── bruno.json
    ├── 01 - Get Events.bru
    ├── 02 - Update Event PUT.bru
    ├── 03 - Delete Event DELETE.bru
    ├── 03 - Patch Event.bru
    ├── 04 - Get Members.bru
    ├── 05 - Update Member PUT.bru
    ├── 06 - Delete Member DELETE.bru
    ├── 07 - Patch Member.bru
    ├── 08 - Post Event.bru
    ├── 09 - Post Member.bru
    ├── 10 - Get Clubs.bru
    ├── 11 - Register.bru
    └── 12 - Login.bru
```

These requests are designed around the routes actually present in `server.js`.

---

## 4. Before Testing

Start the backend from the project root:

```bash
npm install
npm start
```

Confirm that the server is listening on port `3000`.

Then open Bruno and open the collection:

```text
Club Portal API
```

---

# 5. Authentication API Tests

## TC-AUTH-01 — Register a new user

**Method:** `POST`

**Endpoint:**

```text
/api/register
```

**Full URL:**

```text
http://localhost:3000/api/register
```

### Request header

```text
Content-Type: application/json
```

### Request body

The actual project uses:

```json
{
  "name": "Bruno Demo User",
  "email": "bruno-demo@example.com",
  "password": "demo123"
}
```

### Bruno steps

1. Open `11 - Register.bru`.
2. Confirm the method is POST.
3. Confirm the URL is `/api/register`.
4. Select JSON body.
5. Enter the request body.
6. Click **Send**.

### Expected status

```text
201 Created
```

### Representative response

```json
{
  "status": "success",
  "message": "User registered successfully!"
}
```

> This response is a representative output based on the backend code. It should not be treated as an executed test result.

---

## TC-AUTH-02 — Register without all required fields

**Method:** `POST`

**Endpoint:** `/api/register`

### Example body

```json
{
  "name": "Incomplete User",
  "email": "incomplete@example.com"
}
```

### Expected status

```text
400 Bad Request
```

### Expected response

```json
{
  "error": "All fields required"
}
```

---

## TC-AUTH-03 — Register duplicate email

Use an email that already exists in `users`.

### Expected status

```text
400 Bad Request
```

### Expected response

```json
{
  "error": "User/Email already exists"
}
```

---

## TC-AUTH-04 — Login with valid credentials

**Method:** `POST`

**Endpoint:** `/api/login`

### Body

```json
{
  "email": "bruno-demo@example.com",
  "password": "demo123"
}
```

### Expected status

```text
200 OK
```

### Representative response

```json
{
  "status": "success",
  "user": {
    "id": 1,
    "name": "Bruno Demo User",
    "email": "bruno-demo@example.com"
  }
}
```

The actual `id` depends on the database.

---

## TC-AUTH-05 — Login with invalid credentials

Use an incorrect email/password combination.

### Expected status

```text
401 Unauthorized
```

### Expected response

```json
{
  "error": "Invalid credentials"
}
```

---

# 6. Club API Tests

## TC-CLUB-01 — Get all clubs

**Method:** `GET`

**Endpoint:**

```text
/api/clubs
```

### Bruno request

```text
GET http://localhost:3000/api/clubs
```

### Expected status

```text
200 OK
```

### Representative response

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Coding Club",
      "category": "Technology",
      "description": "Build cool software and practice DSA."
    }
  ]
}
```

The project seeds Coding Club, Robotics Club and Design Club when the clubs table is empty.

### Important

There is currently **no** POST, PUT, PATCH or DELETE club endpoint in `server.js`.

---

# 7. Event API Tests

## TC-EVENT-01 — Get events

**Method:** `GET`

**Endpoint:** `/api/events`

### Request

```text
GET http://localhost:3000/api/events
```

### Expected status

```text
200 OK
```

The backend returns events ordered by descending `id`.

---

## TC-EVENT-02 — Create an event

**Method:** `POST`

**Endpoint:** `/api/events`

### Body

```json
{
  "title": "Bruno Test Event",
  "club_name": "Coding Club",
  "event_date": "2026-12-15",
  "location": "Lab 1"
}
```

### Expected status

```text
201 Created
```

### Expected response

```json
{
  "status": "success",
  "message": "Event added!"
}
```

### Bruno request

This corresponds to:

```text
08 - Post Event.bru
```

---

## TC-EVENT-03 — Create an event with incomplete data

Try removing one or more event values.

The current backend passes the supplied values directly to the SQLite INSERT operation. Therefore, do not document a `400 required fields` response unless that validation is added to the current `server.js`.

For this version, the correct test objective is to observe the actual backend/database response rather than assume frontend `required` attributes are API validation.

This distinction is important:

```text
HTML required attribute != backend validation
```

---

## TC-EVENT-04 — Update an event with PUT

**Method:** `PUT`

**Endpoint:**

```text
/api/events/:id
```

Example:

```text
/api/events/1
```

### Body

```json
{
  "title": "TECH HUNT UPDATED",
  "club_name": "Coding Club",
  "event_date": "2026-09-15",
  "location": "Lab 3"
}
```

### Expected status when the ID exists

```text
200 OK
```

### Expected response

```json
{
  "status": "success",
  "message": "Event updated successfully"
}
```

### Non-existing ID

Example:

```text
PUT /api/events/99999
```

Expected status:

```text
404 Not Found
```

Expected response:

```json
{
  "error": "Event not found"
}
```

---

## TC-EVENT-05 — Partially update an event with PATCH

**Method:** `PATCH`

**Endpoint:** `/api/events/:id`

Example:

```text
/api/events/1
```

### Body

Only the field that needs changing is required.

```json
{
  "location": "Updated Lab"
}
```

### Expected status

```text
200 OK
```

### Expected response

```json
{
  "status": "success",
  "message": "Event partially updated successfully"
}
```

### Empty PATCH

```json
{}
```

Expected status:

```text
400 Bad Request
```

Expected response:

```json
{
  "error": "At least one valid field is required"
}
```

### Non-existing event

Expected status:

```text
404 Not Found
```

---

## TC-EVENT-06 — Delete an event

**Method:** `DELETE`

**Endpoint:** `/api/events/:id`

Example:

```text
DELETE http://localhost:3000/api/events/1
```

### Expected status

```text
200 OK
```

### Expected response

```json
{
  "status": "success",
  "message": "Event deleted successfully"
}
```

### Verify deletion

Run:

```text
GET /api/events
```

and confirm that the deleted event is no longer in the returned list.

### Non-existing event

Expected status:

```text
404 Not Found
```

with:

```json
{
  "error": "Event not found"
}
```

---

# 8. Member API Tests

## TC-MEMBER-01 — Get members

**Method:** `GET`

**Endpoint:** `/api/members`

### Request

```text
GET http://localhost:3000/api/members
```

### Expected status

```text
200 OK
```

The backend returns members ordered by descending ID.

---

## TC-MEMBER-02 — Create a member for a registered user

**Method:** `POST`

**Endpoint:** `/api/members`

### Important precondition

The email must already exist in the `users` table.

Therefore, first run:

```text
POST /api/register
```

with the same email.

### Body

```json
{
  "fullName": "Bruno Test User",
  "email": "bruno-test@example.com",
  "club": "Coding Club"
}
```

### Expected status

```text
201 Created
```

### Expected response

```json
{
  "status": "success",
  "message": "Member registered to club!"
}
```

---

## TC-MEMBER-03 — Try to add an unregistered user

Use an email that does not exist in the `users` table.

### Body

```json
{
  "fullName": "Unregistered Student",
  "email": "not-registered@example.com",
  "club": "Coding Club"
}
```

### Expected status

```text
400 Bad Request
```

### Expected response

```json
{
  "error": "User is not registered. Please register before becoming a club member."
}
```

This is an important business rule of the project:

```text
Register account first
        ↓
Use same email for membership
        ↓
Member record can be created
```

---

## TC-MEMBER-04 — Duplicate member email

Use an email that is already present in the `members` table.

### Expected status

```text
400 Bad Request
```

### Expected response

```json
{
  "error": "User is already a club member"
}
```

The database has a UNIQUE constraint on member email, and the backend converts that constraint error into this message.

---

## TC-MEMBER-05 — Missing member fields

The backend explicitly checks:

```text
fullName
email
club
```

### Example

```json
{
  "fullName": "Student"
}
```

### Expected status

```text
400 Bad Request
```

### Expected response

```json
{
  "error": "Full name, email and club are required"
}
```

---

## TC-MEMBER-06 — Update a member with PUT

**Method:** `PUT`

**Endpoint:** `/api/members/:id`

Example:

```text
/api/members/1
```

### Body

```json
{
  "fullName": "Updated Student",
  "email": "updated@example.com",
  "club": "Coding Club",
  "role": "Member"
}
```

The email must belong to a registered user.

### Expected status when successful

```text
200 OK
```

### Expected response

```json
{
  "status": "success",
  "message": "Member updated successfully"
}
```

### Missing required member fields

Expected status:

```text
400 Bad Request
```

---

## TC-MEMBER-07 — PATCH a member

**Method:** `PATCH`

**Endpoint:** `/api/members/:id`

Example:

```text
/api/members/1
```

### Body

```json
{
  "club": "Design Club"
}
```

The backend supports these PATCH fields:

```text
fullName
email
club
role
```

### Expected status

```text
200 OK
```

### Expected response

```json
{
  "status": "success",
  "message": "Member partially updated successfully"
}
```

### Empty PATCH

```json
{}
```

Expected:

```text
400 Bad Request
```

with:

```json
{
  "error": "At least one valid field is required"
}
```

### PATCH email validation

If `email` is included, the new email must belong to an existing user account.

Otherwise:

```json
{
  "error": "User is not registered. Please register before becoming a club member."
}
```

is returned with HTTP 400.

---

## TC-MEMBER-08 — Delete a member

**Method:** `DELETE`

**Endpoint:** `/api/members/:id`

Example:

```text
DELETE http://localhost:3000/api/members/1
```

### Expected status

```text
200 OK
```

### Expected response

```json
{
  "status": "success",
  "message": "Member deleted"
}
```

### Verify deletion

Run:

```text
GET /api/members
```

and verify that the member is no longer present.

### Non-existing ID

Expected status:

```text
404 Not Found
```

with:

```json
{
  "error": "Member not found"
}
```

---

# 9. Negative API Testing

Negative tests deliberately send invalid input or invalid resource IDs.

For this project, useful negative tests include:

| Test | Example |
|---|---|
| Missing registration field | POST `/api/register` without password |
| Duplicate user | POST `/api/register` with an existing email |
| Invalid login | POST `/api/login` with wrong password |
| Unregistered member | POST `/api/members` using an email not in users |
| Duplicate member | POST `/api/members` using an existing member email |
| Missing member fields | POST `/api/members` without `club` |
| Empty event PATCH | PATCH `/api/events/1` with `{}` |
| Empty member PATCH | PATCH `/api/members/1` with `{}` |
| Missing event | PUT/PATCH/DELETE `/api/events/99999` |
| Missing member | PUT/PATCH/DELETE `/api/members/99999` |

Negative testing is useful because it verifies that the backend does not only work for valid requests; it also handles invalid requests with appropriate errors.

---

# 10. PUT vs PATCH in This Project

### PUT

The event PUT route receives the event fields as a complete update:

```json
{
  "title": "Updated Event",
  "club_name": "Coding Club",
  "event_date": "2026-12-20",
  "location": "Lab 2"
}
```

The member PUT route similarly receives the member's required information.

### PATCH

PATCH is used for partial changes.

For example, changing only an event location:

```json
{
  "location": "New Lab"
}
```

or only the member's club:

```json
{
  "club": "Design Club"
}
```

This difference is useful to demonstrate in Bruno.

---

# 11. Recommended Bruno Demonstration Sequence

Use this sequence during the college demonstration.

### Step 1 — Check clubs

```text
GET /api/clubs
```

### Step 2 — Check events

```text
GET /api/events
```

### Step 3 — Check members

```text
GET /api/members
```

### Step 4 — Register a test user

```text
POST /api/register
```

### Step 5 — Login

```text
POST /api/login
```

### Step 6 — Create an event

```text
POST /api/events
```

### Step 7 — Create a member

First make sure the member email was registered.

```text
POST /api/members
```

### Step 8 — Update event with PUT

```text
PUT /api/events/:id
```

### Step 9 — Partially update event with PATCH

```text
PATCH /api/events/:id
```

### Step 10 — Update member with PUT

```text
PUT /api/members/:id
```

### Step 11 — Partially update member with PATCH

```text
PATCH /api/members/:id
```

### Step 12 — Delete event/member

```text
DELETE /api/events/:id
DELETE /api/members/:id
```

### Step 13 — Verify using GET

```text
GET /api/events
GET /api/members
```

This sequence demonstrates the full CRUD lifecycle plus authentication and validation.

---

# 12. Test Case Summary

| ID | Method | Endpoint | Scenario | Expected Status |
|---|---|---|---|---|
| TC-AUTH-01 | POST | `/api/register` | Valid registration | 201 |
| TC-AUTH-02 | POST | `/api/register` | Missing field | 400 |
| TC-AUTH-03 | POST | `/api/register` | Duplicate email | 400 |
| TC-AUTH-04 | POST | `/api/login` | Valid credentials | 200 |
| TC-AUTH-05 | POST | `/api/login` | Invalid credentials | 401 |
| TC-CLUB-01 | GET | `/api/clubs` | Get clubs | 200 |
| TC-EVENT-01 | GET | `/api/events` | Get events | 200 |
| TC-EVENT-02 | POST | `/api/events` | Create event | 201 |
| TC-EVENT-03 | POST | `/api/events` | Incomplete event input | Observe actual backend response |
| TC-EVENT-04 | PUT | `/api/events/:id` | Update event | 200 / 404 |
| TC-EVENT-05 | PATCH | `/api/events/:id` | Partial event update | 200 / 400 / 404 |
| TC-EVENT-06 | DELETE | `/api/events/:id` | Delete event | 200 / 404 |
| TC-MEMBER-01 | GET | `/api/members` | Get members | 200 |
| TC-MEMBER-02 | POST | `/api/members` | Registered user joins club | 201 |
| TC-MEMBER-03 | POST | `/api/members` | Unregistered user | 400 |
| TC-MEMBER-04 | POST | `/api/members` | Duplicate member | 400 |
| TC-MEMBER-05 | POST | `/api/members` | Missing member fields | 400 |
| TC-MEMBER-06 | PUT | `/api/members/:id` | Update member | 200 / 400 / 404 |
| TC-MEMBER-07 | PATCH | `/api/members/:id` | Partial member update | 200 / 400 / 404 |
| TC-MEMBER-08 | DELETE | `/api/members/:id` | Delete member | 200 / 404 |

---

# 13. Actual Output Recording

When performing the tests in Bruno, record the result using this format:

```text
Test Case: TC-EVENT-02
Method: POST
Endpoint: /api/events
Status: 201
Result: PASS
```

For a failed test:

```text
Test Case: TC-EVENT-02
Method: POST
Endpoint: /api/events
Status: 500
Result: FAIL
Observed Error: <paste the actual response here>
```

Do not write PASS merely because an endpoint is expected to work. Mark it PASS only after running the request and checking the response.

---

# 14. Important Testing Notes

### Do not assume ID 1 exists

The Bruno sample requests use `/1`, but database records can be deleted. Always check:

```text
GET /api/events
GET /api/members
```

before testing an update/delete against a particular ID.

### Member test dependency

A member cannot be created unless its email already exists in the `users` table.

Therefore:

```text
Register
   ↓
POST /api/register
   ↓
POST /api/members using the same email
```

### Frontend form validation vs API validation

The browser forms use HTML `required` attributes, but Bruno bypasses those browser controls. Therefore Bruno is useful for testing what the backend itself actually validates.

### Bruno does not need the frontend

You can close the browser and still test:

```text
http://localhost:3000/api/...
```

through Bruno as long as the Node.js server is running.

---

# 15. College Viva Explanation

A short explanation for a demonstration:

> **"Our frontend communicates with the Node.js and Express backend through REST APIs. We use Bruno as an independent API testing tool to test the same backend directly. The backend stores the data in SQLite. We demonstrate GET for reading data, POST for creating data, PUT for complete updates, PATCH for partial updates, and DELETE for removing records. This lets us verify the backend separately from the frontend."**

If asked why Bruno is needed when the frontend already works:

> **"The frontend proves the user interface can use the API, while Bruno lets us test the API directly and inspect the HTTP request and response without depending on the frontend."**

---

# 16. Final Bruno Checklist

- [ ] Node.js server is running
- [ ] SQLite database is connected
- [ ] Bruno collection is opened
- [ ] `GET /api/clubs` tested
- [ ] `GET /api/events` tested
- [ ] `GET /api/members` tested
- [ ] Registration tested
- [ ] Login tested
- [ ] Event POST tested
- [ ] Member POST tested with a registered user
- [ ] Unregistered member case tested
- [ ] Duplicate member case tested
- [ ] Event PUT tested
- [ ] Event PATCH tested
- [ ] Event DELETE tested
- [ ] Member PUT tested
- [ ] Member PATCH tested
- [ ] Member DELETE tested
- [ ] GET requests used to verify changes
- [ ] Actual status codes recorded
- [ ] Actual response bodies recorded

---

## 17. Endpoint Reference

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/register` | Register user |
| POST | `/api/login` | Login user |
| GET | `/api/clubs` | Get clubs |
| GET | `/api/events` | Get events |
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| PATCH | `/api/events/:id` | Partially update event |
| DELETE | `/api/events/:id` | Delete event |
| GET | `/api/members` | Get members |
| POST | `/api/members` | Add member |
| PUT | `/api/members/:id` | Update member |
| PATCH | `/api/members/:id` | Partially update member |
| DELETE | `/api/members/:id` | Delete member |

No GET-by-ID route is listed because the current `server.js` does not implement one.
