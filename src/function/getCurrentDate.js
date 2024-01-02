const getCurrentDate = () => {

	const currentDate = new Date();
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth() + 1;
	const day = currentDate.getDate();
	
	return `${year}/${month}/${day}`;

}

export default getCurrentDate;