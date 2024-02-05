import { object, string } from 'yup';

// RegEx
const phoneNumberRegex = /^\+(\d{12})$/;

const businessOwnerInfoValidationSchema = object({
	basic: object({
		fName: string().required("First name is required").min(3, "First name is too short").max(15, "First name is too Long"),
		lName: string().required("Last name is required").min(3, "Last name is too Short").max(15, "Last name is too Long"),
		age: string().test("", "Business owner must be older!", value => {
	  	const dateNow = new Date;
	  	const yearNow = dateNow.getFullYear();
	  	const age = yearNow - Number(value?.split('-')[0]);
	  	return age >= 18;
	  }).test("", "Business owner must be younger!", value => {
	  	const dateNow = new Date;
	  	const yearNow = dateNow.getFullYear();
	  	const age = yearNow - Number(value?.split('-')[0]);
	  	return age <= 99;
	  }),
	}),
  contact: object({
  	email: string().email("Email is not valid email example@gmail.com").required("Email is required"),
  	phone: string().required("Phone number is required").matches(phoneNumberRegex, 'Phone number is not valid. Example: +201117073085'),
  	address: string().required("Addres is required"),
  }),
  password: string().required("Password is required").min(6, "Password is too short").max(30, "Password is too long"),
});

export default businessOwnerInfoValidationSchema;