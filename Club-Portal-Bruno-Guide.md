# Club Portal — Setup and Bruno API Testing Guide

## 1. Project Overview

This project is a college club registration portal built with:

- Node.js
- Express.js
- SQLite
- HTML/CSS/JavaScript
- Bruno for API testing

The frontend calls the backend directly. Bruno independently tests the backend APIs.

```text
Frontend ────────→ Express Backend ────────→ SQLite Database
                         ↑
                         │
                       Bruno
```

## 2. Requirements

Install:

- Node.js
- npm
- Bruno

Check Node.js and npm:

```bash
node --version
npm --version
```

## 3. Run the Project

### Step 1 — Extract the ZIP

Extract the project and open a terminal.

```bash
cd ~/Downloads
cd club-portal
```

If your extracted folder has a different name, use that name.

### Step 2 — Install dependencies

```bash
npm install
```

This reads `package.json` and installs the required packages into `node_modules`.

### Step 3 — Start the backend

```bash
npm start
```

You should see messages similar to:

```text
Server running on http://localhost:3000
Connected to SQLite database.
```

The SQLite database `portal.db` is created automatically.

### Step 4 — Open the frontend

Open:

```text
http://localhost:3000
```

### Step 5 — Keep the terminal running

Do not close the terminal while using the application or Bruno.

Stop the server with:

```text
Ctrl + C
```

## 4. Bruno Setup

1. Open Bruno.
2. Open the collection:

```text
bruno/Club Portal API/
```

3. Make sure the backend is running with:

```bash
npm start
```

4. Run the requests in Bruno.

The collection contains prepared requests for GET, POST, PUT, PATCH and DELETE.

## 5. REST Methods

| Method | Purpose | Example |
|---|---|---|
| GET | Read data | Get events |
| POST | Create data | Add event |
| PUT | Complete update | Update an event |
| PATCH | Partial update | Change only location |
| DELETE | Remove data | Delete an event |

GET and POST are used by the frontend. PUT, PATCH and DELETE are implemented in the backend and tested directly through Bruno.

# 6. GET — Read Data

## Events

Endpoint:

```text
GET http://localhost:3000/api/events
```

### Bruno steps

1. Open `Get Events`.
2. Select `GET`.
3. Enter:

```text
http://localhost:3000/api/events
```

4. Click **Send**.

Example response:

```json
[
  {
    "id": 1,
    "title": "TECH HUNT",
    "club_name": "Coding Club",
    "event_date": "2026-09-15",
    "location": "Lab 3"
  }
]
```

The exact data depends on the current database.

## Other GET endpoints

```text
GET http://localhost:3000/api/clubs
GET http://localhost:3000/api/members
```

# 7. POST — Create Data

POST creates a new record.

## Add Event

Endpoint:

```text
POST http://localhost:3000/api/events
```

### Bruno steps

1. Open `Post Event`.
2. Select `POST`.
3. Enter the endpoint.
4. Set body type to JSON.
5. Add header:

```text
Content-Type: application/json
```

6. Add:

```json
{
  "title": "Bruno Test Event",
  "club_name": "Coding Club",
  "event_date": "2026-12-15",
  "location": "Lab 1"
}
```

7. Click **Send**.

Example success response:

```json
{
  "status": "success",
  "id": 4
}
```

The ID depends on the database.

Verify with:

```text
GET http://localhost:3000/api/events
```

## Add Member

Endpoint:

```text
POST http://localhost:3000/api/members
```

Body:

```json
{
  "fullName": "Bruno Test User",
  "email": "bruno-test@example.com",
  "club": "Coding Club"
}
```

# 8. PUT — Complete Update

PUT updates the complete record.

First run:

```text
GET http://localhost:3000/api/events
```

Find an existing event ID. Assume it is `1`.

Endpoint:

```text
PUT http://localhost:3000/api/events/1
```

### Bruno steps

1. Open `Update Event PUT`.
2. Select `PUT`.
3. Enter:

```text
http://localhost:3000/api/events/1
```

4. Set body type to JSON.
5. Add:

```text
Content-Type: application/json
```

6. Send the complete event:

```json
{
  "title": "TECH HUNT UPDATED",
  "club_name": "Coding Club",
  "event_date": "2026-09-15",
  "location": "Lab 3"
}
```

7. Click **Send**.

Example response:

```json
{
  "status": "success",
  "message": "Event updated successfully"
}
```

Verify using:

```text
GET http://localhost:3000/api/events
```

Replace `1` with an existing ID.

## PUT Member

Endpoint:

```text
PUT http://localhost:3000/api/members/1
```

Example body:

```json
{
  "fullName": "Updated Student",
  "email": "updated@example.com",
  "club": "Coding Club",
  "role": "Member"
}
```

# 9. PATCH — Partial Update

PATCH changes only selected fields.

Assume event ID `1` exists.

Endpoint:

```text
PATCH http://localhost:3000/api/events/1
```

### Bruno steps

1. Open `Patch Event`.
2. Select `PATCH`.
3. Enter the endpoint.
4. Set body type to JSON.
5. Add:

```text
Content-Type: application/json
```

6. Send only the field to change:

```json
{
  "location": "Updated Lab"
}
```

7. Click **Send**.

Example response:

```json
{
  "status": "success",
  "message": "Event partially updated successfully"
}
```

Only the location changes.

Verify with:

```text
GET http://localhost:3000/api/events
```

## PATCH Member

Endpoint:

```text
PATCH http://localhost:3000/api/members/1
```

Example:

```json
{
  "club": "Design Club"
}
```

# 10. DELETE — Remove Data

DELETE removes an existing record.

First use:

```text
GET http://localhost:3000/api/events
```

Find an existing ID.

Assume the ID is `1`.

Endpoint:

```text
DELETE http://localhost:3000/api/events/1
```

### Bruno steps

1. Open `Delete Event DELETE`.
2. Select `DELETE`.
3. Enter:

```text
http://localhost:3000/api/events/1
```

4. No body is required.
5. Click **Send**.

Example response:

```json
{
  "status": "success",
  "message": "Event deleted successfully"
}
```

Verify:

```text
GET http://localhost:3000/api/events
```

The deleted event should no longer appear.

**Warning:** DELETE actually removes the record from SQLite.

## DELETE Member

Endpoint:

```text
DELETE http://localhost:3000/api/members/1
```

No request body is required.

# 11. Other Endpoints

## Register

```text
POST http://localhost:3000/api/register
```

Body:

```json
{
  "name": "Bruno Demo User",
  "email": "bruno-demo@example.com",
  "password": "demo123"
}
```

## Login

```text
POST http://localhost:3000/api/login
```

Body:

```json
{
  "email": "bruno-demo@example.com",
  "password": "demo123"
}
```

## Clubs

```text
GET http://localhost:3000/api/clubs
```

# 12. Recommended Five-Method Demonstration

For a college presentation, use this sequence:

### 1. GET

```text
GET /api/events
```

Show existing events.

### 2. POST

```text
POST /api/events
```

Create a test event:

```json
{
  "title": "Bruno Demo Event",
  "club_name": "Coding Club",
  "event_date": "2026-12-20",
  "location": "Lab 2"
}
```

### 3. GET

Confirm the new event exists and note its ID.

### 4. PUT

```text
PUT /api/events/{id}
```

Send all event fields to demonstrate a complete update.

### 5. GET

Confirm the complete update.

### 6. PATCH

```text
PATCH /api/events/{id}
```

Send only:

```json
{
  "location": "Seminar Hall"
}
```

Explain that PATCH changes only the selected field.

### 7. GET

Confirm the partial update.

### 8. DELETE

```text
DELETE /api/events/{id}
```

Delete the test event.

### 9. GET

Confirm that the event has been removed.

This demonstrates all five REST methods clearly.

# 13. Frontend vs Bruno

The frontend does not need to implement every API method.

```text
                 FRONTEND
                GET + POST
                    │
                    ▼
              EXPRESS BACKEND
        GET POST PUT PATCH DELETE
                    │
                    ▼
               SQLITE DB


                  BRUNO
        GET POST PUT PATCH DELETE
                    │
                    ▼
              EXPRESS BACKEND
```

Presentation explanation:

> "The frontend implements the user-facing operations required by the portal. The backend exposes the complete REST API, and Bruno is used to independently test GET, POST, PUT, PATCH and DELETE."

# 14. Troubleshooting

## npm install fails

Check your current directory:

```bash
pwd
```

Then:

```bash
cd ~
cd ~/Downloads
cd club-portal
npm install
```

## Bruno says connection refused

Start the backend:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## PUT/PATCH/DELETE returns 404

The ID may not exist.

Run:

```text
GET http://localhost:3000/api/events
```

or:

```text
GET http://localhost:3000/api/members
```

Use an ID returned by GET.

## POST returns an error

Check that:

```text
Content-Type: application/json
```

is set and that the required JSON fields are present.

# 15. Important Project Files

```text
club-portal/
├── server.js
├── package.json
├── public/
│   ├── index.html
│   ├── app.js
│   └── bruno-results.json
├── bruno/
│   └── Club Portal API/
│       ├── bruno.json
│       └── *.bru
└── ENDPOINT-TEST-REPORT.md
```

- `server.js` — Express backend, database setup and API endpoints.
- `package.json` — project information, dependencies and start command.
- `package-lock.json` — exact dependency tree generated by npm.
- `node_modules` — installed Node.js packages.
- `public/index.html` — frontend UI.
- `public/app.js` — frontend JavaScript and live API calls.
- `.bru` files — Bruno API requests.
- `bruno.json` — Bruno collection metadata.
- `bruno-results.json` — stored/example API result data; not required for the backend to run.
- `portal.db` — SQLite database created when the server starts.

# 16. Quick Start

```bash
cd ~/Downloads/club-portal
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Then in Bruno:

1. Open `bruno/Club Portal API`.
2. Make sure the server is running.
3. Run GET first to find IDs.
4. Test POST.
5. Test PUT.
6. Test PATCH.
7. Test DELETE.
8. Use GET after changes to verify the results.
