# Form Builder Backend

Backend API for the dynamic form builder system.

## Tech Stack

- Node.js with Express
- TypeScript
- In-memory storage
- CORS enabled

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### GET /api/form-schema
Returns the Employee Onboarding form schema.

### POST /api/submissions
Accepts and validates form submissions.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  ...
}
```

**Success Response (201):**
```json
{
  "success": true,
  "id": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": {
    "firstName": "First Name is required"
  }
}
```

### GET /api/submissions
Returns paginated and sortable submissions.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `sortBy` (default: "createdAt")
- `sortOrder` (default: "desc", options: "asc" | "desc")

**Response:**
```json
{
  "submissions": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Bonus Endpoints

- GET /api/submissions/:id - Get a single submission
- PUT /api/submissions/:id - Update a submission
- DELETE /api/submissions/:id - Delete a submission

## Port

Default port: 3001

