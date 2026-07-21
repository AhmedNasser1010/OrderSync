import * as yup from 'yup';

const orderYupSchema = yup.object().shape({
  customerUid: yup.string().required(),

  business: yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required(),
    phone: yup.string().required(),
    address: yup.string().required(),
    latlng: yup.array().of(yup.number()).min(2).max(2).required(),
  }).required(),

  assignment: yup.object().shape({
    driverUid: yup.string().nullable(),
  }).required(),

  delivery: yup.object().shape({
    address: yup.string().required(),
    latlng: yup.array().of(yup.number()).min(2).max(2).required(),
    note: yup.string().nullable(),
  }).required(),

  cart: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      name: yup.string().required(),
      quantity: yup.number().min(1).required(),
      selectedSize: yup.string().nullable(),
      discountCode: yup.string().nullable(),
    })
  ).min(1).required(),

  pricing: yup.object().shape({
    subtotal: yup.number().min(0).required(),
    discount: yup.number().min(0).required(),
    deliveryFees: yup.number().min(0).required(),
    total: yup.number().min(0).required(),
  }).required(),

  payment: yup.object().shape({
    method: yup.string().oneOf(['CASH']).required(),
    status: yup.string().oneOf(['COMPLETED']).required(),
  }).required(),

  finance: yup.object().shape({
    commissionPercent: yup.number().required(),
    commissionAmount: yup.number().required(),
    restaurantShare: yup.number().required(),
    companyShare: yup.number().required(),
    cashCollected: yup.number().required(),
  }).required(),

  reconciliation: yup.object().shape({
    settlementId: yup.string().nullable(),
    restaurantPaid: yup.boolean().required(),
  }).required(),

  notes: yup.object().shape({
    order: yup.string().nullable(),
  }).required(),

  metadata: yup.object().shape({
    orderSource: yup.string().required(),
    cancelAutoAssign: yup.boolean().required(),
  }).required(),

  customer: yup.object().shape({
    uid: yup.string().required(),
    name: yup.string().required(),
    phone: yup.string().required(),
    secondPhone: yup.string().nullable(),
    firstOrderDate: yup.number().required(),
    totalOrders: yup.number().min(0).required(),
    totalOrdersValue: yup.number().min(0).required(),
  }).required(),
});

export default orderYupSchema;
