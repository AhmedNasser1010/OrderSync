import randomOrderId from './randomOrderId';

const returnTestOrder = () => {
	return {
	  payment: {
	    method: 'CASH',
	    currency: 'EGP',
	    promoCode: ['A1', 'B2B'],
	    taxFees: [
	      {
	        cost: 6,
	        service: 'delivery'
	      }
	    ]
	  },
	  comment: 'Hi there this is just a test order',
	  id: randomOrderId(),
	  customer: {
	    id: 'dghfgjgh6ng1m5gh8h',
	    verified: true,
	    phone: '+201027380298',
	    name: 'Ahmed Nasser'
	  },
	  timestemp: Date.now(),
	  status: 'RECEIVED',
	  cart: [
	    {
	      id: 'sgGE28Xs',
	      name: 'PC Monitor',
	      price: 450,
	      currency: 'EGP',
	      quantity: 1
	    },
	    {
	      id: 'ghi684Fc',
	      name: 'RGB Keyboard',
	      price: 50,
	      currency: 'EGP',
	      quantity: 2
	    }
	  ]
	}
}

export default returnTestOrder;