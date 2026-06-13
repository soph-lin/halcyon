"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/admin";
import { isCollectionKey, type CollectionKey } from "@/lib/data/collections";
import { prisma } from "@/lib/db/prisma";
import { uniqueSlugForCollection } from "@/lib/db/slug";

export type SaveEntryInput = {
  mode: "create" | "edit";
  collection: string;
  title: string;
  body: string;
  entryId?: string;
};

export type SaveEntryResult =
  | { ok: true; collection: CollectionKey; slug: string; entryId: string }
  | { ok: false; error: string };

export type DeleteEntryResult = { ok: true } | { ok: false; error: string };

function revalidateEntryPaths(collection: string, slug: string) {
  revalidatePath(`/${collection}`);
  revalidatePath(`/${collection}/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin/posts");
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
        entryId: updated.id,
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
      entryId: created.id,
    };
  } catch (error) {
    console.error("saveEntry failed:", error);
    return { ok: false, error: "Failed to save entry" };
  }
}

export async function deleteEntry(input: {
  entryId: string;
  collection: string;
  slug: string;
}): Promise<DeleteEntryResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!isCollectionKey(input.collection)) {
    return { ok: false, error: "Invalid collection" };
  }

  try {
    const existing = await prisma.entry.findUnique({
      where: { id: input.entryId },
      include: {
        seriesEntries: {
          include: {
            series: {
              select: { slug: true },
            },
          },
        },
      },
    });

    if (!existing) {
      return { ok: false, error: "Entry not found" };
    }

    await prisma.entry.delete({
      where: { id: input.entryId },
    });

    revalidateEntryPaths(existing.collection, existing.slug);
    revalidatePath("/series");

    for (const membership of existing.seriesEntries) {
      revalidatePath(`/series/${membership.series.slug}`);
      revalidatePath(`/admin/posts`);
    }

    return { ok: true };
  } catch (error) {
    console.error("deleteEntry failed:", error);
    return { ok: false, error: "Failed to delete entry" };
  }
}
