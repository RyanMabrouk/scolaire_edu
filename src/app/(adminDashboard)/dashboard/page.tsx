import { redirect } from "next/navigation";

export default function AdminDashboardPage() {
  // Redirect to courses management page
  redirect("/dashboard/courses");
}
