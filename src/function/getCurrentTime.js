const getCurrentTime = () => {

	const currentDate = new Date();
	let hours = currentDate.getHours();
	let minutes = currentDate.getMinutes();
	const amOrPm = hours >= 12 ? 'PM' : 'AM';

	hours %= 12;
	hours = hours || 12;

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	return `${hours}:${minutes} ${amOrPm}`;

}

export default getCurrentTime;