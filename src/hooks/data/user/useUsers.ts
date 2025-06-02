"use client";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptions } from "./usersQueryOptions";

export default function useUsers() {
  return useQuery(usersQueryOptions());
}
