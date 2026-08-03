"use client";

import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import DB_UPDATE_NESTED_VALUE from "@/utils/DB_UPDATE_NESTED_VALUE";
import {
  updateUserName,
  updateUserPhone,
  updateUserSecondPhone,
  updateUserAddress,
  updateUserLocation,
} from "@/rtk/slices/userSlice";

const pathMap: Record<string, string> = {
  name: "userInfo.name",
  phone: "userInfo.phone",
  secondPhone: "userInfo.secondPhone",
  address: "locations.home.address",
  location: "locations.home.latlng",
};

const useUserForm = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const isValidInput = (
    currentValue: unknown,
    newValue: unknown,
    expectedName: string,
    inputName: string
  ) => {
    if (!user?.userInfo?.uid) {
      console.error("User is not logged in.");
      return false;
    }
    if (!newValue) {
      return false;
    }
    if (expectedName !== inputName) {
      console.error("Input name does not match expected name.");
      return false;
    }
    if (currentValue === newValue) {
      return false;
    }
    return true;
  };

  const updateField = async <T>(
    field: string,
    value: T,
    updateAction: (value: T) => { payload: T; type: string }
  ) => {
    try {
      const currentValue = (user?.userInfo as Record<string, unknown>)?.[field];
      const inputName = field;

      if (!isValidInput(currentValue, value, inputName, inputName)) {
        return;
      }

      const res = await DB_UPDATE_NESTED_VALUE(
        "customers",
        user?.userInfo?.uid as string,
        pathMap[field],
        value
      );
      if (res) {
        dispatch(updateAction(value));
      }
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const saveName = (e: React.FocusEvent<HTMLInputElement>) =>
    updateField("name", e?.target?.value, updateUserName);
  const savePhone = (e: React.FocusEvent<HTMLInputElement>) =>
    updateField("phone", e?.target?.value, updateUserPhone);
  const saveSecondPhone = (e: React.FocusEvent<HTMLInputElement>) =>
    updateField("secondPhone", e?.target?.value, updateUserSecondPhone);
  const saveAddress = (e: React.FocusEvent<HTMLInputElement>) =>
    updateField("address", e?.target?.value, updateUserAddress);
  const saveLocation = (value: number[]) =>
    updateField("location", value, updateUserLocation);

  return {
    saveName,
    savePhone,
    saveSecondPhone,
    saveAddress,
    saveLocation,
  };
};

export default useUserForm;
