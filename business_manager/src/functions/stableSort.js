// for non-modern browsers [exampleArray.slice().sort(exampleComparator)]
const stableSort = (array, comparator) => {
	if (array) {

		const stabilizedThis = array.map((el, index) => [el, index]);

		stabilizedThis.sort((a, b) => {

			const order = comparator(a[0], b[0]);

			if (order !== 0) {
				return order;
			}

			return a[1] - b[1];

		});

		return stabilizedThis.map((el) => el[0]);

	}
}

export default stableSort