import { object, boolean } from 'yup';

const businessPaymentMethodsValidationSchema = object({
	cash: boolean(),
	vodafoneCash: boolean(),
	etisalatCash: boolean(),
});

export default businessPaymentMethodsValidationSchema;