"use client";
import { useQuery } from "@tanstack/react-query";
import { userCourseAccessQuery } from "./userCourseAccessQuery";

export default function useUserCourseAccess(courseId: string) {
  const query = useQuery(userCourseAccessQuery(courseId));
  return query;
}
