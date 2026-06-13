import Link from "next/link";

import { ProfileAvatar } from "@/components/ProfileAvatar";
import { SiteNav } from "@/components/SiteNav";
import { isAdmin } from "@/lib/admin";
import { COLLECTION_KEYS, getCollectionMeta } from "@/lib/collections";
import { getSiteSettings } from "@/lib/db/site-settings";

export default async function Home() {
  const [settings, admin] = await Promise.all([getSiteSettings(), isAdmin()]);

  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
              hi, i&apos;m ginkgo
            </h1>
            <div className="mt-3 text-[var(--editor-muted)]">
              <p>currently working on a novel</p>
              <p>in the meantime, here are some other things to read</p>
            </div>
          </div>

          <ProfileAvatar imageUrl={settings.profileImageUrl} isAdmin={admin} />
        </div>

        <ul className="mt-10 space-y-3 border-t border-[var(--editor-rule)] pt-6">
          {COLLECTION_KEYS.map((key) => {
            const collection = getCollectionMeta(key);

            return (
              <li key={key}>
                <Link
                  href={collection.href}
                  className="text-base text-[var(--foreground)] transition-colors hover:text-[var(--editor-accent)]"
                >
                  {collection.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
