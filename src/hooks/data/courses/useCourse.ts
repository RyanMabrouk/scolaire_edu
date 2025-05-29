"use client";
import { useQuery } from "@tanstack/react-query";
import { courseQuery } from "./courseQuery";

export default function useCourse(courseId: string) {
  const query = useQuery(courseQuery(courseId));
  return query;
}
