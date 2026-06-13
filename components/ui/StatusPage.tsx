import { SiteNav } from "@/components/SiteNav";
import { STATUS_PAGES, type StatusType } from "@/lib/data/ui";

type StatusPageProps = {
  type: StatusType;
};

export function StatusPage({ type }: StatusPageProps) {
  const { title, message } = STATUS_PAGES[type];

  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="ui-page">
        <h1 className="ui-page-title">{title}</h1>
        <p className="ui-page-message">{message}</p>
      </main>
    </div>
  );
}
