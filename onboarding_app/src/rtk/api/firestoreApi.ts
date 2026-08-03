import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  collection,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  limit,
  orderBy,
  FirestoreError,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteAuthUser } from "@/app/actions/deleteAuthUser";
import { getUserProvider } from "@/app/actions/getUserProvider";
import { setUserRoleClaim } from "@/app/actions/setUserRoleClaim";
import type {
  RestaurantStatusTypes,
  BusinessDocument,
  ManagerUser,
  Driver,
  CustomerFeedbackType,
  CustomerType,
  OrderType,
  MainMenuType,
} from "@ordersync/types";

export interface UpdateBusinessInput {
  accessToken: string;
  partnerUid: string;
  updates: Partial<BusinessDocument>;
}

export interface DeleteBusinessInput {
  accessToken: string;
  userUid: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof FirestoreError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Businesses", "Menu", "Drivers", "Customers", "Reviews", "Orders"],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchUserData: builder.query({
      async queryFn(userUid) {
        try {
          const ref = doc(db, "users", userUid);
          const docSnapshot = await getDoc(ref);
          console.log("Read Operation [fetchUserData]");
          if (!docSnapshot.exists()) {
            return { error: "User not found" };
          }
          const userData = docSnapshot.data();
          return { data: userData };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["User"],
    }),
    fetchRestaurantData: builder.query<BusinessDocument | undefined, string>({
      async queryFn(resId) {
        try {
          const resRef = doc(db, "businesses", resId);
          const resSnapshot = await getDoc(resRef);
          const restaurant = resSnapshot.data() as BusinessDocument | undefined;
          console.log("Read Operation [fetchRestaurantData]");
          return { data: restaurant };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Businesses"],
    }),
    fetchMenuData: builder.query<MainMenuType | undefined, string>({
      async queryFn(resId) {
        try {
          const menuRef = doc(db, "menus", resId);
          const menuSnapshot = await getDoc(menuRef);
          const menu = menuSnapshot.data() as MainMenuType | undefined;
          console.log("Read Operation [fetchMenuData]");
          return { data: menu };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Menu"],
    }),
    fetchBusinesses: builder.query<BusinessDocument[], string[] | undefined>({
      async queryFn(accessTokens) {
        try {
          if (!accessTokens?.length) {
            return { data: [] };
          }

          const chunks: string[][] = [];
          for (let index = 0; index < accessTokens.length; index += 10) {
            chunks.push(accessTokens.slice(index, index + 10));
          }

          const snapshots = await Promise.all(
            chunks.map(async (chunk) => {
              const ref = collection(db, "businesses");
              const q = query(ref, where("accessToken", "in", chunk), limit(100));
              return getDocs(q);
            }),
          );

          const businesses = snapshots.flatMap((snapshot) =>
            snapshot.docs.map(
              (businessDoc) => businessDoc.data() as BusinessDocument,
            ),
          );

          console.log("Read Operation [fetchBusinesses]");
          return { data: businesses };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Businesses"],
    }),

    // Mutation Endpoints
    createUserDocument: builder.mutation<null, { uid: string; email: string }>({
      async queryFn({ uid, email }) {
        try {
          const userData = {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            uid,
            userInfo: {
              uid,
              email,
              role: "BUSINESSES_CREATOR",
              provider: "Email/Password",
            },
            data: {
              uid,
              businesses: [],
            },
          };

          const docRef = doc(db, "users", uid);
          await setDoc(docRef, userData);
          await setUserRoleClaim(uid, "BUSINESSES_CREATOR");

          console.log("Write Operation [createUserDocument]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error creating user document:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["User"],
    }),
    createBusiness: builder.mutation<
      null,
      {
        business: BusinessDocument;
        user: {
          uid: string;
          email: string;
          name?: string;
          phone?: string;
          secondPhone?: string;
          displayName?: string | null;
          phoneNumber?: string | null;
        };
      }
    >({
      async queryFn({ business, user }) {
        try {
          if (!business?.accessToken) {
            throw new Error("Business access token is required.");
          }
          if (!user?.uid) {
            throw new Error("User UID is required.");
          }

          const ownerName = user.name ?? user.displayName ?? "";
          const ownerEmail = business.owner?.email ?? user.email ?? "";
          const ownerPhone =
            business.owner?.phone ?? user.phone ?? user.phoneNumber ?? "";
          const normalizedOwner = {
            uid: business.owner?.uid ?? user.uid ?? "",
            name: ownerName,
            email: ownerEmail,
            phone: ownerPhone,
          };
          const managerUid = normalizedOwner.uid || user.uid;
          const now = Date.now();

          // Fetch manager's provider from Firebase Auth (not Partner data)
          const providerResult = await getUserProvider(managerUid);
          const managerProvider = providerResult.provider || "Email/Password";

          await runTransaction(db, async (transaction) => {
            const businessRef = doc(db, "businesses", business.accessToken);
            const menuRef = doc(db, "menus", business.accessToken);
            const userRef = doc(db, "users", user.uid);
            const businessSnapshot = await transaction.get(businessRef);

            if (businessSnapshot.exists()) {
              throw new Error("Business already exists.");
            }

            // Read user data BEFORE any writes (Firestore requires all reads before writes)
            const userSnapshot = await transaction.get(userRef);
            const userData = userSnapshot.data();
            const currentBusinesses = Array.isArray(userData?.data?.businesses)
              ? userData.data.businesses
              : [];

            const normalizedBusiness = {
              ...business,
              owner: normalizedOwner,
              partnerUid: user.uid,
              createdAt: now,
              updatedAt: now,
            };

            // 1. Create business document
            transaction.set(businessRef, normalizedBusiness);

            // 2. Create empty menu document for the business
            transaction.set(menuRef, {
              accessToken: business.accessToken,
              partnerUid: user.uid,
              items: [],
              categories: [],
              createdAt: now,
              updatedAt: now,
            });

            // 3. Update the creator's user document to include the new business accessToken
            //    in the data.businesses array
            transaction.update(userRef, {
              ["data.businesses"]: [...currentBusinesses, business.accessToken],
            });

            // 4. Create/update business manager document using the manager's UID as the document ID
            //    This creates a separate document under `users/{managerUid}` rather than overwriting
            //    the current authenticated user's document (the businesses creator).
            const ownerUid = normalizedOwner.uid;
            const managerRef = ownerUid ? doc(db, "users", ownerUid) : userRef;
            const managerData: ManagerUser = {
              uid: managerUid,
              accessToken: normalizedBusiness.accessToken,
              partnerUid: user.uid,
              createdAt: now,
              updatedAt: now,
              userInfo: {
                uid: managerUid,
                email: normalizedOwner.email || user.email,
                name: normalizedOwner.name || user.name || "",
                phone: normalizedOwner.phone || user.phone || "",
                ...(user.secondPhone ? { secondPhone: user.secondPhone } : {}),
                role: "BUSINESS_MANAGER",
                provider: managerProvider,
              },
            };
            transaction.set(managerRef, managerData, { merge: true });
          });

          await setUserRoleClaim(managerUid, "BUSINESS_MANAGER");

          console.log("Write Operation [createBusiness]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error creating business:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["User", "Businesses"],
    }),
    updateBusiness: builder.mutation<null, UpdateBusinessInput>({
      async queryFn({ accessToken, partnerUid, updates }) {
        try {
          if (!accessToken) {
            throw new Error("Business access token is required.");
          }

          const businessRef = doc(db, "businesses", accessToken);
          let managerChanged = false;
          let newManagerUid = "";

          await runTransaction(db, async (transaction) => {
            const businessSnapshot = await transaction.get(businessRef);
            if (!businessSnapshot.exists()) {
              throw new Error("Business not found.");
            }

            const existingData = businessSnapshot.data() as BusinessDocument;
            const oldOwnerUid = existingData.owner?.uid ?? "";
            const incomingOwnerUid = (updates.owner as BusinessDocument["owner"])?.uid ?? oldOwnerUid;

            if (incomingOwnerUid && incomingOwnerUid !== oldOwnerUid) {
              managerChanged = true;
              newManagerUid = incomingOwnerUid;

              const now = Date.now();
              const ownerData = updates.owner as BusinessDocument["owner"];
              const managerRef = doc(db, "users", newManagerUid);
              const managerSnapshot = await transaction.get(managerRef);

              const managerData: ManagerUser = {
                uid: newManagerUid,
                accessToken,
                partnerUid,
                createdAt: managerSnapshot.exists()
                  ? (managerSnapshot.data() as ManagerUser).createdAt
                  : now,
                updatedAt: now,
                userInfo: {
                  uid: newManagerUid,
                  email: ownerData?.email ?? "",
                  name: ownerData?.name ?? "",
                  phone: ownerData?.phone ?? "",
                  ...(ownerData?.secondPhone ? { secondPhone: ownerData.secondPhone } : {}),
                  role: "BUSINESS_MANAGER",
                  provider: managerSnapshot.exists()
                    ? (managerSnapshot.data() as ManagerUser).userInfo?.provider ?? "Email/Password"
                    : "Email/Password",
                },
              };
              transaction.set(managerRef, managerData, { merge: true });
            }

            transaction.update(businessRef, { ...updates, updatedAt: Date.now() });
          });

          if (managerChanged && newManagerUid) {
            await setUserRoleClaim(newManagerUid, "BUSINESS_MANAGER");
          }

          console.log("Write Operation [updateBusiness]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error updating business:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Businesses", "User"],
    }),
    deleteBusiness: builder.mutation<null, DeleteBusinessInput>({
      async queryFn({ accessToken, userUid }) {
        try {
          if (!accessToken) {
            throw new Error("Business access token is required.");
          }
          if (!userUid) {
            throw new Error("User UID is required.");
          }

          const batch = writeBatch(db);
          const businessRef = doc(db, "businesses", accessToken);
          const menuRef = doc(db, "menus", accessToken);
          const userRef = doc(db, "users", userUid);

          // Fetch the business document to get the owner's UID
          const businessSnapshot = await getDoc(businessRef);
          const businessData = businessSnapshot.data() as
            | BusinessDocument
            | undefined;
          const ownerUid = businessData?.owner?.uid;

          // Fetch and update the current user's document (remove accessToken from businesses array)
          const userSnapshot = await getDoc(userRef);
          const userData = userSnapshot.data();
          const currentBusinesses = Array.isArray(userData?.data?.businesses)
            ? userData.data.businesses
            : [];

          // Batch delete operations:
          // 1. Delete the business document
          batch.delete(businessRef);
          console.log("Cleanup [deleteBusiness]: Business document deleted");

          // 2. Delete the menu document
          batch.delete(menuRef);
          console.log("Cleanup [deleteBusiness]: Menu document deleted");

          // 3. Remove accessToken from the current user's businesses array
          batch.set(
            userRef,
            {
              ...userData,
              data: {
                ...userData?.data,
                businesses: currentBusinesses.filter(
                  (token: string) => token !== accessToken,
                ),
              },
            },
            { merge: true },
          );
          console.log(
            "Cleanup [deleteBusiness]: Access token removed from user's businesses array",
          );

          // 5. Delete the owner/manager user document if it exists and is different from the current user
          if (ownerUid && ownerUid !== userUid) {
            const ownerRef = doc(db, "users", ownerUid);
            const ownerSnapshot = await getDoc(ownerRef);
            if (ownerSnapshot.exists()) {
              batch.delete(ownerRef);
              console.log(
                `Cleanup [deleteBusiness]: Owner/manager user document deleted (ownerUid: ${ownerUid})`,
              );
            } else {
              console.log(
                `Cleanup [deleteBusiness]: Owner/manager user document does not exist (ownerUid: ${ownerUid}), skipping`,
              );
            }
          } else {
            console.log(
              "Cleanup [deleteBusiness]: No separate owner document to delete (owner is the same as current user)",
            );
          }

          await batch.commit();
          console.log("Cleanup [deleteBusiness]: Batch committed successfully");

          // 6. Delete the owner's Firebase Auth account using Admin SDK
          //    This removes the business manager's authentication so they can no longer log in.
          //    Only delete if the owner is different from the current authenticated user.
          if (ownerUid && ownerUid !== userUid) {
            const result = await deleteAuthUser(ownerUid);
            if (result.success) {
              console.log(
                `Cleanup [deleteBusiness]: Owner auth user deleted (ownerUid: ${ownerUid})`,
              );
            } else {
              console.error(
                "Cleanup [deleteBusiness]: Failed to delete auth user:",
                result.error,
              );
            }
          } else {
            console.log(
              "Cleanup [deleteBusiness]: No separate auth user to delete (owner is the same as current user)",
            );
          }

          console.log("Write Operation [deleteBusiness]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error deleting business:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["User", "Businesses"],
    }),
    syncMenuData: builder.mutation<
      { synced: true },
      { resId: string; menu: MainMenuType }
    >({
      async queryFn({ resId, menu }) {
        try {
          if (!resId) {
            throw new Error("Restaurant ID is required.");
          }

          const batch = writeBatch(db);
          const menuRef = doc(db, "menus", resId);
          batch.set(menuRef, menu);
          await batch.commit();
          console.log("Write Operation [syncMenuData]");
          return { data: { synced: true } };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error syncing menu:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Menu"],
    }),
    setRestaurantStatus: builder.mutation<
      null,
      {
        resId: string;
        status: RestaurantStatusTypes;
      }
    >({
      async queryFn({ resId, status }) {
        try {
          // Validate input data
          if (!status) {
            throw new Error("Status is required.");
          }
          if (!resId) {
            throw new Error("Restaurant ID is required.");
          }

          // Perform Firestore update logic here
          const docRef = doc(db, "businesses", resId);

          await updateDoc(docRef, {
            ["status"]: status,
          });

          console.log("Write Operation [setRestaurantStatus]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error updating restaurant status:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Businesses"],
    }),
    fetchManagers: builder.query<ManagerUser[], string>({
      async queryFn(partnerUid: string) {
        try {
          if (!partnerUid) {
            return { data: [] };
          }
          const ref = collection(db, "users");
          const q = query(ref, where("partnerUid", "==", partnerUid), limit(100));
          const snapshot = await getDocs(q);
          const managers: ManagerUser[] = snapshot.docs.map((doc) => ({
            uid: doc.id,
            accessToken: doc.data().accessToken ?? "",
            partnerUid: doc.data().partnerUid ?? "",
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt,
            userInfo: doc.data().userInfo,
          }));
          console.log("Read Operation [fetchManagers]");
          return { data: managers };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["User"],
    }),
    deleteManager: builder.mutation<null, string>({
      async queryFn(managerUid: string) {
        try {
          if (!managerUid) {
            throw new Error("Manager UID is required.");
          }
          const managerRef = doc(db, "users", managerUid);
          await writeBatch(db).delete(managerRef).commit();
          console.log("Write Operation [deleteManager]");
          const result = await deleteAuthUser(managerUid);
          if (!result.success) {
            console.error(
              "deleteManager: Failed to delete auth user:",
              result.error,
            );
          }
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error deleting manager:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["User"],
    }),
    fetchDriverUsers: builder.query<Driver[], string>({
      async queryFn(partnerUid: string) {
        try {
          if (!partnerUid) {
            return { data: [] };
          }
          const ref = collection(db, "drivers");
          const q = query(ref, where("partnerUid", "==", partnerUid), limit(100));
          const snapshot = await getDocs(q);
          const drivers = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              uid: docSnap.id,
              partnerUid: data.partnerUid ?? "",
              createdAt: data.createdAt ?? 0,
              updatedAt: data.updatedAt ?? 0,
              liveLocation: data.liveLocation ?? [0, 0],
              online: data.online ?? { byManager: false, byUser: false },
              queue: data.queue ?? [],
              userInfo: data.userInfo ?? {},
              licensePlate: data.licensePlate,
              finance: data.finance ?? { currentCash: 0, warningLimit: 0, blockLimit: 0 },
            } as Driver;
          });
          console.log("Read Operation [fetchDriverUsers]");
          return { data: drivers };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Drivers"],
    }),
    fetchCustomers: builder.query<CustomerType[], string>({
      async queryFn(partnerUid: string) {
        try {
          if (!partnerUid) {
            return { data: [] };
          }

          const ref = collection(db, "customers");
          const q = query(
            ref,
            where("partnerUid", "==", partnerUid),
            orderBy("createdAt", "desc"),
            limit(100),
          );

          const snapshot = await getDocs(q);
          const customers: CustomerType[] = snapshot.docs.map(
            (docSnap) => docSnap.data() as CustomerType,
          );

          console.log("Read Operation [fetchCustomers]");
          return { data: customers };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Customers"],
    }),
    fetchActiveOrders: builder.query<OrderType[], string[]>({
      async queryFn(accessTokens) {
        try {
          if (!accessTokens?.length) {
            return { data: [] };
          }

          const terminalStatuses = new Set([
            "DELIVERED",
            "GIVEN_FEEDBACK",
            "CANCELED",
            "REJECTED",
            "VOIDED",
          ]);

          const chunks: string[][] = [];
          for (let i = 0; i < accessTokens.length; i += 10) {
            chunks.push(accessTokens.slice(i, i + 10));
          }

          const snapshots = await Promise.all(
            chunks.map(async (chunk) => {
              const ref = collection(db, "orders");
              const q = query(ref, where("businessId", "in", chunk));
              return getDocs(q);
            })
          );

          const orders = snapshots
            .flatMap((snap) =>
              snap.docs
                .map((docSnap) => ({
                  id: docSnap.id,
                  ...docSnap.data(),
                })) as OrderType[]
            )
            .filter((order) => !terminalStatuses.has(order.status?.current))
            .sort((a, b) => b.createdAt - a.createdAt);

          console.log("Read Operation [fetchActiveOrders]");
          return { data: orders };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Orders"],
    }),
    fetchReceivedOrders: builder.query<OrderType[], string[]>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        accessTokens,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (!accessTokens?.length) return;

        const chunks: string[][] = [];
        for (let i = 0; i < accessTokens.length; i += 10) {
          chunks.push(accessTokens.slice(i, i + 10));
        }

        await cacheDataLoaded;

        const unsubscribes = chunks.map((chunk) => {
          const chunkBusinessIds = new Set(chunk);

          const ref = collection(db, "orders");
          const q = query(
            ref,
            where("businessId", "in", chunk),
            where("status.current", "==", "RECEIVED"),
            limit(100),
          );

          return onSnapshot(
            q,
            (snapshot) => {
              updateCachedData((draft: OrderType[]) => {
                const incomingOrders = snapshot.docs.map(
                  (docSnap) =>
                    ({
                      id: docSnap.id,
                      ...docSnap.data(),
                    }) as OrderType,
                );

                const remaining = draft.filter(
                  (o) => !chunkBusinessIds.has(o.businessId),
                );

                draft.length = 0;
                draft.push(...remaining, ...incomingOrders);
                draft.sort((a, b) => b.createdAt - a.createdAt);
              });
            },
            (error) => {
              console.error(
                "Error in real-time listener [fetchReceivedOrders]:",
                error?.message,
              );
            },
          );
        });

        await cacheEntryRemoved;
        unsubscribes.forEach((unsub) => unsub());
      },
      providesTags: ["Orders"],
    }),
    fetchReviews: builder.query<
      CustomerFeedbackType[],
      { partnerUid: string; fetchLimit?: number }
    >({
      async queryFn({ partnerUid, fetchLimit = 100 }) {
        try {
          if (!partnerUid) {
            return { data: [] };
          }

          const userRef = doc(db, "users", partnerUid);
          const userSnap = await getDoc(userRef);
          const accessTokens: string[] =
            userSnap.data()?.data?.businesses ?? [];

          if (accessTokens.length === 0) {
            return { data: [] };
          }

          const chunks: string[][] = [];
          for (let i = 0; i < accessTokens.length; i += 10) {
            chunks.push(accessTokens.slice(i, i + 10));
          }

          const snapshots = await Promise.all(
            chunks.map(async (chunk) => {
              const ref = collection(db, "reviews");
              const q = query(
                ref,
                where("restaurantId", "in", chunk),
                orderBy("createdAt", "desc"),
                limit(fetchLimit),
              );
              return getDocs(q);
            }),
          );

          const reviews = snapshots
            .flatMap((snap) =>
              snap.docs.map(
                (docSnap) =>
                  ({
                    orderId: docSnap.id,
                    ...docSnap.data(),
                  }) as CustomerFeedbackType,
              ),
            )
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, fetchLimit);

          console.log("Read Operation [fetchReviews]");
          return { data: reviews };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Reviews"],
    }),
    updateCustomerDocument: builder.mutation<
      null,
      { uid: string; updates: Partial<CustomerType> }
    >({
      async queryFn({ uid, updates }) {
        try {
          if (!uid) throw new Error("Customer UID is required.");

          const customerRef = doc(db, "customers", uid);
          await updateDoc(customerRef, {
            ...updates,
            updatedAt: Date.now(),
          });

          console.log("Write Operation [updateCustomerDocument]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error updating customer document:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Customers"],
    }),
    createDriverDocument: builder.mutation<
      null,
      {
        uid: string;
        partnerUid: string;
        email: string;
        name: string;
        phone: string;
        secondPhone?: string;
        provider: string;
        licensePlate?: { letters: string; numbers: number };
      }
    >({
      async queryFn({ uid, partnerUid, email, name, phone, secondPhone, provider, licensePlate }) {
        try {
          if (!uid) throw new Error("Driver UID is required.");
          if (!partnerUid) throw new Error("Partner UID is required.");

          const now = Date.now();
          const userInfo: Record<string, unknown> = {
            uid,
            email,
            name,
            phone,
            role: "DRIVER" as const,
            provider,
          };
          if (secondPhone) userInfo.secondPhone = secondPhone;

          const driverData: Record<string, unknown> = {
            uid,
            partnerUid,
            createdAt: now,
            updatedAt: now,
            liveLocation: { lat: 0, lng: 0, updatedAt: now },
            online: {
              byManager: false,
              byUser: false,
            },
            queue: [],
            userInfo,
            finance: {
              currentCash: 0,
              warningLimit: 350,
              blockLimit: 500,
            },
          };
          if (licensePlate) driverData.licensePlate = licensePlate;

          const docRef = doc(db, "drivers", uid);
          await setDoc(docRef, driverData);
          await setUserRoleClaim(uid, "DRIVER");

          console.log("Write Operation [createDriverDocument]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error creating driver document:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Drivers"],
    }),
    updateDriverDocument: builder.mutation<
      null,
      { uid: string; updates: Partial<Driver> }
    >({
      async queryFn({ uid, updates }) {
        try {
          if (!uid) throw new Error("Driver UID is required.");

          const driverRef = doc(db, "drivers", uid);
          await updateDoc(driverRef, {
            ...updates,
            updatedAt: Date.now(),
          });

          console.log("Write Operation [updateDriverDocument]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error updating driver document:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Drivers"],
    }),
    deleteDriverDocument: builder.mutation<null, string>({
      async queryFn(uid: string) {
        try {
          if (!uid) throw new Error("Driver UID is required.");

          const driverRef = doc(db, "drivers", uid);
          await deleteDoc(driverRef);

          const result = await deleteAuthUser(uid);
          if (!result.success) {
            console.error(
              "deleteDriverDocument: Failed to delete auth user:",
              result.error,
            );
          }

          console.log("Write Operation [deleteDriverDocument]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error deleting driver document:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Drivers"],
    }),
  }),
});

export const {
  useFetchUserDataQuery,
  useFetchRestaurantDataQuery,
  useFetchMenuDataQuery,
  useFetchBusinessesQuery,
  useFetchManagersQuery,
  useFetchDriverUsersQuery,
  useFetchCustomersQuery,
  useFetchActiveOrdersQuery,
  useFetchReceivedOrdersQuery,
  useFetchReviewsQuery,

  useCreateUserDocumentMutation,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useSyncMenuDataMutation,
  useDeleteManagerMutation,
  useSetRestaurantStatusMutation,
  useCreateDriverDocumentMutation,
  useUpdateDriverDocumentMutation,
  useDeleteDriverDocumentMutation,
  useUpdateCustomerDocumentMutation,
} = firestoreApi;
