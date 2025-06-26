import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getReports, deleteReport } from "@/services/reports";
import { report_t, report_view_t } from "@/types"; // adjust to your Report type
import { AppError } from "@/utils/errors";

// return type
type ReportProvides = {
  reports: report_view_t[];
  refresh: () => void;
  onView: (report: report_view_t) => Promise<void>;
  onDelete: (report: report_view_t) => Promise<void>;
};

export function useReport(): ReportProvides {
  const [reports, setReports] = useState<report_view_t[]>([]);
  const router = useRouter();

  const refresh = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    try {
      const result = await getReports(token);
      setReports(result);
    } catch (e) {
      console.error(e);
      if (e instanceof AppError) {
        if (e.statusCode === 401) {
          router.push('/login');
        }
      }
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onView = async (report: report_view_t) => {
    router.push(`/dashboard/reportes/${report.id}`);
  };


  const onDelete = async (report: report_view_t) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    } 
    try {
      await deleteReport(report.id, token);
      refresh(); // Refresh list after deletion
    } catch (e) {
      console.error(e);
      return;
    }
    return;
  };

  return {
    reports,
    refresh,
    onView,
    onDelete,
  };
}
