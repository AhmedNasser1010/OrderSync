"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { addToUserLocation } from "@/rtk/slices/checkoutSlice";
import CheckoutMainButton from "@/components/Checkout/CheckoutMainButton";
import Divider from "@/components/Checkout/Divider";
import InputWrapper from "@/components/Checkout/InputWrapper";
import CheckoutPageTitle from "@/components/Checkout/CheckoutPageTitle";

const CheckoutLocationMap = dynamic(
  () => import("@/components/Checkout/CheckoutLocationMap"),
  { ssr: false }
);

const RadioInputWrapper = ({
  htmlFor,
  selected,
  children,
}: {
  htmlFor: string;
  selected: boolean;
  children: React.ReactNode;
}) => (
  <label
    htmlFor={htmlFor}
    className="flex flex-col items-center gap-4 border border-[#979797] rounded-[6px] py-8 w-[calc(100%/2-10px)] cursor-pointer transition-colors"
    style={{ borderColor: selected ? "blue" : undefined }}
  >
    {children}
  </label>
);

const CheckoutUserAddress = ({
  handleCurrentState,
  restaurantLocation,
}: {
  handleCurrentState: (status: string) => void;
  restaurantLocation: [number, number];
}) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const homeLatlng = user?.locations?.home?.latlng;
  const [newCustomMark, setNewCustomMark] = useState<[number, number] | null>(
    null
  );
  const [userCurrentLocation, setUserCurrentLocation] = useState<
    [number, number] | null
  >(homeLatlng?.[0] ? (homeLatlng as [number, number]) : null);
  const [address, setAddress] = useState(
    user?.locations?.home?.address || ""
  );
  const [selectedLocation, setSelectedLocation] = useState("current");

  const handleAddCustomMarker = (latlng: [number, number]) => {
    setNewCustomMark(latlng);
  };

  const handleSetUserCurrentLocation = (latlng: [number, number]) => {
    setUserCurrentLocation(latlng);
  };

  const handleOnRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!newCustomMark) {
      toast.error(t("First, select your custom location on the map."), {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    setSelectedLocation(e.target.value);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleToNext = () => {
    if (newCustomMark || address || userCurrentLocation) {
      handleCurrentState("ON_PAYMENT");
    } else {
      toast.error(
        "Choose one or more: use 'Find My Location,' add a custom location, or enter a regular address.",
        { position: "top-center", duration: 5000 }
      );
      return;
    }
  };

  useEffect(() => {
    const currentLatlng: number[] = userCurrentLocation
      ? [userCurrentLocation[0], userCurrentLocation[1]]
      : [0, 0];
    const customLatlng: number[] = newCustomMark
      ? [newCustomMark[0], newCustomMark[1]]
      : [0, 0];
    dispatch(
      addToUserLocation({
        latlng: selectedLocation === "custom" ? customLatlng : currentLatlng,
        address: user?.locations?.home?.address || address,
      })
    );
  }, [userCurrentLocation, newCustomMark, selectedLocation, address, dispatch, user]);

  return (
    <div>
      <CheckoutPageTitle title={t("Address & Location")} />
      <CheckoutLocationMap
        restaurantLocation={restaurantLocation}
        userLocation={userCurrentLocation}
        onCurrentLocation={handleSetUserCurrentLocation}
        onCustomLocation={handleAddCustomMarker}
      />
      <div className="flex row-gap-4 flex-wrap justify-between select-none my-8">
        <RadioInputWrapper htmlFor="current-location" selected={selectedLocation === "current"}>
          <input
            id="current-location"
            type="radio"
            name="location"
            value="current"
            checked={selectedLocation === "current"}
            onChange={handleOnRadioChange}
          />
          <span className="text-[22px] font-light">{t("Current Location")}</span>
          <p className="text-[13px] w-4/5 text-center text-color-8">
            {t("The order will be delivered to your current location")}
          </p>
        </RadioInputWrapper>
        <RadioInputWrapper htmlFor="new-selected-location" selected={selectedLocation === "custom" && !!newCustomMark}>
          <input
            id="new-selected-location"
            type="radio"
            name="location"
            value="custom"
            checked={selectedLocation === "custom" && !!newCustomMark}
            onChange={handleOnRadioChange}
          />
          <span className="text-[22px] font-light">{t("New Selected Location")}</span>
          <p className="text-[13px] w-4/5 text-center text-color-8">
            {t("The order will be delivered to your new selected location")}
          </p>
        </RadioInputWrapper>
      </div>
      <Divider />
      <InputWrapper
        name="address"
        type="text"
        label={t("Address")}
        placeholder={t("A street, village, or well-known place")}
        onChange={handleAddressChange}
      />
      <Divider />
      <CheckoutMainButton
        nextLabel={t("Payment")}
        backLabel={t("Back To User Info")}
        nextEventCallback={handleToNext}
        backEventCallback={() => handleCurrentState("ON_USER_INFO")}
      />
    </div>
  );
};

export default CheckoutUserAddress;
