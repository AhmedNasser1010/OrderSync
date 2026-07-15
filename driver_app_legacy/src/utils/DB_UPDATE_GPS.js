import { doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

const DB_UPDATE_GPS = async (location, user, queue) => {
  const BATCH_SIZE = 100;

  try {
    window.write += 1;
    console.log("Write: ", window.write);
    console.log("Updating GPS location in the database:", location);

    const promises = [];

    // driver update
    const driverBatch = writeBatch(db);
    driverBatch.update(doc(db, "drivers", user.uid), {
      liveLocation: location,
    });
    promises.push(driverBatch.commit());

    // queue updates
    for (let i = 0; i < queue.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);

      queue.slice(i, i + BATCH_SIZE).forEach((order) => {
        batch.update(
          doc(
            db,
            "orders",
            user.accessToken,
            "openQueue",
            `${order.id}_${order.customer.uid}`,
          ),
          { "delivery.liveLocation": location },
        );
      });

      promises.push(batch.commit());
    }

    await Promise.all(promises);
  } catch (error) {
    console.error("Error update GPS:", error);
  }
};

export default DB_UPDATE_GPS;
