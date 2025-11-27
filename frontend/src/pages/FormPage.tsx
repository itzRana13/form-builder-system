import { useForm } from '@tanstack/react-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchFormSchema, submitForm } from '../api/client';
import FormField from '../components/FormField';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { FormSchema } from '../types';

export default function FormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: schema, isLoading, error } = useQuery<FormSchema>({
    queryKey: ['form-schema'],
    queryFn: fetchFormSchema,
  });

  const mutation = useMutation({
    mutationFn: submitForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      navigate('/submissions');
    },
  });

  const form = useForm({
    defaultValues: {} as Record<string, any>,
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form schema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="error">
          Failed to load form schema. Please try again later.
        </Alert>
      </div>
    );
  }

  if (!schema) {
    return null;
  }

  return (
    <form.Provider>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{schema.title}</h1>
          <p className="text-gray-600 mb-8">{schema.description}</p>

          {mutation.isError && (
            <Alert variant="error" className="mb-6">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Failed to submit form. Please check your inputs and try again.'}
            </Alert>
          )}

          {mutation.data && !mutation.data.success && mutation.data.errors && (
            <Alert variant="error" className="mb-6">
              <div className="space-y-1">
                {Object.entries(mutation.data.errors).map(([field, error]) => (
                  <div key={field}>
                    <strong>{field}:</strong> {error}
                  </div>
                ))}
              </div>
            </Alert>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            {schema.fields.map((field) => (
              <FormField key={field.id} field={field} />
            ))}

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </form.Provider>
  );
}

