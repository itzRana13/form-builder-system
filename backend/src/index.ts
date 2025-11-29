import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { formSchema, departmentSkills } from './schema';
import { validateSubmission } from './validation';
import { storage } from './storage';
import { Submission, SubmissionResponse, PaginatedSubmissions } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Form Builder API Server',
    version: '1.0.0',
    endpoints: {
      'GET /api/form-schema': 'Get form schema',
      'POST /api/submissions': 'Create a submission',
      'GET /api/submissions': 'Get paginated submissions',
      'GET /api/submissions/:id': 'Get a single submission',
      'PUT /api/submissions/:id': 'Update a submission',
      'DELETE /api/submissions/:id': 'Delete a submission',
      'GET /health': 'Health check endpoint'
    }
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/form-schema
app.get('/api/form-schema', (req: Request, res: Response) => {
  res.json({
    ...formSchema,
    departmentSkills
  });
});

// POST /api/submissions
app.post('/api/submissions', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const errors = validateSubmission(data, formSchema);

    if (Object.keys(errors).length > 0) {
      const response: SubmissionResponse = {
        success: false,
        errors
      };
      return res.status(400).json(response);
    }

    const submission: Submission = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      data
    };

    storage.add(submission);

    const response: SubmissionResponse = {
      success: true,
      id: submission.id,
      createdAt: submission.createdAt
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: { general: 'Internal server error' }
    });
  }
});

// GET /api/submissions
app.get('/api/submissions', (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const search = (req.query.search as string | undefined)?.toLowerCase().trim() || '';

    let allSubmissions = storage.getAll();

    // Filter by search term across id, createdAt and data fields
    if (search) {
      allSubmissions = allSubmissions.filter((submission) => {
        if (submission.id.toLowerCase().includes(search)) return true;
        if (submission.createdAt.toLowerCase().includes(search)) return true;

        const values = Object.values(submission.data ?? {});
        return values.some((val) =>
          String(val).toLowerCase().includes(search)
        );
      });
    }

    // Sort submissions
    let sortedSubmissions = [...allSubmissions];
    if (sortBy === 'createdAt') {
      sortedSubmissions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    // Paginate
    const total = sortedSubmissions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubmissions = sortedSubmissions.slice(startIndex, endIndex);

    const response: PaginatedSubmissions = {
      submissions: paginatedSubmissions,
      total,
      page,
      limit,
      totalPages
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: { general: 'Internal server error' }
    });
  }
});

// Bonus: GET /api/submissions/:id
app.get('/api/submissions/:id', (req: Request, res: Response) => {
  const submission = storage.getById(req.params.id);
  if (!submission) {
    return res.status(404).json({
      success: false,
      errors: { general: 'Submission not found' }
    });
  }
  res.json(submission);
});

// Bonus: PUT /api/submissions/:id
app.put('/api/submissions/:id', (req: Request, res: Response) => {
  try {
    const submission = storage.getById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        errors: { general: 'Submission not found' }
      });
    }

    const data = req.body;
    const errors = validateSubmission(data, formSchema);

    if (Object.keys(errors).length > 0) {
      const response: SubmissionResponse = {
        success: false,
        errors
      };
      return res.status(400).json(response);
    }

    storage.update(req.params.id, data);

    const response: SubmissionResponse = {
      success: true,
      id: submission.id,
      createdAt: submission.createdAt
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      errors: { general: 'Internal server error' }
    });
  }
});

// Bonus: DELETE /api/submissions/:id
app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const deleted = storage.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      success: false,
      errors: { general: 'Submission not found' }
    });
  }
  res.json({ success: true });
});

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

