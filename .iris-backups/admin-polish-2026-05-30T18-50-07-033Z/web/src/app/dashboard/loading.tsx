// web/src/app/dashboard/loading.tsx
import { GlobalLoading } from "@/components/system/global-loading";

export default function DashboardLoading() {
  return <GlobalLoading routePath="/dashboard" label="Validando sessão administrativa" />;
}
