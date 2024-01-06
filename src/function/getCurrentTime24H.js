const getCurrentTime24H = () => {

	const currentDate = new Date();
	let hours = currentDate.getHours();
	let minutes = currentDate.getMinutes();

	return `${hours}:${minutes}`;

}

export default getCurrentTime24H;