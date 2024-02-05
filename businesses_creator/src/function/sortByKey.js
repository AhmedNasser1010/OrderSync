const sortByKey = (obj) => {

  const sorted = Object.keys(obj)
    .sort()
    .reduce((accumulator, key) => {
    accumulator[key] = obj[key];

    return accumulator;
  }, {});

  return sorted;
}

export default sortByKey;