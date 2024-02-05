import { object, string } from 'yup';

const businessOpeningHoursValidationSchema = object({
	sunday: object({start: string(), end: string()}),
  monday: object({start: string(), end: string()}),
  tuesday: object({start: string(), end: string()}),
  wednesday: object({start: string(), end: string()}),
  thursday: object({start: string(), end: string()}),
  friday: object({start: string(), end: string()}),
  saturday: object({start: string(), end: string()}),
});

export default businessOpeningHoursValidationSchema;