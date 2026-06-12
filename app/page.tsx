import Link from "next/link";

import { SiteNav } from "@/components/SiteNav";
import { COLLECTION_KEYS, getCollectionMeta } from "@/lib/collections";

export default function Home() {
  return (
    <div className="min-h-full">
      <SiteNav active="home" />

      <main className="mx-auto max-w-[42rem] px-6 py-10 sm:py-14">
        <h1 className="font-heading text-3xl tracking-tight text-[var(--foreground)]">
          Halcyon
        </h1>
        <p className="mt-3 text-[var(--editor-muted)]">
          Personal writing — blog posts and little library notes.
        </p>

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
