import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

export const CreateServiceTicketFormSchema = yup.object({
  // Ticket Overview Fields
  ticketTitle: yup.string().required('Ticket title is required').min(10, 'Minimum 10 characters'),
  serviceLocation: yup.string().required('Service location is required'),
  serviceDateRange: yup
    .array()
    .of(yup.date().nullable())
    .length(2, 'Both start and end dates are required')
    .required('Please select a date range')
    .test('both-dates-present', 'Both start and end dates are required', (value) => {
      return Array.isArray(value) && value[0] !== null && value[1] !== null;
    }),
  serviceWindowStart: yup.mixed().required('Start time is required').nullable(),
  serviceWindowEnd: yup.mixed().required('End time is required').nullable(),

  // Customer Type & Conditional Fields
  customerType: yup.string().oneOf(['business', 'residential']).required('Customer type is required'),
  businessName: yup.string().when('customerType', {
    is: 'business',
    then: (schema) => schema.required('Business name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  primaryContactName: yup.string().when('customerType', {
    is: 'business',
    then: (schema) => schema.required('Primary contact name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  residentName: yup.string().when('customerType', {
    is: 'residential',
    then: (schema) => schema.required('Resident name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  contactPhone: yup.string().when('customerType', {
    is: 'business',
    then: (schema) => schema.required('Contact phone is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  contactEmail: yup.string().when('customerType', {
    is: 'business',
    then: (schema) => schema.email('Invalid email').required('Contact email is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  residentPhone: yup.string().when('customerType', {
    is: 'residential',
    then: (schema) => schema.required('Phone is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  residentEmail: yup.string().when('customerType', {
    is: 'residential',
    then: (schema) => schema.email('Invalid email').required('Email is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Invoice Address
  invoiceAddressSameAsService: yup.boolean(),
  invoiceStreet: yup.string().when('invoiceAddressSameAsService', {
    is: false,
    then: (schema) => schema.required('Invoice street is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  invoiceCity: yup.string().when('invoiceAddressSameAsService', {
    is: false,
    then: (schema) => schema.required('City is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  invoiceState: yup.string().when('invoiceAddressSameAsService', {
    is: false,
    then: (schema) => schema.required('State is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  invoiceZip: yup.string().when('invoiceAddressSameAsService', {
    is: false,
    then: (schema) => schema.required('ZIP is required'),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Service Files
  serviceFiles: yup.array().of(
    yup.object({
      id: yup.string().required(),
      file: yup.mixed().required('File is required'),
    }),
  ),

  // Sections with Dynamic Content Types
  sections: yup.array().of(
    yup.object({
      title: yup.string().required('Section title is required'),
      contentType: yup.string().oneOf(['activity', 'parts', 'photos', 'labor', 'notes', 'device']).required(),
      images: yup.array().optional(),
    }),
  ),

  // Service Pricing
  servicePricing: yup.object({
    pricingType: yup.string().oneOf(['quote', 'fixed', 'time_materials', 'contract']).required(),
    baseCharge: yup.number().nullable(),
    hourlyRate: yup.number().nullable(),
    minimumHours: yup.number().nullable(),
    tripCharge: yup.number().nullable(),
    partsMarkup: yup.number().nullable(),
  }),

  // Ticket Settings
  ticketSettings: yup.object({
    visibility: yup.string().oneOf(['internal', 'customer', 'public']).required(),
    priority: yup.string().oneOf(['low', 'normal', 'high', 'emergency']).required(),
    assignedTech: yup.object({
      name: yup.string(),
      phone: yup.string(),
      email: yup.string().email('Invalid email'),
      vehicle: yup.object({
        makeModel: yup.string(),
        number: yup.string(),
      }),
    }),
    status: yup.string().oneOf(['draft', 'scheduled', 'in_progress', 'completed', 'paid', 'cancelled']).required(),
  }),
});

const useCreateTicketForm = () => {
  const methods = useForm({
    resolver: yupResolver(CreateServiceTicketFormSchema),
    defaultValues: {
      // Overview defaults
      ticketTitle: '',
      serviceLocation: '',
      serviceDateRange: [null, null],
      serviceWindowStart: null,
      serviceWindowEnd: null,
      customerType: 'business',
      invoiceAddressSameAsService: true,

      // Files
      serviceFiles: [],

      // Sections
      sections: [
        {
          title: 'Initial Service Activity',
          contentType: 'activity',
          activityName: '',
          activityType: '',
          activityDescription: '',
          durationEstimate: 0,
          images: [],
        },
      ],

      // Service Pricing
      servicePricing: {
        pricingType: 'time_materials',
        baseCharge: 0,
        hourlyRate: 0,
        minimumHours: 1,
        tripCharge: 0,
        partsMarkup: 0,
      },

      // Ticket Settings
      ticketSettings: {
        visibility: 'internal',
        priority: 'normal',
        assignedTech: {
          name: '',
          phone: '',
          email: '',
          vehicle: {
            makeModel: '',
            number: '',
          },
        },
        status: 'draft',
      },
    },
  });

  return { methods };
};

export default useCreateTicketForm;
