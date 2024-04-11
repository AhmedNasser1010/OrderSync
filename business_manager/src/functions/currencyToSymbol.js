const symbols = {
	USD: '$',
	EGP: '£'
}

const currencyToSymbol = (currency) => {
	return symbols[currency];
}

export default currencyToSymbol;