import { getTranslations } from "next-intl/server";

const AuthNotFound = async () => {
  const t = await getTranslations("Auth.notFound");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
};

export default AuthNotFound;
