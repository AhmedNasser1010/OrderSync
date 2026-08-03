function getUserSource() {
  if (typeof window === "undefined") return "unknown_unknown";

  const userAgent = navigator.userAgent || navigator.vendor || "";

  const isPWA = window.matchMedia("(display-mode: standalone)").matches;

  const isMobile = /Mobi|Android/i.test(userAgent);

  const isPC = !isMobile && !isPWA;

  const browserType = (function () {
    if (/chrome|crios|crmo/i.test(userAgent)) {
      return "chrome";
    } else if (/firefox|fxios/i.test(userAgent)) {
      return "firefox";
    } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
      return "safari";
    } else if (/msie|trident/i.test(userAgent)) {
      return "ie";
    } else if (/edge/i.test(userAgent)) {
      return "edge";
    } else {
      return "unknown-browser";
    }
  })();

  let userSource = "";
  if (isPWA) {
    userSource = "pwa";
  } else if (isMobile) {
    userSource = "mobile";
  } else if (isPC) {
    userSource = "pc";
  } else {
    userSource = "unknown";
  }

  return `${userSource}_${browserType}`;
}

export default getUserSource;
