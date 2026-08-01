"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/rtk/hooks";

import TextInput from "@/components/Sidebar/TextInput";
import useUserForm from "@/hooks/useUserForm";

const FindUserLocationMap = dynamic(
  () => import("@/components/Sidebar/FindUserLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] rounded-xl bg-color-7/30 animate-pulse" />
    ),
  }
);

const defaultLocation: [number, number] = [29.620106778124843, 31.255811811669496];

const UserForm = () => {
  const t = useTranslations();
  const user = useAppSelector((state) => state.user);
  const { saveName, savePhone, saveAddress, saveLocation } = useUserForm();
  const [formValues, setFormValues] = useState<{
    name: string;
    phone: string;
    address: string;
    location: [number, number] | null;
  }>({
    name: "",
    phone: "",
    address: "",
    location: null,
  });

  useEffect(() => {
    if (user?.userInfo) {
      setFormValues({
        name: user?.userInfo?.name || "",
        phone: user?.userInfo?.phone || "",
        address: user?.locations?.home?.address || "",
        location: user?.locations?.home?.latlng?.[0]
          ? (user.locations.home.latlng as [number, number])
          : null,
      });
    }
  }, [user]);

  const inputProps = (
    name: "name" | "phone" | "address",
    placeholder: string,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  ) => {
    return {
      name,
      placeholder: t(placeholder),
      onBlur,
      value: formValues[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormValues({ ...formValues, [name]: e.target.value }),
      variant: formValues[name] ? "standard" : "error",
    } as const;
  };

  return (
    <div>
      <TextInput {...inputProps("name", "User Name", saveName)} />
      <TextInput {...inputProps("phone", "Phone Number", savePhone)} />
      <TextInput
        {...inputProps("address", "Street, village, or well known place", saveAddress)}
      />
      <div className="border-t my-5"></div>
      <div className={`mx-7 ${!formValues.location && "ring-1 ring-red-500"}`}>
        <FindUserLocationMap
          userLocation={formValues.location}
          defaultLocation={defaultLocation}
          onChange={(value) => {
            setFormValues({ ...formValues, location: value });
            saveLocation(value);
          }}
        />
      </div>
    </div>
  );
};

export default UserForm;
