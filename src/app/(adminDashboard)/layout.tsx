import React from "react";
import getProfile from "@/api/getProfile";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider, ToastContainer } from "@/hooks/useToast";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user } = await getProfile();
  if (!user?.is_admin) {
    redirect("/home");
  }
  return (
    <ToastProvider>
      <div className="flex h-full min-h-screen overflow-x-hidden bg-gray-50">
        <AdminSidebar />
        <main className="h-full min-h-screen flex-1 ml-64">{children}</main>
      </div>
      <ToastContainer />
    </ToastProvider>
  );
}
