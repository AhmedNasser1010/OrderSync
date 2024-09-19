import * as yup from 'yup';

const orderYupSchema = yup.object().shape({
  id: yup.string().required(),
  timestamp: yup.number().required(),
  accessToken: yup.string().required(),
  cancelAutoAssign: yup.boolean().required(),
  status: yup.object().shape({
    current: yup.string().oneOf(['RECEIVED']).required(),
    accepted: yup.boolean().required(),
    history: yup.array().of(
      yup.object().shape({
        status: yup.string().required(),
        timestamp: yup.number().required()
      })
    ).min(1).required()
  }).required(),
  
  orderTimestamps: yup.object().shape({
    placedAt: yup.number().required(),
    preparedAt: yup.number().nullable(),
    pickedUpAt: yup.number().nullable(),
    deliveredAt: yup.number().nullable()
  }).required(),

  delivery: yup.object().shape({
    uid: yup.string().nullable(),
    name: yup.string().nullable(),
    phone: yup.string().nullable(),
    status: yup.string().oneOf(['PENDING']).required()
  }).required(),

  cart: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      quantity: yup.number().min(1).required()
    })
  ).min(1).required(),

  cartTotalPrice: yup.object().shape({
    total: yup.number().min(0).required(),
    discount: yup.number().min(0).required()
  }).required(),

  deliveryFees: yup.number().min(0).required(),

  payment: yup.object().shape({
    method: yup.string().oneOf(['CASH']).required(),
    status: yup.string().oneOf(['COMPLETED']).required()
  }).required(),

  location: yup.object().shape({
    address: yup.string().required(),
    latlng: yup.array().of(
      yup.number().min(-90).max(90) // Latitude
    ).min(2).max(2).required()
  }).required(),

  orderNote: yup.string().nullable(),

  customer: yup.object().shape({
    uid: yup.string().required(),
    name: yup.string().required(),
    phone: yup.string().required(),
    secondPhone: yup.string().nullable(),
    firstOrderDate: yup.number().required(),
    totalOrders: yup.number().min(0).required(),
    totalOrdersValue: yup.number().min(0).required()
  }).required(),

  customerFeedback: yup.object().shape({
    rating: yup.number().nullable().min(0).max(5),
    comment: yup.string().nullable()
  }).required(),

  orderSource: yup.string().required()
});

export default orderYupSchema;
