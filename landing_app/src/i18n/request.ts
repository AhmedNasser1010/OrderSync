import { getRequestConfig } from "next-intl/server";
import { IntlError, IntlErrorCode } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`))
    .default as Record<string, any>;

  return {
    locale,
    messages,
    onError: (error: IntlError) => {
      if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
        console.error(error);
      }
    },
    getMessageFallback: ({ key }) => String(messages[key] ?? key),
  };
});
