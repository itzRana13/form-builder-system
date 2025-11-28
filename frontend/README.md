# Form Builder Frontend

Frontend React application for the dynamic form builder system.

## Tech Stack

- React 18
- Vite
- TypeScript
- TanStack Query (React Query)
- TanStack Form
- TanStack Table
- Tailwind CSS
- React Router

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
npm run preview
```

## Features

### Dynamic Form Page
- Fetches form schema from backend
- Renders all field types dynamically
- Client-side validation with inline error messages
- Loading and error states
- Form submission with success/error feedback

### Submissions Table Page
- Server-side pagination (10/20/50 items per page)
- Server-side sorting by creation date
- View submission details in modal
- Loading, error, and empty states
- Total count display

## Environment Variables

Create a `.env` file (optional):
```
VITE_API_URL=http://localhost:3001/api
```

If not set, the app will use the Vite proxy configured in `vite.config.ts`.

## Port

Default port: 3000

