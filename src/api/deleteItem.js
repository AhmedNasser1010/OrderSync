// Fetch products

const serverAddress = "http://localhost:4000/";

const deleteItem = async (endPoint, id) => {
    try {
        const res = await fetch(`${serverAddress}${endPoint}${id}`, {
            method: "DELETE",
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


export default deleteItem;