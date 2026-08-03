"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { UserIcon, PhoneIcon, MapPinIcon } from "lucide-react";
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
  const { saveName, savePhone, saveSecondPhone, saveAddress, saveLocation } =
    useUserForm();
  const [formValues, setFormValues] = useState<{
    name: string;
    phone: string;
    secondPhone: string;
    address: string;
    location: [number, number] | null;
  }>({
    name: "",
    phone: "",
    secondPhone: "",
    address: "",
    location: null,
  });

  useEffect(() => {
    if (user?.userInfo) {
      setFormValues({
        name: user?.userInfo?.name || "",
        phone: user?.userInfo?.phone || "",
        secondPhone: user?.userInfo?.secondPhone || "",
        address: user?.locations?.home?.address || "",
        location: user?.locations?.home?.latlng?.[0]
          ? (user.locations.home.latlng as [number, number])
          : null,
      });
    }
  }, [user]);

  const inputProps = (
    name: "name" | "phone" | "secondPhone" | "address",
    label: string,
    placeholder: string,
    icon: React.ReactNode,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void,
    required = true
  ) => {
    return {
      name,
      label: t(label),
      placeholder: t(placeholder),
      icon,
      onBlur,
      value: formValues[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormValues({ ...formValues, [name]: e.target.value }),
      variant:
        required && !formValues[name] ? ("error" as const) : ("standard" as const),
    };
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-color-7 bg-card p-4 shadow-sm space-y-4">
        <p className="text-[11px] uppercase tracking-wider text-color-5 font-ProximaNovaSemiBold">
          {t("Contact Information")}
        </p>
        <TextInput
          {...inputProps(
            "name",
            "Name",
            "User Name",
            <UserIcon />,
            saveName
          )}
        />
        <TextInput
          {...inputProps(
            "phone",
            "Primary Phone Number",
            "Phone Number",
            <PhoneIcon />,
            savePhone
          )}
          dir="ltr"
        />
        <TextInput
          {...inputProps(
            "secondPhone",
            "Second Phone Number",
            "Phone Number",
            <PhoneIcon />,
            saveSecondPhone,
            false
          )}
          dir="ltr"
        />
      </div>

      <div className="rounded-2xl border border-color-7 bg-card p-4 shadow-sm space-y-4">
        <p className="text-[11px] uppercase tracking-wider text-color-5 font-ProximaNovaSemiBold">
          {t("Address & Location")}
        </p>
        <TextInput
          {...inputProps(
            "address",
            "Address",
            "Street, village, or well known place",
            <MapPinIcon />,
            saveAddress
          )}
        />
        <div
          className={`overflow-hidden rounded-xl ring-1 transition-all ${
            formValues.location ? "ring-color-7" : "ring-2 ring-red-500"
          }`}
        >
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
    </div>
  );
};

export default UserForm;
