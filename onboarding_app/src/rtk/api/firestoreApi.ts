import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  setDoc,
  updateDoc,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteAuthUser } from "@/app/actions/deleteAuthUser";
import { RestaurantStatusTypes } from "@/types/restaurant";

export interface BusinessSettings {
  siteControl?: {
    closeMsg?: string;
    availability?: boolean;
    autoAvailability?: boolean;
    isBusy?: boolean;
    temporaryPause?: boolean;
    status?: RestaurantStatusTypes;
  };
  orderManagement?: {
    assign?: {
      forCooks?: boolean;
      forDeliveryWorkers?: boolean;
    };
    driverAssignment?: boolean;
    printInvoice?: boolean;
  };
}

export interface BusinessDocument {
  accessToken: string;
  partnerUid?: string;
  owner?: {
    uid?: string;
    name?: string;
    email?: string;
    phone?: string;
    basic?: {
      fName?: string;
      lName?: string;
      age?: string;
      gender?: string;
    };
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
      name?: string;
    };
  };
  business?: {
    name?: string;
    nameInAr?: string;
    industry?: string;
    address?: string;
    latlng?: [number, number];
    cover?: string;
    icon?: string;
    promotionalSubtitle?: string;
    cuisines?: string[];
  };
  services?: {
    openingHours?: Record<
      string,
      {
        start?: string;
        end?: string;
        closed?: boolean;
      }
    >;
    cookTime?: [number, number];
    paymentMethods?: Record<string, boolean>;
  };
  settings?: BusinessSettings;
  status?: RestaurantStatusTypes;
  lastUpdate?: {
    time: string;
    date: string;
  };
  createdOn?: string;
}

export interface CreateBusinessInput {
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

function normalizeBusinessOwner(
  owner: BusinessDocument["owner"] | undefined,
  fallbackUser?: CreateBusinessInput["user"],
) {
  const ownerName =
    owner?.name ??
    owner?.contact?.name ??
    fallbackUser?.name ??
    fallbackUser?.displayName ??
    "";
  const ownerEmail =
    owner?.email ?? owner?.contact?.email ?? fallbackUser?.email ?? "";
  const ownerPhone =
    owner?.phone ??
    owner?.contact?.phone ??
    fallbackUser?.phone ??
    fallbackUser?.phoneNumber ??
    "";

  return {
    uid: owner?.uid ?? fallbackUser?.uid ?? "",
    name: ownerName,
    email: ownerEmail,
    phone: ownerPhone,
    basic: owner?.basic ?? {
      fName: "",
      lName: "",
    },
    contact: {
      name: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
    },
  };
}

export interface UpdateBusinessInput {
  accessToken: string;
  updates: Partial<BusinessDocument>;
}

export interface DeleteBusinessInput {
  accessToken: string;
  userUid: string;
}

export interface ManagerDocument {
  uid: string;
  accessToken: string;
  partnerUid: string;
  createdAt?: number;
  updatedAt?: number;
  userInfo?: {
    uid?: string;
    name?: string;
    email?: string;
    phone?: string;
    secondPhone?: string;
    role?: string;
  };
  owner?: {
    uid?: string;
    name?: string;
    email?: string;
    phone?: string;
    basic?: Record<string, string>;
    contact?: Record<string, string>;
  };
}

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Businesses"],
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
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
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
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["Businesses"],
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
              const q = query(ref, where("accessToken", "in", chunk));
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
        } catch (error: any) {
          console.error(error?.message);
          return { error: error?.message };
        }
      },
      providesTags: ["Businesses"],
    }),

    // Mutation Endpoints
    createUserDocument: builder.mutation({
      async queryFn({ uid, email }: { uid: string; email: string }) {
        try {
          const userData = {
            joinDate: Date.now(),
            uid,
            userInfo: {
              uid,
              email,
              role: "BUSINESSES_CREATOR",
            },
            data: {
              businesses: [],
            },
          };

          const docRef = doc(db, "users", uid);
          await setDoc(docRef, userData);

          console.log("Write Operation [createUserDocument]");
          return { data: null };
        } catch (error: any) {
          console.error("Error creating user document:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["User"],
    }),
    createBusiness: builder.mutation<null, CreateBusinessInput>({
      async queryFn({ business, user }) {
        try {
          if (!business?.accessToken) {
            throw new Error("Business access token is required.");
          }
          if (!user?.uid) {
            throw new Error("User UID is required.");
          }

          await runTransaction(db, async (transaction) => {
            const businessRef = doc(db, "businesses", business.accessToken);
            const menuRef = doc(db, "menus", business.accessToken);
            const ordersRef = doc(db, "orders", business.accessToken);
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

            const normalizedOwner = normalizeBusinessOwner(
              business.owner,
              user,
            );
            const now = Date.now();
            const normalizedBusiness = {
              ...business,
              owner: normalizedOwner,
              partnerUid: user.uid,
              createdOn: business.createdOn ?? String(now),
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

            // 3. Initialize the orders root document for the business
            transaction.set(ordersRef, {
              accessToken: business.accessToken,
              partnerUid: user.uid,
              createdAt: now,
              updatedAt: now,
            });

            // 4. Update the creator's user document to include the new business accessToken
            //    in the data.businesses array
            transaction.update(userRef, {
              ["data.businesses"]: [...currentBusinesses, business.accessToken],
            });

            // 5. Create/update business manager document using the manager's UID as the document ID
            //    This creates a separate document under `users/{managerUid}` rather than overwriting
            //    the current authenticated user's document (the businesses creator).
            const ownerUid = normalizedOwner.uid;
            const managerRef = ownerUid ? doc(db, "users", ownerUid) : userRef;
            transaction.set(
              managerRef,
              {
                accessToken: normalizedBusiness.accessToken,
                partnerUid: user.uid,
                createdAt: now,
                updatedAt: now,
                owner: normalizedOwner,
                userInfo: {
                  email: normalizedOwner.email || user.email,
                  name: normalizedOwner.name || user.name || null,
                  phone: normalizedOwner.phone || user.phone || null,
                  secondPhone: user.secondPhone ?? null,
                  role: "BUSINESS_MANAGER",
                  uid: ownerUid || user.uid,
                },
              },
              { merge: true },
            );
          });

          console.log("Write Operation [createBusiness]");
          return { data: null };
        } catch (error: any) {
          console.error("Error creating business:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["User", "Businesses"],
    }),
    updateBusiness: builder.mutation<null, UpdateBusinessInput>({
      async queryFn({ accessToken, updates }) {
        try {
          if (!accessToken) {
            throw new Error("Business access token is required.");
          }

          const businessRef = doc(db, "businesses", accessToken);
          await updateDoc(businessRef, {
            ...updates,
            lastUpdate: {
              time: new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }),
              date: new Date().toLocaleDateString("en-CA"),
            },
          });

          console.log("Write Operation [updateBusiness]");
          return { data: null };
        } catch (error: any) {
          console.error("Error updating business:", error.message);
          return { error: error.message };
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
          const ordersRef = doc(db, "orders", accessToken);
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

          // 3. Delete the orders document
          batch.delete(ordersRef);
          console.log("Cleanup [deleteBusiness]: Orders document deleted");

          // 4. Remove accessToken from the current user's businesses array
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
        } catch (error: any) {
          console.error("Error deleting business:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["User", "Businesses"],
    }),
    setRestaurantStatus: builder.mutation({
      async queryFn({
        resId,
        status,
      }: {
        resId: string;
        status: RestaurantStatusTypes;
      }) {
        try {
          // Validate input data
          if (!status) {
            throw new Error("Order ID is required.");
          }
          if (!resId) {
            throw new Error("Restaurant ID is required.");
          }

          // Perform Firestore update logic here
          const docRef = doc(db, "businesses", resId);

          await updateDoc(docRef, {
            ["settings.siteControl.status"]: status,
          });

          console.log("Write Operation [setRestaurantStatus]");
          return { data: null };
        } catch (error: any) {
          console.error("Error updating restaurant status:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Businesses"],
    }),
    fetchManagers: builder.query<ManagerDocument[], string>({
      async queryFn(partnerUid: string) {
        try {
          if (!partnerUid) {
            return { data: [] };
          }
          const ref = collection(db, "users");
          const q = query(ref, where("partnerUid", "==", partnerUid));
          const snapshot = await getDocs(q);
          const managers: ManagerDocument[] = snapshot.docs.map((doc) => ({
            uid: doc.id,
            accessToken: doc.data().accessToken ?? "",
            partnerUid: doc.data().partnerUid ?? "",
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt,
            userInfo: doc.data().userInfo,
            owner: doc.data().owner,
          }));
          console.log("Read Operation [fetchManagers]");
          return { data: managers };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["User"],
    }),
    deleteManager: builder.mutation({
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
        } catch (error: any) {
          console.error("Error deleting manager:", error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useFetchUserDataQuery,
  useFetchRestaurantDataQuery,
  useFetchBusinessesQuery,
  useFetchManagersQuery,

  useCreateUserDocumentMutation,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useDeleteManagerMutation,
  useSetRestaurantStatusMutation,
} = firestoreApi;
