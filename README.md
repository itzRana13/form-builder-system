# Form Builder - Full Stack Application

A full-stack dynamic form builder system with a React frontend and Node.js/Express backend.

## 🚀 Live Demo

**Frontend:** [https://formbuilder-ieg47w4el-itzrana13s-projects.vercel.app](https://formbuilder-ieg47w4el-itzrana13s-projects.vercel.app)

- [Form Page](https://formbuilder-ieg47w4el-itzrana13s-projects.vercel.app/)
- [Submissions Page](https://formbuilder-ieg47w4el-itzrana13s-projects.vercel.app/submissions)

**Backend API:** [https://form-builder-system.onrender.com](https://form-builder-system.onrender.com)

- [API Base URL](https://form-builder-system.onrender.com/api)
- [Form Schema Endpoint](https://form-builder-system.onrender.com/api/form-schema)
- [Health Check](https://form-builder-system.onrender.com/health)

## Milestone Completion Status

### ✅ Milestone 1 - Frontend Development

- [x] Dynamic Form Page with TanStack Form and Query
- [x] All 8 field types implemented (text, number, select, multi-select, date, textarea, switch)
- [x] Complete validation rules support
- [x] Submissions Table Page with TanStack Table
- [x] Server-side pagination and sorting
- [x] Loading, error, and empty states
- [x] View submission details modal

### ✅ Milestone 2 - Backend Development

- [x] GET /api/form-schema endpoint
- [x] POST /api/submissions with validation
- [x] GET /api/submissions with pagination and sorting
- [x] Proper error handling and status codes
- [x] CORS support
- [x] In-memory data persistence

### ✅ Bonus Features

- [x] GET /api/submissions/:id - View single submission
- [x] PUT /api/submissions/:id - Update submission
- [x] DELETE /api/submissions/:id - Delete submission

## Tech Stack

### Frontend

- **React 19** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TanStack Query** - Server state management
- **TanStack Form** - Form state management
- **TanStack Table** - Table component
- **Tailwind CSS** - Styling
- **React Router** - Routing

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **In-memory storage** - Data persistence

## Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server setup
│   │   ├── schema.ts          # Form schema definition
│   │   ├── validation.ts      # Validation logic
│   │   ├── storage.ts         # In-memory storage
│   │   └── types.ts           # TypeScript types
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FormPage.tsx
│   │   │   └── SubmissionsPage.tsx
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI components
│   │   │   └── FormField.tsx
│   │   ├── api/
│   │   │   └── client.ts      # API client functions
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── README.md
└── README.md
```

## Setup and Run Instructions

### Prerequisites

- Node.js 18+ and npm

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Run in development mode:

```bash
npm run dev
```

The backend server will start on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run in development mode:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### GET /api/form-schema

Returns the Employee Onboarding form schema.

**Response:**

```json
{
  "title": "Employee Onboarding",
  "description": "...",
  "fields": [...]
}
```

### POST /api/submissions

Accepts and validates form submissions.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
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

- **GET /api/submissions/:id** - Get a single submission
- **PUT /api/submissions/:id** - Update a submission
- **DELETE /api/submissions/:id** - Delete a submission

## Features

### Form Page

- Dynamic form rendering based on schema
- All 8 field types supported
- Real-time validation with error messages
- Required field indicators
- Loading states during submission
- Success/error feedback
- Automatic navigation to submissions page after successful submission

### Submissions Page

- Server-side pagination (10/20/50 items per page)
- Server-side sorting by creation date (asc/desc)
- View submission details in modal
- Total submissions count
- Page navigation (Previous/Next)
- Loading, error, and empty states

## Validation Rules

The form supports the following validation rules:

- **minLength / maxLength** - For text and textarea fields
- **regex** - Pattern matching for text fields
- **min / max** - For number fields
- **minDate** - For date fields
- **minSelected / maxSelected** - For multi-select fields
- **required** - For all field types

## Known Issues

None at this time.

## Assumptions

1. The backend runs on port 3001 and frontend on port 3000
2. In-memory storage is sufficient (data is lost on server restart)
3. Form schema is static and defined in the backend
4. All field types are rendered as standard HTML form controls
5. Multi-select uses a native HTML select with multiple attribute
6. Switch field is rendered as a checkbox styled as a toggle

## Future Enhancements

Potential improvements:

- CSV export functionality
- Search/filter submissions
- Edit submissions from the table
- Dark mode support
- URL sync for pagination/sorting state
- Persistent storage (database)
- Form schema editor
- Multiple form support

## License

ISC
