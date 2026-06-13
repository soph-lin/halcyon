"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/admin";
import { isCollectionKey, type CollectionKey } from "@/lib/collections";
import { prisma } from "@/lib/prisma";
import { uniqueSlugForCollection } from "@/lib/slug";

export type SaveEntryInput = {
  mode: "create" | "edit";
  collection: string;
  title: string;
  body: string;
  entryId?: string;
};

export type SaveEntryResult =
  | { ok: true; collection: CollectionKey; slug: string }
  | { ok: false; error: string };

function revalidateEntryPaths(collection: string, slug: string) {
  revalidatePath(`/${collection}`);
  revalidatePath(`/${collection}/${slug}`);
  revalidatePath("/");
}

export async function saveEntry(input: SaveEntryInput): Promise<SaveEntryResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!isCollectionKey(input.collection)) {
    return { ok: false, error: "Invalid collection" };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Title is required" };
  }

  const body = input.body;

  try {
    if (input.mode === "edit") {
      if (!input.entryId) {
        return { ok: false, error: "Entry not found" };
      }

      const existing = await prisma.entry.findUnique({
        where: { id: input.entryId },
      });

      if (!existing) {
        return { ok: false, error: "Entry not found" };
      }

      const updated = await prisma.entry.update({
        where: { id: input.entryId },
        data: {
          title,
          body,
          collection: input.collection,
          status: "published",
          publishedAt: existing.publishedAt ?? new Date(),
        },
      });

      if (existing.collection !== updated.collection) {
        revalidateEntryPaths(existing.collection, existing.slug);
      }

      revalidateEntryPaths(updated.collection, updated.slug);

      return {
        ok: true,
        collection: updated.collection as CollectionKey,
        slug: updated.slug,
      };
    }

    const slug = await uniqueSlugForCollection(input.collection, title);

    const created = await prisma.entry.create({
      data: {
        slug,
        title,
        body,
        collection: input.collection,
        status: "published",
        publishedAt: new Date(),
      },
    });

    revalidateEntryPaths(created.collection, created.slug);

    return {
      ok: true,
      collection: created.collection as CollectionKey,
      slug: created.slug,
    };
  } catch (error) {
    console.error("saveEntry failed:", error);
    return { ok: false, error: "Failed to save entry" };
  }
}
