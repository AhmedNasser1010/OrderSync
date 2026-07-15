import { useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import findMyLocation from "../utils/findMyLocation";
import getDistanceFromLatlngInKm from "../utils/getDistanceFromLatlngInKm";
import DB_UPDATE_GPS from "../utils/DB_UPDATE_GPS";
import { setGeoLocationErr } from "../rtk/slices/conditionalValuesSlice";

const useDriverTracking = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const queue = useSelector((state) => state.queue);

  const updateTime = 3000;

  const locationInterval = useRef(null);
  const lastLocation = useRef([null, null]);
  const queueRef = useRef(queue);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    if (!user?.uid) return;

    if (locationInterval.current) {
      clearInterval(locationInterval.current);
    }

    locationInterval.current = setInterval(async () => {
      let newLocation = [null, null];

      try {
        const location = await findMyLocation();

        if (!location[0] && !location[1]) {
          dispatch(setGeoLocationErr(true));
        } else {
          dispatch(setGeoLocationErr(false));
          newLocation = location;
        }
      } catch (error) {
        console.error("Error finding location:", error);
      }

      const isOnline = user?.online?.byUser && user?.online?.byManager;
      const notNull = newLocation[0] !== null && newLocation[1] !== null;

      const hasZeroLiveLocation = queueRef.current?.some(
        (order) =>
          order?.delivery?.liveLocation?.[0] === 0 &&
          order?.delivery?.liveLocation?.[1] === 0,
      );

      const isFarther50Meter =
        hasZeroLiveLocation ||
        (lastLocation.current[0] !== null &&
          getDistanceFromLatlngInKm(lastLocation.current, newLocation) >= 0.05);

      if (isOnline && notNull && isFarther50Meter) {
        lastLocation.current = newLocation;
        DB_UPDATE_GPS(newLocation, user, queueRef.current);
      }
    }, updateTime);

    return () => {
      clearInterval(locationInterval.current);
    };
  }, [dispatch, user, user?.uid]);

  return null;
};

export default useDriverTracking;
