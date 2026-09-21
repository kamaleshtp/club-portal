# Club Portal — Setup and API Guide

## 1. Project Overview

The **College Club Portal** is a small web application for managing college clubs, events, and club members.

This project is built as a single Node.js application where the Express backend serves the frontend files from `public/` and exposes REST APIs. SQLite is used as the local database, and Bruno is included as an independent API-testing tool.

### Main features implemented in the project

- User registration
- User login
- Viewing available clubs
- Viewing scheduled events
- Adding events
- Viewing club members
- Registering a user as a club member
- Updating and deleting events through REST APIs
- Updating and deleting members through REST APIs
- Partial updates using PATCH
- Live API monitoring inside the frontend
- Independent API testing using Bruno

The application has two related API-testing views:

1. **Frontend API activity** — the web application records the real API calls made by its own JavaScript.
2. **Bruno API testing** — Bruno sends requests directly to the Express backend without going through the frontend.

---

## 2. Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | User interface and browser-side API calls |
| Backend | Node.js + Express | REST API and static-file server |
| Database | SQLite | Stores users, clubs, events and members |
| API testing | Bruno | Independent REST API testing |
| Cross-origin support | CORS | Allows API requests from supported origins |
| Deployment | GitHub + Render | Source hosting and web deployment |

The project does **not** require React, Spring Boot, MongoDB, PostgreSQL, or a separate frontend server.

---

## 3. Actual Project Architecture

```text
                 Browser
                    |
                    v
          public/index.html
                    |
                    v
              public/app.js
                    |
             fetch('/api/...')
                    |
                    v
             Express server
                server.js
                    |
                    v
              SQLite database
                portal.db
```

For Bruno, the flow is different:

```text
Bruno
  |
  | HTTP request
  v
Express REST API
  |
  v
SQLite database
```

### Important distinction

Bruno does **not** run the frontend. It directly tests the backend endpoints.

The frontend also does not call Bruno. The frontend uses JavaScript `fetch()` requests directly against the Express API.

---

## 4. Project Structure

The important project files are:

```text
club-portal/
├── server.js
├── package.json
├── package-lock.json
├── portal.db                 # created when SQLite is used
├── public/
│   ├── index.html
│   ├── app.js
│   └── bruno-results.json
├── bruno/
│   └── Club Portal API/
│       ├── bruno.json
│       ├── 01 - Get Events.bru
│       ├── 02 - Update Event PUT.bru
│       ├── 03 - Delete Event DELETE.bru
│       ├── 03 - Patch Event.bru
│       ├── 04 - Get Members.bru
│       ├── 05 - Update Member PUT.bru
│       ├── 06 - Delete Member DELETE.bru
│       ├── 07 - Patch Member.bru
│       ├── 08 - Post Event.bru
│       ├── 09 - Post Member.bru
│       ├── 10 - Get Clubs.bru
│       ├── 11 - Register.bru
│       └── 12 - Login.bru
└── ENDPOINT-TEST-REPORT.md
```

### `server.js`

The main backend file. It:

- Creates the Express application
- Enables JSON request parsing
- Enables CORS
- Serves the `public/` folder
- Opens SQLite
- Creates database tables
- Seeds default clubs/events when the clubs table is empty
- Implements authentication, club, event and member endpoints
- Starts the server on port `3000`

### `public/index.html`

Contains the actual portal interface, including:

- Login/Register screen
- Clubs page
- Events page
- Members page
- API Tests page
- Event form
- Member form

### `public/app.js`

Contains the browser-side logic. It calls the backend using `fetch()` and updates the page with API responses.

The project has an `apiFetch()` wrapper which records method, URL, status and request duration for the live API activity display.

### `portal.db`

SQLite database file used by the backend. It is created/used by:

```js
new sqlite3.Database('./portal.db')
```

---

## 5. Database Used by This Project

The backend creates four tables.

### `users`

```text
id
name
email
password
```

The email is unique.

Used by:

- Registration
- Login
- Member-registration validation

### `clubs`

```text
id
name
category
description
```

When the database has no clubs, the current backend seeds:

- Coding Club
- Robotics Club
- Design Club

### `events`

```text
id
title
club_name
event_date
location
```

### `members`

```text
id
fullName
email
club
role
```

`role` has a default value of `Member`, and member email is unique.

---

## 6. Linux Setup for This Project

### Check the current directory

```bash
pwd
```

### List files

```bash
ls
```

### Move into a directory

```bash
cd ~/Downloads/club-portal
```

### Install packages

```bash
npm install
```

### Start the project

```bash
npm start
```

The project's `package.json` defines:

```json
"scripts": {
  "start": "node server.js"
}
```

So `npm start` runs `node server.js`.

### Useful Linux commands

| Command | Purpose |
|---|---|
| `pwd` | Shows current directory |
| `ls` | Lists files |
| `cd folder` | Changes directory |
| `mkdir folder` | Creates a directory |
| `touch file` | Creates an empty file |
| `cp` | Copies files |
| `mv` | Moves/renames files |
| `rm` | Removes files |
| `cat file` | Displays file contents |
| `clear` | Clears terminal |
| `sudo` | Runs a command with administrator privileges |
| `sudo apt update` | Refreshes package information |
| `sudo apt upgrade` | Installs available system updates |

### Check Node.js and npm

```bash
node --version
npm --version
```

---

## 7. Running the Club Portal Locally

From the project directory:

```bash
npm install
npm start
```

The backend prints a message similar to:

```text
Connected to SQLite database.
🚀 Dashboard running at http://localhost:3000
```

Open:

```text
http://localhost:3000
```

The Express server serves `public/index.html` automatically because the backend contains:

```js
app.use(express.static(path.join(__dirname, 'public')));
```

---

## 8. How the Frontend Actually Uses the Backend

The frontend uses JavaScript `fetch()` calls.

The project defines:

```js
async function apiFetch(url, options = {}) {
    const response = await fetch(url, options);
    // records API activity
    return response;
}
```

Examples from the actual frontend:

### Loading clubs

```text
GET /api/clubs
```

The returned `data` array is rendered into the Clubs page.

### Loading events

```text
GET /api/events
```

The returned events are rendered into the Events page.

### Loading members

```text
GET /api/members
```

The returned members are rendered into the Members page.

### Registering a member

The frontend sends:

```json
{
  "fullName": "Student Name",
  "email": "student@example.com",
  "club": "Coding Club"
}
```

to:

```text
POST /api/members
```

### Creating an event

The frontend sends:

```json
{
  "title": "Bruno Demo Event",
  "club_name": "Coding Club",
  "event_date": "2026-12-15",
  "location": "Lab 1"
}
```

to:

```text
POST /api/events
```

---

## 9. Pages in the Actual Frontend

The sidebar in `index.html` contains four application sections:

### Clubs

Calls `GET /api/clubs` and displays the club category, name and description.

### Events

Calls `GET /api/events` and displays event title, club, date and location. It also contains a form for adding an event.

### Members

Calls `GET /api/members` and displays member name, club and email. It also contains a member-registration form.

### API Tests

This is a **live API monitor**, not a static Bruno-results viewer.

When the page runs live API checks, it calls:

```text
GET /api/clubs
GET /api/events
GET /api/members
```

The page displays the real HTTP status and JSON response received from the backend.

The frontend code explicitly indicates that the live results do not depend on the static `bruno-results.json` file.

---

## 10. Authentication Flow

The authentication UI has Login and Register tabs.

### Register

The frontend sends:

```json
{
  "name": "Bruno Demo User",
  "email": "bruno-demo@example.com",
  "password": "demo123"
}
```

to:

```text
POST /api/register
```

The backend inserts the user into the `users` table.

### Login

The frontend sends:

```json
{
  "email": "bruno-demo@example.com",
  "password": "demo123"
}
```

to:

```text
POST /api/login
```

The backend checks the email/password against the `users` table and returns the user's `id`, `name` and `email` when valid.

This implementation is a simple project/demo login system; it does not implement JWT authentication.

---

## 11. Club API

### GET `/api/clubs`

Returns all clubs.

Example response structure:

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

There is no POST/PUT/PATCH/DELETE club route in the current `server.js`.

---

## 12. Event APIs

### GET `/api/events`

Returns events ordered by ID descending.

### POST `/api/events`

Creates an event using:

```text
title
club_name
event_date
location
```

### PUT `/api/events/:id`

Replaces the event fields for the specified ID.

### PATCH `/api/events/:id`

Updates only the supplied allowed fields:

```text
title
club_name
event_date
location
```

At least one valid field must be supplied.

### DELETE `/api/events/:id`

Deletes the specified event.

A non-existing event returns:

```json
{
  "error": "Event not found"
}
```

---

## 13. Member APIs

### GET `/api/members`

Returns members ordered by ID descending.

### POST `/api/members`

Requires:

```text
fullName
email
club
```

The current backend first checks whether the email exists in the `users` table.

If the user is not registered, it returns HTTP 400 with:

```json
{
  "error": "User is not registered. Please register before becoming a club member."
}
```

The member email is also unique, so attempting to create the same member email again produces an error.

### PUT `/api/members/:id`

Updates:

```text
fullName
email
club
role
```

The email must belong to a registered user when supplied.

### PATCH `/api/members/:id`

Allows partial updates of:

```text
fullName
email
club
role
```

If `email` is changed, the new email must belong to a registered user.

### DELETE `/api/members/:id`

Deletes the specified member.

---

## 14. HTTP Status Codes Used by the Backend

| Status | Meaning in this project |
|---|---|
| `200` | Successful GET/update/login response |
| `201` | Resource successfully created |
| `400` | Invalid request or business validation error |
| `401` | Invalid login credentials |
| `404` | Requested event/member ID does not exist |
| `500` | Server/database error |

---

## 15. Bruno in This Project

Bruno is used to test the Express REST API independently from the browser interface.

The collection is:

```text
bruno/Club Portal API/
```

It contains saved requests for:

- GET Events
- PUT Event
- DELETE Event
- PATCH Event
- GET Members
- PUT Member
- DELETE Member
- PATCH Member
- POST Event
- POST Member
- GET Clubs
- Register
- Login

### Base URL used by the Bruno collection

```text
http://localhost:3000
```

For example:

```text
GET http://localhost:3000/api/events
```

---

## 16. Why Bruno Is Separate From the Frontend

The project intentionally demonstrates two ways to interact with the same backend.

```text
                 +--> Browser Frontend --> Express --> SQLite
                 |
User ------------+
                 |
                 +--> Bruno ------------> Express --> SQLite
```

This makes Bruno useful during a college demonstration because you can show that the API can be tested directly even without using the portal UI.

The frontend exposes the user-facing operations needed by the portal. The backend also contains PUT, PATCH and DELETE routes, which are convenient to test directly in Bruno.

---

## 17. Live API Test Page vs `bruno-results.json`

The project contains:

```text
public/bruno-results.json
```

However, the current `app.js` live API monitor does not use that file to generate its results.

Instead, it calls the backend directly and displays the live responses.

The API Tests page runs:

```text
GET /api/clubs
GET /api/events
GET /api/members
```

and displays their current status and response JSON.

Therefore:

```text
Frontend API Tests page = live backend calls
Bruno = independent API testing tool
bruno-results.json = not required for the live API checks
```

---

## 18. GitHub and Render Deployment

The project can be stored in GitHub and deployed as a Node.js web service on Render.

The important deployment idea is:

```text
GitHub repository
       |
       v
Render Node.js service
       |
       v
node server.js
       |
       v
Club Portal
```

For a Render deployment, the server should use the platform-provided `PORT` environment variable and bind to the appropriate host. If the deployed version has been updated for Render, keep that deployment-specific configuration in the actual `server.js` rather than changing the frontend.

### SQLite deployment note

The current application uses a local SQLite file. On hosting platforms, local filesystem persistence may not be suitable for permanent production data. For a college demonstration this architecture is simple and useful, but a production system would normally use a persistent database service.

---

## 19. Troubleshooting

### `npm: command not found`

Install Node.js and npm, then check:

```bash
node --version
npm --version
```

### Dependencies are missing

Run:

```bash
npm install
```

### Port 3000 is already in use

Find the process using the port or stop the previous Node process before running `npm start` again.

### Browser cannot load the portal

Confirm the terminal shows the server is running and open:

```text
http://localhost:3000
```

### Bruno gets connection refused

Start the backend first:

```bash
npm start
```

Then use:

```text
http://localhost:3000
```

as the Bruno base address.

### Member creation fails for a new person

This is expected if that email has not first been registered through:

```text
POST /api/register
```

The current member API requires the email to already exist in `users`.

### Event/member ID gives 404

Check the actual IDs returned by:

```text
GET /api/events
GET /api/members
```

Do not assume that ID `1` still exists because records may have been deleted.

---

## 20. Recommended College Demo Flow

A simple demonstration can follow this sequence:

1. Start the project with `npm start`.
2. Open the portal at `http://localhost:3000`.
3. Register a user.
4. Log in.
5. Show the Clubs page.
6. Show the Events page.
7. Add an event.
8. Register the user as a club member.
9. Open the API Tests page and run the live checks.
10. Open Bruno.
11. Run GET requests.
12. Demonstrate POST.
13. Demonstrate PUT.
14. Demonstrate PATCH.
15. Demonstrate DELETE.
16. Use GET again to verify the changed data.

This demonstrates the complete relationship between the UI, REST backend, database and API-testing tool.

---

## 21. Conclusion

The Club Portal is a compact full-stack project built around a clear architecture:

```text
HTML/CSS/JavaScript
        |
        v
Node.js + Express REST API
        |
        v
SQLite
```

The frontend provides the actual club, event, member and authentication interface. The backend contains the REST endpoints and database logic. Bruno provides an independent way to verify the backend APIs and demonstrate the five major HTTP operations: GET, POST, PUT, PATCH and DELETE.
