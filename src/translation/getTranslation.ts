"use server";
import getProfile from "@/api/getProfile";
import getSession from "@/api/getSession";
import { ILanguages } from "@/types/database.tables.types";

const dictionaries = {
  en: () => import("./locales/en.json").then((module) => module.default),
  fr: () => import("./locales/fr.json").then((module) => module.default),
  ar: () => import("./locales/ar.json").then((module) => module.default),
};

export default async function getTranslation(locale: ILanguages) {
  const { session } = await getSession();
  let default_language = await getProfile().then(
    (res) => res.data?.default_language,
  );
  const lang = await dictionaries?.[default_language ?? locale]?.();
  return { lang, default_language: default_language ?? locale };
}
