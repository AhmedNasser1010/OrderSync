function getDeliveryFees(userDistanceFromRes, deliveryFees) {
	const minFees = 5
	let fees = deliveryFees * userDistanceFromRes
	
	if (fees < minFees) fees = minFees

	return fees
}

export default getDeliveryFees