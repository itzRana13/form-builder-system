import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { fetchSubmissions, fetchFormSchema } from '../api/client';
import { Submission, FormSchema } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import { Eye } from 'lucide-react';

export default function SubmissionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['submissions', page, limit, sortOrder],
    queryFn: () => fetchSubmissions(page, limit, 'createdAt', sortOrder),
  });

  const { data: schema } = useQuery<FormSchema>({
    queryKey: ['form-schema'],
    queryFn: fetchFormSchema,
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
      header: 'View',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedSubmission(row.original)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
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
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="text-gray-600 mt-1">
            Total: {data.total} submission{data.total !== 1 ? 's' : ''}
          </p>
        </div>

        {data.submissions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No submissions found</p>
            <p className="text-gray-400 mt-2">Submit a form to see submissions here</p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Items per page:
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm"
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
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="text-left p-4 font-semibold text-gray-700"
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
                      <tr key={row.id} className="border-b hover:bg-gray-50">
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

            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
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
        onClose={() => setSelectedSubmission(null)}
        title="Submission Details"
      >
        {selectedSubmission && schema && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Submission ID:</span>
                <div className="mt-1 font-mono text-gray-600">{selectedSubmission.id}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Created At:</span>
                <div className="mt-1 text-gray-600">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-4">Form Data:</h3>
              <div className="space-y-3">
                {schema.fields.map((field) => {
                  const value = selectedSubmission.data[field.id];
                  return (
                    <div key={field.id} className="border-b pb-3 last:border-0">
                      <div className="font-medium text-gray-700 mb-1">{field.label}:</div>
                      <div className="text-gray-600">
                        {field.type === 'switch' ? (
                          <span className={value ? 'text-green-600' : 'text-red-600'}>
                            {value ? 'Yes' : 'No'}
                          </span>
                        ) : field.type === 'multi-select' ? (
                          Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-2">
                              {value.map((item, idx) => (
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
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

