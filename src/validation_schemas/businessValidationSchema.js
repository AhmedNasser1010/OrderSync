import { object, string } from 'yup';
import businessInfoValidationSchema from './businessInfoValidationSchema.js';
import businessOpeningHoursValidationSchema from './businessOpeningHoursValidationSchema.js';
import businessOwnerInfoValidationSchema from './businessOwnerInfoValidationSchema.js';
import businessPaymentMethodsValidationSchema from './businessPaymentMethodsValidationSchema.js';

const businessValidationSchema = object({
  accessToken: string().required(),
  owner: businessOwnerInfoValidationSchema,
  business: businessInfoValidationSchema,
  services: object({
  	openingHourse: businessOpeningHoursValidationSchema,
  	paymentMethods: businessPaymentMethodsValidationSchema,
  }),
  createdOn: string(),
});

export default businessValidationSchema;