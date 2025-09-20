import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import AdminDashboard from "../dashboard/admin/AdminDashboard";
import SchoolDashboard from "../dashboard/school/SchoolDashboard";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_NAME } from "../../utils/constants";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLE_NAME.ADMIN;

  return (
    <div className="min-h-screen w-full ">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Thống kê
            </h1>
           
          </div>
        </div>

        {isAdmin ? <AdminDashboard /> : <SchoolDashboard />}
      </div>
    </div>
  );
}
