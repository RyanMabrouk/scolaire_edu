"use client";

import { useQuery } from "@tanstack/react-query";
import { userQueryOptions } from "./userQueryOptions";

export default function useUser() {
  return useQuery(userQueryOptions());
}
