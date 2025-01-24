const loadFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export default loadFromLocalStorage;