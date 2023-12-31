// Add new item

const serverAddress = "http://localhost:4000/";

const postItem = async (endPoint, postedData) => {
    try {
        const res = await fetch(`${serverAddress}${endPoint}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postedData),
        });
        const json = await res.json();
        return json;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}


export default postItem;