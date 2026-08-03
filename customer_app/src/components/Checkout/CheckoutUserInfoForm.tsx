"use client";

import { useState } from "react";
import { object, string, type ValidationError } from "yup";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { addCheckout } from "@/rtk/slices/checkoutSlice";
import Divider from "@/components/Checkout/Divider";
import CheckoutMainButton from "@/components/Checkout/CheckoutMainButton";
import InputWrapper from "@/components/Checkout/InputWrapper";
import CheckoutPageTitle from "@/components/Checkout/CheckoutPageTitle";

const phoneNumberRegex = /\d{11}/;

const validationSchema = object({
  name: string().required("name is required"),
  phone: string()
    .required("phone is required")
    .matches(phoneNumberRegex, "Phone number is not valid. Example: 01117073085"),
  comment: string(),
});

const CheckoutUserInfoForm = ({
  handleCurrentState,
}: {
  handleCurrentState: (status: string) => void;
}) => {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [values, setValues] = useState({
    name: user?.userInfo?.name || "",
    phone: user?.userInfo?.phone || "",
    comment: "",
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "name" | "phone" | "comment"
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validationSchema
      .validate(values, { abortEarly: false })
      .then(() => {
        setErrors({});
        dispatch(
          addCheckout({
            user: {
              name: values.name,
              phone: values.phone,
              secondPhone: user?.userInfo?.secondPhone || null,
            },
            comment: values.comment,
          })
        );
        handleCurrentState("ON_USER_ADDRESS");
      })
      .catch((err: ValidationError) => {
        const errorMap: { name?: string; phone?: string } = {};
        err.inner.forEach((error) => {
          if (error.path) errorMap[error.path as keyof typeof errorMap] = error.message;
        });
        setErrors(errorMap);
      });
  };

  return (
    <div>
      <CheckoutPageTitle title={t("Contact Information")} />
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <InputWrapper
            name="name"
            label={t("Name")}
            placeholder="Ahmed Nasser"
            error={!!errors.name}
            helperMsg={errors.name}
            onChange={(e) => handleChange(e, "name")}
          />
          <InputWrapper
            name="phone"
            label={t("Phone Number")}
            placeholder="01117073085"
            error={!!errors.phone}
            helperMsg={errors.phone}
            onChange={(e) => handleChange(e, "phone")}
          />
          <InputWrapper
            name="comment"
            label={t("Comment")}
            placeholder="No tomato, no potato, no 5osaso"
            onChange={(e) => handleChange(e, "comment")}
          />
        </div>
        <Divider />
        <CheckoutMainButton
          nextLabel={t("Next To Your Location")}
          backLabel={t("Back To Home")}
          nextEventCallback={() => undefined}
          backEventCallback={() => router.replace("/")}
        />
      </form>
    </div>
  );
};

export default CheckoutUserInfoForm;
