class Order {
  constructor({
    payment,
    comment,
    id,
    customer,
    timestemp,
    status,
    cart
  }) {
    this.payment = {
      method: payment.method,
      status: payment.status,
      currency: payment.currency,
      promoCode: payment.promoCode,
      taxFees: payment.taxFees
    };
    this.comment = comment;
    this.id = id;
    this.customer = {
      id: customer.id,
      verified: customer.verified,
      phone: customer.phone,
      name: customer.name
    };
    this.timestemp = timestemp;
    this.status = status;
    this.cart = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity
    }));
  }
}

export default Order;


// const orderData = {
//   payment: {
//     method: 'CASH',
//     status: 'ON_DELIVERY',
//     currency: 'USD',
//     promoCode: ['POP', 'CR7'],
//     taxFees: [
//       {
//         cost: 6,
//         service: 'delivery'
//       }
//     ]
//   },
//   comment: 'hey',
//   id: '1987-1712791296047',
//   customer: {
//     id: 'dghfgjgh6ng1m5gh8h',
//     verified: true,
//     phone: '+201027380298',
//     name: 'ahmed'
//   },
//   timestemp: 1712808537734,
//   status: 'RECIVED',
//   cart: [
//     {
//       id: 'sgGE28Xs',
//       name: 'PC Monitor',
//       price: 450,
//       currency: 'EGP',
//       quantity: 1
//     },
//     {
//       id: 'ghi684Fc',
//       name: 'RGB Keyboard',
//       price: 50,
//       currency: 'EGP',
//       quantity: 2
//     }
//   ]
// };

// const order = new Order(orderData);