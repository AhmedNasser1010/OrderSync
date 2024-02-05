import { object, string } from 'yup';

// RegEx
const locationCodeRegex = /^(\d{1,2})°(\d{1,2})'(\d{1,2}\.\d{1})"([NS])\s+(\d{1,3})°(\d{1,2})'(\d{1,2}\.\d{1})"([EW])$/;
// 26°50'49.1"N 29°44'20.4"E

const businessInfoValidationSchema = object({
	name: string().required("Business name is required").min(3, "Business name are too short").max(20, "Business name are too long"),
  industry: string().required("Business industry type is required"),
  address: string().required("Business Address is required"),
  location: string().matches(locationCodeRegex, `Location code are not valid. Example: 26°50'49.1"N 29°44'20.4"E`)
});

export default businessInfoValidationSchema;