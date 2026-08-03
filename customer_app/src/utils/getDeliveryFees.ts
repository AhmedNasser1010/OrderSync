function getDeliveryFees(userDistanceFromRes: number | undefined, deliveryFees: number | undefined) {
  const minFees = 5;
  let fees = (deliveryFees ?? 0) * (userDistanceFromRes ?? 0);

  if (fees < minFees) fees = minFees;

  return Math.round(fees);
}

export default getDeliveryFees;
