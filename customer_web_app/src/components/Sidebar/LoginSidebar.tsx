"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { XCircleIcon, CheckCircleIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/rtk/hooks";
import { toggleLoginSidebar, toggleLng } from "@/rtk/slices/toggleSlice";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserForm from "@/components/Sidebar/UserForm";
import { cn } from "@/lib/utils";

const PHONE_REGEX = /^(010|011|012|015)\d{8}$/;

const LoginSidebar = () => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoginSidebarOpen = useAppSelector(
    (state) => state.toggle.isLoginSidebarOpen
  );
  const user = useAppSelector((state) => state.user);
  const lng = useAppSelector((state) => state.toggle.lng);
  const {
    user: authUser,
    signInWithGoogle,
    sendPhoneOtp,
    verifyOtp,
    logout,
  } = useAuth();

  const [status, setStatus] = useState<"LOGIN" | "OTP">("LOGIN");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [expandUserInfo, setExpandUserInfo] = useState(false);

  useEffect(() => {
    if (
      user?.userInfo &&
      expandUserInfo === false &&
      isLoginSidebarOpen === true
    ) {
      if (
        !user.userInfo?.name ||
        !user.userInfo?.phone ||
        !user.locations?.home?.address ||
        !user.locations?.home?.latlng?.[0]
      ) {
        setExpandUserInfo(true);
      }
    }
  }, [user, isLoginSidebarOpen, expandUserInfo]);

  const changeLanguage = (lng: string) => {
    router.replace("/", { locale: lng });
    dispatch(toggleLng(lng));
  };

  const handleCloseSidebar = () => {
    dispatch(toggleLoginSidebar());
    document.body.classList.remove("overflow-hidden");
    setExpandUserInfo(false);
    setStatus("LOGIN");
  };

  const handleLogout = async () => {
    await logout();
    handleCloseSidebar();
  };

  const handleSendOtp = async () => {
    const normalizedPhone = phone.startsWith("+20")
      ? phone
      : `+20${phone.replace(/^0/, "")}`;
    if (!PHONE_REGEX.test(phone)) {
      return;
    }
    const sent = await sendPhoneOtp(normalizedPhone);
    if (sent) {
      setStatus("OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const result = await verifyOtp(otp);
    if (result) {
      setOtp("");
      setStatus("LOGIN");
      handleCloseSidebar();
      window.location.reload();
    }
  };

  const isCompletedForm =
    user?.locations?.home?.address &&
    user?.locations?.home?.latlng?.[0] &&
    user?.locations?.home?.latlng?.[1] &&
    user?.userInfo?.name &&
    user?.userInfo?.phone
      ? true
      : false;

  const isRTL = locale === "ar";

  return (
    <>
      <div id="recaptcha"></div>
      <div
        className={cn(
          "login-sidebar fixed top-0 h-full overflow-y-scroll justify-between bg-white transition-all duration-500 z-40 sm:px-20 px-5 py-5 w-full sm:py-10 flex flex-col sm:w-[500px]",
          isRTL ? "left-0" : "right-0",
          isLoginSidebarOpen ? "translate-x-0" : isRTL ? "-translate-x-full" : "translate-x-full"
        )}
      >
        <div>
          <button className="text-3xl mb-5" onClick={handleCloseSidebar}>
            <XCircleIcon className="size-7" />
          </button>
          <div className="relative left-0">
            {!authUser ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-color-1 text-3xl font-ProximaNovaMed">
                      {status === "OTP" ? t("Verify OTP") : t("Login")}
                    </h2>
                    <p className="font-ProximaNovaThin mt-1">
                      {t("and")}{" "}
                      <span className="text-color-2 font-ProximaNovaMed">
                        {t("Enjoy your time")}
                      </span>
                    </p>
                  </div>
                  <div>
                    <img
                      className="h-24"
                      src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_147,h_140/Image-login_btpq7r"
                      alt="img"
                    />
                  </div>
                </div>

                {status === "LOGIN" ? (
                  <>
                    <Button
                      className="w-full h-12 uppercase text-base text-white font-ProximaNovaSemiBold bg-color-2 hover:bg-color-2/90 mt-5 mb-5"
                      onClick={signInWithGoogle}
                    >
                      {t("Login With Google")}
                    </Button>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-color-7" />
                      <span className="text-color-5 text-sm">{t("or")}</span>
                      <div className="flex-1 h-px bg-color-7" />
                    </div>
                    <Input
                      className="h-12 mb-3 text-base"
                      type="tel"
                      dir="ltr"
                      placeholder={t("Enter your phone number")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Button
                      className="w-full h-12 uppercase text-base text-white font-ProximaNovaSemiBold bg-color-11 hover:bg-color-11/90"
                      onClick={handleSendOtp}
                      disabled={!PHONE_REGEX.test(phone)}
                    >
                      {t("Send OTP")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      className="h-12 mb-3 text-base"
                      type="text"
                      dir="ltr"
                      placeholder={t("Enter OTP")}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <Button
                      className="w-full h-12 uppercase text-base text-white font-ProximaNovaSemiBold bg-color-11 hover:bg-color-11/90"
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6}
                    >
                      {t("Verify")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full mt-2 text-color-2"
                      onClick={() => setStatus("LOGIN")}
                    >
                      {t("Back")}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  className={cn(
                    "settings-btn relative w-full py-4 uppercase text-base text-white font-ProximaNovaSemiBold cursor-pointer mt-5 mb-5",
                    isCompletedForm ? "bg-color-11" : "bg-red-500"
                  )}
                  onClick={() =>
                    setExpandUserInfo((expand) => !expand)
                  }
                >
                  <span className="text-xl absolute left-[20px] top-[50%] -translate-y-1/2">
                    {isCompletedForm ? <CheckCircleIcon /> : <XCircleIcon />}
                  </span>{" "}
                  {t("Update User Information")}
                </button>
                {expandUserInfo && <UserForm />}
              </>
            )}

            <div className="flex w-full font-ProximaNovaSemiBold cursor-pointer mt-5 border border-color-11">
              <button
                className={`w-full p-4 ${lng === "en" && "bg-color-11 text-white"}`}
                onClick={() => changeLanguage("en")}
              >
                English
              </button>
              <button
                className={`w-full p-4 ${lng === "ar" && "bg-color-11 text-white"}`}
                onClick={() => changeLanguage("ar")}
              >
                العربية
              </button>
            </div>
          </div>
        </div>

        {authUser && (
          <button
            onClick={handleLogout}
            className="w-full py-4 uppercase text-base text-red-500 font-ProximaNovaSemiBold cursor-pointer mt-10 border border-red-500"
          >
            {t("Logout")}
          </button>
        )}
      </div>

      <div
        className={cn(
          "login-sidebar-overlay z-30 top-0 left-0 right-0 bottom-0 bg-color-1 opacity-[0.7] overflow-hidden",
          isLoginSidebarOpen ? "fixed" : "hidden"
        )}
        onClick={handleCloseSidebar}
      ></div>
    </>
  );
};

export default LoginSidebar;
