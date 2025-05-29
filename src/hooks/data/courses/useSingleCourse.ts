"use client";
import { useQuery } from "@tanstack/react-query";
import { singleCourseQuery } from "./singleCourseQuery";

export default function useSingleCourse(courseId: string) {
  const query = useQuery(singleCourseQuery(courseId));
  return query;
}
