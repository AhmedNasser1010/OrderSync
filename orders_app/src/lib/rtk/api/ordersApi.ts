// import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
// import {
//   arrayUnion,
//   collection,
//   doc,
//   updateDoc,
//   getDocs,
//   getDoc
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { Order } from "@/types/order";

// // data,
// // isLoading,
// // isSuccess,
// // isError,
// // error,

// export const ordersApi = createApi({
//   baseQuery: fakeBaseQuery(),
//   tagTypes: ["Orders"],
//   endpoints: (builder) => ({
//     fetchOpenOrdersData: builder.query({
//       async queryFn(resId) {
//         try {
//           const openOrdersRef = doc(db, "orders", resId);
//           const openOrdersSnapshot = await getDoc(openOrdersRef);
//           // const openOrders = openOrdersSnapshot.data()?.open;

//           console.log('Read Operation ordersApi.ts 28:38')
//           console.log('openOrders', openOrdersSnapshot)
//           // const ordersList = openOrdersSnapshot.docs.map((doc) => ({
//           //   id: doc.id,
//           //   ...doc.data(),
//           // })) as Order[];
//           return { data: null };
//         } catch (error: any) {
//           console.error(error?.message);
//           return { error: error?.message };
//         }
//       },
//       providesTags: ["Orders"],
//     }),
//   }),
// });

// export const {
//   useFetchOpenOrdersDataQuery,
// } = ordersApi;



import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from "@/lib/firebase";

export const ordersApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    fetchOpenOrdersData: builder.query({
      async queryFn(resId, { dispatch }) {
        try {
          const openOrdersRef = doc(db, 'orders', resId);

          // Set up Firestore onSnapshot listener for real-time updates
          const unsubscribe = onSnapshot(openOrdersRef, (openOrdersSnapshot) => {
            const openOrders = openOrdersSnapshot.data()?.open;

            // Dispatch real-time data to Redux store
            dispatch(ordersApi.util.updateQueryData('fetchOpenOrdersData', resId, (draft) => {
              return openOrders;
            }));

            console.log('Real-time update operation ordersApi.ts');
          });

          // Return empty result initially as onSnapshot will handle updates
          return { data: [] };
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ['Orders'],
    }),
  }),
});

// Export the hook to use it in your components
export const { useFetchOpenOrdersDataQuery } = ordersApi;