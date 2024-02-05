const getNestedValue = (obj, path) => {
	const splitedPath = path.split('.');
	let current = obj;

	splitedPath.map(key => {

		if (current && current.hasOwnProperty(key)) {
      current = current[key];
    } else {
      current = undefined;
      return;
    }

	})

	return current;
};

export default getNestedValue;