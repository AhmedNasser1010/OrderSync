const priceAfterDiscount = (price, code) => {
	let finalPrice = price

	const discountCode = code.split('-')[0]
	const discountValue = code.split('-')[1]
	const discountContition = code.split('_')[1]

	if (true) {
		switch (discountCode) {
			case 'FIXED':
				finalPrice -= discountValue
				if (finalPrice <= 0.4) finalPrice = 0
				break;
			case 'P':
				// const discountAmount = price * decimal
				// finalPrice -= discountAmount
				const decimal = discountValue / 100
				 finalPrice = price * (1 - decimal);
				break;
			default:
				finalPrice = price
				break;
		}
	}

	return finalPrice
}

export default priceAfterDiscount