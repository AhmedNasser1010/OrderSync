import { object, string, array, number } from 'yup';

// RegEx
const latLngRegex = /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-8]?\d(?:\.\d{1,6})?))$/;
const lonLngRegex = /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:1[0-7]\d(?:\.\d{1,6})?)|(?:[0-9]?\d(?:\.\d{1,6})?))$/;

const businessInfoValidationSchema = object({
  name: string().required("Business name is required").min(3, "Business name is too short").max(20, "Business name is too long"),
  nameInAr: string().required("Business arabic name is required").min(3, "Business arabic name is too short").max(20, "Business arabic name is too long"),
  icon: string().required("Business icon is required"),
  cover: string().required("Business cover is required"),
  industry: string().required("Business industry type is required"),
  address: string().required("Business Address is required"),
  latlng: array()
    .of(number().required("The field can't be empty"))
    .length(2, 'Latitude and longitude must contain exactly two numbers')
    .required('Latitude and longitude is required')
});

export default businessInfoValidationSchema;