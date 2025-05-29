import { UseQueryOptions } from "@tanstack/react-query";
import { Database, Tables } from "./database.types";

// Tables names
export type dbTableType = keyof Database[Extract<
  keyof Database,
  "public"
>]["Tables"];

export type QueryReturnType<T extends () => UseQueryOptions> = Awaited<
  ReturnType<
    ReturnType<T>["queryFn"] extends (...args: any) => any
      ? ReturnType<T>["queryFn"]
      : never
  >
>;

export type ILanguages = "en" | "fr" | "ar";
