const priceAfterDiscount = (price, code) => {
	let finalPrice = price

	const splitedCode = code.split('_')[0]
	const type = splitedCode.split('-')[0]
	const value = splitedCode.split('-')[1]

	if (true) {
		switch (type) {
			case 'FIXED':
				finalPrice -= value
				if (finalPrice <= 0.4) finalPrice = 0
				break;
			case 'P':
				const decimal = value / 100
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