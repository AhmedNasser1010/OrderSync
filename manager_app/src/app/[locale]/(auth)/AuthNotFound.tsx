import { useTranslations } from "next-intl";

const AuthNotFound = () => {
  const t = useTranslations("Auth.notFound");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
};

export default AuthNotFound;
