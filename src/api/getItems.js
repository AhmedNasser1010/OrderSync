// Get items

const serverAddress = "http://localhost:4000/";

const getItems = async (endPoint, itemId = "") => {
    try {
        const res = await fetch(`${serverAddress}${endPoint}${itemId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const json = await res.json();
        return json;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}


export default getItems;