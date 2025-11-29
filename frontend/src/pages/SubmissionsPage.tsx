import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { fetchSubmissions, fetchFormSchema, deleteSubmission, updateSubmission } from '../api/client';
import { Submission, FormSchema, FormField } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import { Eye, Download } from 'lucide-react';

export default function SubmissionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions', page, limit, sortOrder, debouncedSearch],
    queryFn: () => fetchSubmissions(page, limit, 'createdAt', sortOrder, debouncedSearch),
  });

  const { data: schema } = useQuery<FormSchema>({
    queryKey: ['form-schema'],
    queryFn: fetchFormSchema,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Record<string, any> }) =>
      updateSubmission(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      setIsEditing(false);
      setSelectedSubmission(null);
    },
  });

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: 'id',
      header: 'Submission ID',
      cell: ({ row }) => (
        <div className="font-mono text-sm text-gray-600">{row.original.id.slice(0, 8)}...</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <div>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedSubmission(row.original)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
            disabled={deleteMutation.isPending}
            onClick={() => {
              const confirmed = window.confirm(
                'Are you sure you want to delete this submission?'
              );
              if (!confirmed) return;
              deleteMutation.mutate(row.original.id);
            }}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.submissions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    state: {
      sorting: [{ id: 'createdAt', desc: sortOrder === 'desc' }],
    },
  });

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleExportCsv = async () => {
    if (!data) return;
    try {
      // Fetch all submissions for current filter
      const all = await fetchSubmissions(1, data.total || 1000, 'createdAt', sortOrder, debouncedSearch);
      if (!all.submissions.length) return;

      const headerFields = ['id', 'createdAt'];
      const fieldIds = schema?.fields.map((f) => f.id) ?? [];

      const header = ['Submission ID', 'Created At', ...fieldIds.map((id) => id)].join(',');
      const rows = all.submissions.map((sub) => {
        const values = fieldIds.map((id) => {
          const v = sub.data[id];
          const s = v === undefined || v === null ? '' : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        });
        return [
          `"${sub.id}"`,
          `"${sub.createdAt}"`,
          ...values,
        ].join(',');
      });

      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'submissions.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export CSV. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="error">
          Failed to load submissions. Please try again later.
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Submissions</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Total: {data.total} submission{data.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search submissions..."
              className="w-full sm:w-64 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        {data.submissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-300 text-lg">No submissions found</p>
            <p className="text-gray-400 dark:text-gray-400 mt-2">Submit a form to see submissions here</p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Items per page:
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-3 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <Button variant="outline" size="sm" onClick={handleSortToggle}>
                  Sort: {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900 dark:text-gray-100">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b border-gray-200 dark:border-slate-700">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="text-left p-4 font-semibold text-gray-700 dark:text-gray-200"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Page {data.page} of {data.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => {
          setSelectedSubmission(null);
          setIsEditing(false);
        }}
        title={isEditing ? 'Edit Submission' : 'Submission Details'}
      >
        {selectedSubmission && schema && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Submission ID:</span>
                <div className="mt-1 font-mono text-gray-600 dark:text-gray-300">
                  {selectedSubmission.id}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">Created At:</span>
                <div className="mt-1 text-gray-600 dark:text-gray-300">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-50">
                  {isEditing ? 'Edit Fields' : 'Form Data'}
                </h3>
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      setEditValues(selectedSubmission.data);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {schema.fields.map((field: FormField) => {
                  const value = isEditing ? editValues[field.id] : selectedSubmission.data[field.id];

                  if (!isEditing) {
                    return (
                      <div key={field.id} className="border-b pb-3 last:border-0 border-gray-200 dark:border-slate-700">
                        <div className="font-medium text-gray-700 dark:text-gray-200 mb-1">
                          {field.label}:
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                          {field.type === 'switch' ? (
                            <span className={value ? 'text-green-500' : 'text-red-500'}>
                              {value ? 'Yes' : 'No'}
                            </span>
                          ) : field.type === 'multi-select' ? (
                            Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-2">
                                {value.map((item: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              'N/A'
                            )
                          ) : value !== undefined && value !== null && value !== '' ? (
                            String(value)
                          ) : (
                            <span className="text-gray-400 italic">Not provided</span>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Editing UI
                  return (
                    <div key={field.id} className="space-y-1 border-b pb-3 last:border-0 border-gray-200 dark:border-slate-700">
                      <label className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                        {field.label}
                      </label>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                          value={value || ''}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                        />
                      )}
                      {field.type === 'number' && (
                        <input
                          type="number"
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                          value={value ?? ''}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [field.id]: e.target.value === '' ? undefined : Number(e.target.value),
                            }))
                          }
                        />
                      )}
                      {field.type === 'date' && (
                        <input
                          type="date"
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                          value={value || ''}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                        />
                      )}
                      {field.type === 'textarea' && (
                        <textarea
                          className="w-full min-h-[80px] rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                          value={value || ''}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                        />
                      )}
                      {field.type === 'select' && (
                        <select
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                          value={value || ''}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                        >
                          <option value="">{field.placeholder || 'Select an option'}</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {field.type === 'multi-select' && (
                        <select
                          multiple
                          className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                          value={Array.isArray(value) ? value : []}
                          onChange={(e) => {
                            const selected = Array.from(
                              e.target.selectedOptions,
                              (opt) => opt.value
                            );
                            setEditValues((prev) => ({
                              ...prev,
                              [field.id]: selected,
                            }));
                          }}
                          size={Math.min(field.options?.length || 5, 5)}
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {field.type === 'switch' && (
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [field.id]: e.target.checked,
                              }))
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span>{field.label}</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              {isEditing && selectedSubmission && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditValues({});
                    }}
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={updateMutation.isPending}
                    onClick={() => {
                      updateMutation.mutate({
                        id: selectedSubmission.id,
                        data: editValues,
                      });
                    }}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

