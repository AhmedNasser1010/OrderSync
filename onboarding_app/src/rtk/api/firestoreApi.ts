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
import { menuHasOffers } from "@/lib/menuHasOffers";
import { deleteAuthUser } from "@/app/actions/deleteAuthUser";
import { getUserProvider } from "@/app/actions/getUserProvider";
import { setUserRoleClaim } from "@/app/actions/setUserRoleClaim";
import { adjustCredit } from "@/app/actions/adjustCredit";
import type {
  RestaurantStatusTypes,
  BusinessDocument,
  ManagerUser,
  Driver,
  CustomerFeedbackType,
  CustomerType,
  OrderType,
  MainMenuType,
  HeroBanner,
  ServicesDocument,
  WalletTransaction,
} from "@ordersync/types";

export interface UpdateBusinessInput {
  accessToken: string;
  partnerUid: string;
  updates: Partial<BusinessDocument>;
  idToken: string;
}

export interface DeleteBusinessInput {
  accessToken: string;
  userUid: string;
  idToken: string;
}

export type OrderLookupField =
  | "orderId"
  | "orderNumber"
  | "customerUid"
  | "driverUid"
  | "businessId"
  | "customerPhone";

export interface SearchOrdersInput {
  field: OrderLookupField;
  value: string;
  businessIds: string[];
}

function getErrorMessage(error: unknown): string {
  if (error instanceof FirestoreError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export const firestoreApi = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User", "Businesses", "Menu", "Drivers", "Customers", "Reviews", "Orders", "Banners", "Services"],
  endpoints: (builder) => ({
    // Query Endpoints
    fetchBanners: builder.query<HeroBanner[], string>({
      async queryFn(partnerUid) {
        try {
          if (!partnerUid) return { data: [] };
          const ref = collection(db, "banners");
          const q = query(ref, where("partnerUid", "==", partnerUid), orderBy("sortOrder", "asc"));
          const snapshot = await getDocs(q);
          const banners: HeroBanner[] = snapshot.docs.map(
            (docSnap) =>
              ({
                id: docSnap.id,
                ...docSnap.data(),
              }) as HeroBanner,
          );
          console.log("Read Operation [fetchBanners]");
          return { data: banners };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Banners"],
    }),
    createBanner: builder.mutation<
      null,
      { banner: Omit<HeroBanner, "id" | "createdAt" | "updatedAt"> }
    >({
      async queryFn({ banner }) {
        try {
          const bannerRef = doc(collection(db, "banners"));
          await setDoc(bannerRef, {
            ...banner,
            id: bannerRef.id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          console.log("Write Operation [createBanner]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error creating banner:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Banners"],
    }),
    updateBanner: builder.mutation<
      null,
      { id: string; updates: Partial<HeroBanner> }
    >({
      async queryFn({ id, updates }) {
        try {
          if (!id) throw new Error("Banner id is required.");
          const bannerRef = doc(db, "banners", id);
          await updateDoc(bannerRef, {
            ...updates,
            updatedAt: Date.now(),
          });
          console.log("Write Operation [updateBanner]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error updating banner:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Banners"],
    }),
    deleteBanner: builder.mutation<null, string>({
      async queryFn(id) {
        try {
          if (!id) throw new Error("Banner id is required.");
          const bannerRef = doc(db, "banners", id);
          await deleteDoc(bannerRef);
          console.log("Write Operation [deleteBanner]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error deleting banner:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Banners"],
    }),
    fetchServices: builder.query<
      Pick<
        ServicesDocument,
        | "deliveryFeesPerKm"
        | "minDeliveryFees"
        | "maxWorkDistanceKm"
        | "cashback"
        | "maintenance"
        | "enableLiveTrackingMap"
      >,
      void
    >({
      async queryFn() {
        try {
          const ref = doc(db, "services", "platform");
          const snapshot = await getDoc(ref);
          const data = snapshot.exists()
            ? (snapshot.data() as Partial<ServicesDocument>)
            : {};
          console.log("Read Operation [fetchServices]");
          return {
            data: {
              deliveryFeesPerKm: data.deliveryFeesPerKm ?? 3.5,
              minDeliveryFees: data.minDeliveryFees ?? 5,
              maxWorkDistanceKm: data.maxWorkDistanceKm ?? 15,
              cashback: data.cashback ?? {
                enabled: false,
                cashbackPercent: 0,
                wipeDays: 90,
                redemptionThreshold: 0,
                maxCashbackPerTx: 0,
              },
              maintenance: data.maintenance ?? { enabled: false },
              enableLiveTrackingMap: data.enableLiveTrackingMap ?? true,
            },
          };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Services"],
    }),
    updateServices: builder.mutation<
      null,
      {
        updates: {
          deliveryFeesPerKm?: number;
          minDeliveryFees?: number;
          maxWorkDistanceKm?: number;
          updatedBy?: string;
          cashback?: {
            enabled: boolean;
            cashbackPercent: number;
            wipeDays: number;
            redemptionThreshold: number;
            maxCashbackPerTx: number;
          };
          maintenance?: {
            enabled: boolean;
            message?: string | null;
            eta?: string | null;
          };
          enableLiveTrackingMap?: boolean;
        };
      }
    >({
      async queryFn({ updates }) {
        try {
          const ref = doc(db, "services", "platform");
          await setDoc(
            ref,
            {
              ...updates,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
          console.log("Write Operation [updateServices]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error updating services:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Services"],
    }),
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
    createUserDocument: builder.mutation<
      null,
      { uid: string; email: string; idToken: string }
    >({
      async queryFn({ uid, email, idToken }) {
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
          // Validate / assign the role claim BEFORE writing the user document,
          // so an account that already holds another role (e.g. a customer)
          // can't be silently promoted, and no stray user doc is left behind.
          const claimResult = await setUserRoleClaim(uid, "BUSINESSES_CREATOR", idToken);
          if (!claimResult.success) {
            throw new Error(claimResult.error || "Failed to set role claim");
          }
          await setDoc(docRef, userData);

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
        idToken: string;
      }
    >({
      async queryFn({ business, user, idToken }) {
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

          // Validate / assign the manager role claim BEFORE writing any docs,
          // so a partner can't create a business then fail with a confusing
          // partial write when they try to make themselves (or a customer, or
          // an account that already holds another role) the manager. Only
          // proceed if the claim was set successfully.
          const claimResult = await setUserRoleClaim(
            managerUid,
            "BUSINESS_MANAGER",
            idToken,
          );
          if (!claimResult.success) {
            throw new Error(claimResult.error || "Failed to set manager role.");
          }

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
              hasOffers: false,
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
      async queryFn({ accessToken, partnerUid, updates, idToken }) {
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
            await setUserRoleClaim(newManagerUid, "BUSINESS_MANAGER", idToken);
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
      async queryFn({ accessToken, userUid, idToken }) {
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
            const result = await deleteAuthUser(ownerUid, idToken);
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
          batch.update(doc(db, "businesses", resId), {
            hasOffers: menuHasOffers(menu),
            updatedAt: Date.now(),
          });
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
    setMarketplaceVisibility: builder.mutation<
      null,
      {
        resId: string;
        hideFromMarketplace: boolean;
      }
    >({
      async queryFn({ resId, hideFromMarketplace }) {
        try {
          if (!resId) {
            throw new Error("Restaurant ID is required.");
          }

          const docRef = doc(db, "businesses", resId);

          await updateDoc(docRef, {
            ["settings.hideFromMarketplace"]: hideFromMarketplace,
          });

          console.log("Write Operation [setMarketplaceVisibility]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error updating marketplace visibility:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Businesses"],
    }),
    setAllLiveTrackingMap: builder.mutation<
      null,
      { enableLiveTrackingMap: boolean }
    >({
      async queryFn({ enableLiveTrackingMap }) {
        try {
          const snapshot = await getDocs(collection(db, "businesses"));
          if (snapshot.empty) {
            return { data: null };
          }

          const batch = writeBatch(db);
          for (const businessDoc of snapshot.docs) {
            batch.update(businessDoc.ref, {
              "settings.enableLiveTrackingMap": enableLiveTrackingMap,
              updatedAt: Date.now(),
            });
          }
          await batch.commit();

          console.log("Write Operation [setAllLiveTrackingMap]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error setting all live tracking maps:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Businesses", "Services"],
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
    deleteManager: builder.mutation<
      null,
      { managerUid: string; idToken: string }
    >({
      async queryFn({ managerUid, idToken }) {
        try {
          if (!managerUid) {
            throw new Error("Manager UID is required.");
          }
          const managerRef = doc(db, "users", managerUid);
          await writeBatch(db).delete(managerRef).commit();
          console.log("Write Operation [deleteManager]");
          const result = await deleteAuthUser(managerUid, idToken);
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
              finance: data.finance ?? { currentCash: 0, dailyAdvance: 0, dailyAdvanceDate: 0, earnings: 0 },
              visibleBusinessIds: data.visibleBusinessIds ?? [],
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
    fetchWalletTransactions: builder.query<WalletTransaction[], string>({
      async queryFn(userId: string) {
        try {
          if (!userId) {
            return { data: [] };
          }
          const ref = collection(db, "wallet_transactions");
          const q = query(
            ref,
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(50),
          );
          const snapshot = await getDocs(q);
          const transactions: WalletTransaction[] = snapshot.docs.map(
            (docSnap) =>
              ({ id: docSnap.id, ...docSnap.data() }) as WalletTransaction,
          );
          console.log("Read Operation [fetchWalletTransactions]");
          return { data: transactions };
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
    searchOrders: builder.query<OrderType[], SearchOrdersInput>({
      keepUnusedDataFor: 900,
      async queryFn({ field, value, businessIds }) {
        try {
          const trimmed = value.trim();
          if (!trimmed || !businessIds.length) {
            return { data: [] };
          }

          if (field === "orderId") {
            const snapshot = await getDoc(doc(db, "orders", trimmed));
            if (!snapshot.exists()) {
              return { data: [] };
            }
            console.log("Read Operation [searchOrders] (orderId)");
            return {
              data: [
                { id: snapshot.id, ...snapshot.data() } as OrderType,
              ],
            };
          }

          if (field === "businessId") {
            if (!businessIds.includes(trimmed)) {
              return { data: [] };
            }
            const ref = collection(db, "orders");
            const q = query(
              ref,
              where("businessId", "==", trimmed),
              limit(100),
            );
            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(
              (docSnap) =>
                ({
                  id: docSnap.id,
                  ...docSnap.data(),
                }) as OrderType,
            );
            orders.sort((a, b) => b.createdAt - a.createdAt);
            console.log("Read Operation [searchOrders] (businessId)");
            return { data: orders };
          }

          let equalityValue: string | number = trimmed;
          if (field === "orderNumber") {
            equalityValue = Number(trimmed);
            if (!Number.isInteger(equalityValue)) {
              throw new Error("Order number must be a whole number.");
            }
          }

          const fieldPath =
            field === "driverUid"
              ? "assignment.driverUid"
              : field === "customerPhone"
                ? "customer.phone"
                : field;

          const chunks: string[][] = [];
          for (let i = 0; i < businessIds.length; i += 10) {
            chunks.push(businessIds.slice(i, i + 10));
          }

          const snapshots = await Promise.all(
            chunks.map(async (chunk) => {
              const ref = collection(db, "orders");
              const q = query(
                ref,
                where("businessId", "in", chunk),
                where(fieldPath, "==", equalityValue),
                limit(100),
              );
              return getDocs(q);
            }),
          );

          const orders = snapshots
            .flatMap((snap) =>
              snap.docs.map(
                (docSnap) =>
                  ({
                    id: docSnap.id,
                    ...docSnap.data(),
                  }) as OrderType,
              ),
            )
            .sort((a, b) => b.createdAt - a.createdAt);

          console.log(`Read Operation [searchOrders] (${field})`);
          return { data: orders };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error(message);
          return { error: message };
        }
      },
      providesTags: ["Orders"],
    }),
    deleteOrder: builder.mutation<
      null,
      { orderId: string; businessIds: string[] }
    >({
      async queryFn({ orderId, businessIds }) {
        try {
          if (!orderId) throw new Error("Order id is required.");
          if (!businessIds.length)
            throw new Error("No businesses are linked to your account yet.");

          const orderRef = doc(db, "orders", orderId);
          const snapshot = await getDoc(orderRef);
          if (!snapshot.exists()) {
            throw new Error("Order not found. It may have already been deleted.");
          }

          const orderData = snapshot.data() as OrderType;
          if (!businessIds.includes(orderData.businessId)) {
            throw new Error(
              "You can only delete orders belonging to your restaurants.",
            );
          }

          const terminalStatuses = new Set([
            "DELIVERED",
            "GIVEN_FEEDBACK",
            "CANCELED",
            "REJECTED",
            "VOIDED",
          ]);
          if (!terminalStatuses.has(orderData.status?.current)) {
            throw new Error(
              "Only completed or canceled orders can be permanently deleted.",
            );
          }

          await deleteDoc(orderRef);
          console.log(`Write Operation [deleteOrder] (${orderId})`);
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error deleting order:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Orders"],
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
    setReviewVisibility: builder.mutation<
      null,
      { orderId: string; restaurantId: string; hidden: boolean; partnerUid: string }
    >({
      async queryFn({ orderId, restaurantId, hidden, partnerUid }) {
        try {
          if (!orderId) throw new Error("Review order ID is required.");
          if (!restaurantId) throw new Error("Restaurant ID is required.");

          await runTransaction(db, async (transaction) => {
            const reviewRef = doc(db, "reviews", orderId);
            const businessRef = doc(db, "businesses", restaurantId);

            const reviewSnap = await transaction.get(reviewRef);
            const businessSnap = await transaction.get(businessRef);

            if (!reviewSnap.exists()) {
              throw new Error("Review not found.");
            }
            if (!businessSnap.exists()) {
              throw new Error("Business not found.");
            }

            const review = reviewSnap.data() as CustomerFeedbackType;
            if ((review.hidden ?? false) === hidden) {
              throw new Error(
                hidden
                  ? "Review is already hidden."
                  : "Review is already visible.",
              );
            }

            const now = Date.now();
            transaction.update(reviewRef, {
              hidden,
              hiddenAt: hidden ? now : null,
              hiddenBy: hidden ? partnerUid : null,
              updatedAt: now,
            });

            const businessData = businessSnap.data();
            const existingSummary = businessData?.reviewSummary ?? {
              averageRating: 0,
              totalReviews: 0,
              totalRatingPoints: 0,
              stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            };

            const delta = hidden ? -1 : 1;
            const rating = review.rating ?? 0;
            const newTotalReviews = Math.max(
              0,
              existingSummary.totalReviews + delta,
            );
            const newTotalRatingPoints = Math.max(
              0,
              existingSummary.totalRatingPoints + delta * rating,
            );
            const nextStars = { ...existingSummary.stars };
            nextStars[rating as keyof typeof nextStars] = Math.max(
              0,
              (nextStars[rating as keyof typeof nextStars] || 0) + delta,
            );

            const newSummary = {
              averageRating:
                newTotalReviews > 0
                  ? (newTotalRatingPoints / newTotalReviews).toFixed(1)
                  : "0.0",
              totalReviews: newTotalReviews,
              totalRatingPoints: newTotalRatingPoints,
              stars: nextStars,
            };

            transaction.set(
              businessRef,
              { reviewSummary: newSummary, updatedAt: now },
              { merge: true },
            );
          });

          console.log(
            `Write Operation [setReviewVisibility]: ${hidden ? "hidden" : "restored"} review ${orderId}`,
          );
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error setting review visibility:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Reviews", "Businesses"],
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
    adjustCustomerCredit: builder.mutation<
      { success: boolean; newBalance?: number; code?: string },
      {
        targetUserId: string;
        amount: number;
        reason: string;
        idToken: string;
        days?: number;
      }
    >({
      async queryFn(args) {
        try {
          const result = await adjustCredit(args);
          if (!result.success) {
            return {
              error: {
                status: 400,
                data: (result as { code?: string }).code,
              },
            };
          }
          return { data: result };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Write Operation [adjustCustomerCredit]:", message);
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
        idToken: string;
      }
    >({
      async queryFn({ uid, partnerUid, email, name, phone, secondPhone, provider, licensePlate, idToken }) {
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
              dailyAdvance: 0,
              dailyAdvanceDate: 0,
              earnings: 0,
            },
          };
          if (licensePlate) driverData.licensePlate = licensePlate;

          const docRef = doc(db, "drivers", uid);
          // Validate the role assignment (one role per account, caller is a
          // partner) BEFORE writing the driver document, so a customer account
          // can never be promoted to driver and no stray doc is left behind.
          const claimResult = await setUserRoleClaim(uid, "DRIVER", idToken);
          if (!claimResult.success) {
            throw new Error(claimResult.error || "Failed to set role claim");
          }
          await setDoc(docRef, driverData);

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
    deleteDriverDocument: builder.mutation<
      null,
      { uid: string; idToken: string }
    >({
      async queryFn({ uid, idToken }) {
        try {
          if (!uid) throw new Error("Driver UID is required.");

          const driverRef = doc(db, "drivers", uid);
          await deleteDoc(driverRef);

          const result = await deleteAuthUser(uid, idToken);
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
    initializeDailyAdvance: builder.mutation<
      null,
      { uid: string; amount: number }
    >({
      async queryFn({ uid, amount }) {
        try {
          if (!uid) throw new Error("Driver UID is required.");
          if (amount <= 0) throw new Error("Advance amount must be positive.");

          const now = Date.now();
          const driverRef = doc(db, "drivers", uid);
          await updateDoc(driverRef, {
            "finance.currentCash": amount,
            "finance.dailyAdvance": amount,
            "finance.dailyAdvanceDate": now,
            updatedAt: now,
          });

          console.log("Write Operation [initializeDailyAdvance]");
          return { data: null };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error initializing daily advance:", message);
          return { error: message };
        }
      },
      invalidatesTags: ["Drivers"],
    }),
    settleDriverAccount: builder.mutation<
      { settlementAmount: number },
      { uid: string }
    >({
      async queryFn({ uid }) {
        try {
          if (!uid) throw new Error("Driver UID is required.");

          const driverRef = doc(db, "drivers", uid);
          const driverSnap = await getDoc(driverRef);
          if (!driverSnap.exists()) throw new Error("Driver not found.");

          const finance = driverSnap.data()?.finance;
          const dailyAdvance = finance?.dailyAdvance ?? 0;
          const earnings = finance?.earnings ?? 0;
          const settlementAmount = dailyAdvance + earnings;

          const now = Date.now();
          await updateDoc(driverRef, {
            "finance.currentCash": 0,
            "finance.dailyAdvance": 0,
            "finance.dailyAdvanceDate": 0,
            "finance.earnings": 0,
            updatedAt: now,
          });

          console.log("Write Operation [settleDriverAccount]");
          return { data: { settlementAmount } };
        } catch (error: unknown) {
          const message = getErrorMessage(error);
          console.error("Error settling driver account:", message);
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
  useLazyFetchDriverUsersQuery,
  useFetchCustomersQuery,
  useLazyFetchCustomersQuery,
  useFetchWalletTransactionsQuery,
  useFetchActiveOrdersQuery,
  useFetchReceivedOrdersQuery,
  useSearchOrdersQuery,
  useDeleteOrderMutation,
  useFetchReviewsQuery,

  useFetchBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,

  useFetchServicesQuery,
  useUpdateServicesMutation,

  useCreateUserDocumentMutation,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useSyncMenuDataMutation,
  useDeleteManagerMutation,
  useSetRestaurantStatusMutation,
  useSetMarketplaceVisibilityMutation,
  useSetAllLiveTrackingMapMutation,
  useCreateDriverDocumentMutation,
  useUpdateDriverDocumentMutation,
  useDeleteDriverDocumentMutation,
  useInitializeDailyAdvanceMutation,
  useSettleDriverAccountMutation,
  useUpdateCustomerDocumentMutation,
  useAdjustCustomerCreditMutation,
  useSetReviewVisibilityMutation,
} = firestoreApi;
