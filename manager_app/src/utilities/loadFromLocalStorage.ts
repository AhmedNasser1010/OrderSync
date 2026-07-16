const loadFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    if (data === null) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return null;
};

export default loadFromLocalStorage;