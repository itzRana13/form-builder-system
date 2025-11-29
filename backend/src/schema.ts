import { FormSchema } from './types';


export const departmentSkills: Record<string, string[]> = {
  Engineering: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'SQL', 'Docker', 'Kubernetes'],
  Marketing: ['SEO', 'SEM', 'Content Marketing', 'Social Media', 'Analytics', 'Email Marketing', 'PPC', 'Google Ads'],
  Sales: ['CRM', 'Negotiation', 'Lead Generation', 'Client Relations', 'Salesforce', 'Cold Calling', 'Presentation', 'Closing'],
  HR: ['Recruitment', 'Employee Relations', 'Performance Management', 'HRIS', 'Compensation', 'Training', 'Compliance', 'Onboarding'],
  Finance: ['Accounting', 'Financial Analysis', 'Excel', 'QuickBooks', 'Tax Preparation', 'Auditing', 'Budgeting', 'Forecasting'],
  Operations: ['Process Improvement', 'Supply Chain', 'Project Management', 'Quality Control', 'Logistics', 'Vendor Management', 'Lean', 'Six Sigma']
};

export const formSchema: FormSchema = {
  title: 'Employee Onboarding',
  description: 'Please fill out the following information to complete your onboarding process.',
  fields: [
    {
      id: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        regex: '^[a-zA-Z\\s]+$'
      }
    },
    {
      id: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter your last name',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        regex: '^[a-zA-Z\\s]+$'
      }
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'text',
      placeholder: 'Enter your email',
      validation: {
        required: true,
        regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
      }
    },
    {
      id: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Enter your phone number',
      validation: {
        required: false,
        regex: '^[\\d\\s\\-\\+\\(\\)]+$'
      }
    },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      placeholder: 'Enter your age',
      validation: {
        required: true,
        min: 18,
        max: 100
      }
    },
    {
      id: 'department',
      label: 'Department',
      type: 'select',
      placeholder: 'Select your department',
      options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
      validation: {
        required: true
      }
    },
    {
      id: 'skills',
      label: 'Skills',
      type: 'multi-select',
      placeholder: 'Select your skills',
      // Options are dynamic based on selected department (see departmentSkills mapping)
      options: [], 
      validation: {
        required: true,
        minSelected: 1,
        maxSelected: 5
      }
    },
    {
      id: 'startDate',
      label: 'Start Date',
      type: 'date',
      placeholder: 'Select your start date',
      validation: {
        required: true,
        minDate: new Date().toISOString().split('T')[0]
      }
    },
    {
      id: 'bio',
      label: 'Biography',
      type: 'textarea',
      placeholder: 'Tell us about yourself',
      validation: {
        required: false,
        minLength: 0,
        maxLength: 500
      }
    },
    {
      id: 'acceptTerms',
      label: 'I accept the terms and conditions',
      type: 'switch',
      validation: {
        required: true
      }
    }
  ]
};

