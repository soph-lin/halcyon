import { notFound } from "next/navigation";

import { StatusPage } from "@/components/ui/StatusPage";
import { isStatusType } from "@/lib/data/ui";

type UiRoutePageProps = {
  params: Promise<{ type: string }>;
};

export default async function UiRoutePage({ params }: UiRoutePageProps) {
  const { type } = await params;

  if (!isStatusType(type)) {
    notFound();
  }

  return <StatusPage type={type} />;
}
