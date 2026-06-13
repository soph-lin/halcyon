import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { SiteNav } from "@/components/SiteNav";
import { isAdmin } from "@/lib/admin";
import { COLLECTIONS, COLLECTION_KEYS } from "@/lib/collections";
import { listAllEntriesForAdmin } from "@/lib/entries";
import {
  getSeriesMembershipsByEntryIds,
  listAllSeriesDetailsForAdmin,
} from "@/lib/series";

export default async function AdminPostsPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const entries = await listAllEntriesForAdmin();
  const [series, seriesByEntryIdMap] = await Promise.all([
    listAllSeriesDetailsForAdmin(),
    getSeriesMembershipsByEntryIds(entries.map((entry) => entry.id)),
  ]);

  const seriesByEntryId = Object.fromEntries(seriesByEntryIdMap.entries());
  const collections = COLLECTION_KEYS.map((key) => COLLECTIONS[key]);

  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <AdminDashboard
          entries={entries}
          series={series}
          seriesByEntryId={seriesByEntryId}
          collections={collections}
        />
      </main>
    </div>
  );
}
