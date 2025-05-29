"use client";
import { useQuery } from "@tanstack/react-query";
import { coursesQuery } from "./coursesQuery";

export default function useCourses() {
  const query = useQuery(coursesQuery());
  return query;
}
