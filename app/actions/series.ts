"use server";

import { revalidatePath } from "next/cache";

import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uniqueSlugForSeries } from "@/lib/slug";

export type SeriesActionResult =
  | { ok: true; slug: string; id: string }
  | { ok: false; error: string };

function revalidateSeriesPaths(slug: string) {
  revalidatePath("/series");
  revalidatePath(`/series/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/leaves");
}

async function revalidateSeriesEntryPaths(seriesId: string) {
  const memberships = await prisma.seriesEntry.findMany({
    where: { seriesId },
    include: {
      entry: {
        select: { collection: true, slug: true },
      },
    },
  });

  for (const membership of memberships) {
    revalidatePath(`/${membership.entry.collection}/${membership.entry.slug}`);
  }
}

export async function createSeries(input: {
  title: string;
  description?: string;
  customOrder?: boolean;
}): Promise<SeriesActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Title is required" };
  }

  try {
    const slug = await uniqueSlugForSeries(title);
    const series = await prisma.series.create({
      data: {
        slug,
        title,
        description: input.description?.trim() ?? "",
        customOrder: input.customOrder ?? true,
      },
    });

    revalidateSeriesPaths(series.slug);
    revalidatePath("/admin/posts");

    return { ok: true, slug: series.slug, id: series.id };
  } catch (error) {
    console.error("createSeries failed:", error);
    return { ok: false, error: "Failed to create series" };
  }
}

export async function createSeriesAndAddEntry(input: {
  title: string;
  description?: string;
  customOrder?: boolean;
  entryId: string;
}): Promise<SeriesActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Title is required" };
  }

  try {
    const entry = await prisma.entry.findUnique({
      where: { id: input.entryId },
    });

    if (!entry) {
      return { ok: false, error: "Entry not found" };
    }

    const slug = await uniqueSlugForSeries(title);
    const customOrder = input.customOrder ?? true;

    const series = await prisma.series.create({
      data: {
        slug,
        title,
        description: input.description?.trim() ?? "",
        customOrder,
        entries: {
          create: {
            entryId: input.entryId,
            position: customOrder ? 0 : null,
          },
        },
      },
    });

    revalidateSeriesPaths(series.slug);
    revalidatePath(`/${entry.collection}/${entry.slug}`);

    return { ok: true, slug: series.slug, id: series.id };
  } catch (error) {
    console.error("createSeriesAndAddEntry failed:", error);
    return { ok: false, error: "Failed to create series" };
  }
}

export async function listSeriesOptionsForEditor() {
  if (!(await isAdmin())) {
    return [];
  }

  return prisma.series.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      customOrder: true,
    },
    orderBy: { title: "asc" },
  });
}

export async function getEntrySeriesMembershipsForEditor(entryId: string) {
  if (!(await isAdmin())) {
    return [];
  }

  const memberships = await prisma.seriesEntry.findMany({
    where: { entryId },
    include: {
      series: {
        select: {
          id: true,
          slug: true,
          title: true,
          customOrder: true,
        },
      },
    },
    orderBy: { series: { title: "asc" } },
  });

  return memberships.map((membership) => ({
    seriesId: membership.series.id,
    slug: membership.series.slug,
    title: membership.series.title,
    customOrder: membership.series.customOrder,
  }));
}

export async function updateSeries(input: {
  seriesId: string;
  title: string;
  description?: string;
  customOrder?: boolean;
}): Promise<SeriesActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Title is required" };
  }

  try {
    const existing = await prisma.series.findUnique({
      where: { id: input.seriesId },
    });

    if (!existing) {
      return { ok: false, error: "Series not found" };
    }

    const customOrder = input.customOrder ?? existing.customOrder;

    const updated = await prisma.series.update({
      where: { id: input.seriesId },
      data: {
        title,
        description: input.description?.trim() ?? "",
        customOrder,
      },
    });

    if (customOrder && !existing.customOrder) {
      await renumberSeriesEntries(input.seriesId);
    }

    // Keep position values when switching to unordered so custom order can
    // be restored if the series is toggled back to ordered.

    revalidateSeriesPaths(updated.slug);
    await revalidateSeriesEntryPaths(input.seriesId);

    return { ok: true, slug: updated.slug, id: updated.id };
  } catch (error) {
    console.error("updateSeries failed:", error);
    return { ok: false, error: "Failed to update series" };
  }
}

export async function deleteSeries(input: {
  seriesId: string;
  deleteEntries?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.series.findUnique({
      where: { id: input.seriesId },
      include: {
        entries: {
          include: {
            entry: {
              select: { id: true, collection: true, slug: true },
            },
          },
        },
      },
    });

    if (!existing) {
      return { ok: false, error: "Series not found" };
    }

    const seriesEntries = existing.entries.map((membership) => membership.entry);

    if (input.deleteEntries) {
      await prisma.entry.deleteMany({
        where: {
          id: { in: seriesEntries.map((entry) => entry.id) },
        },
      });

      for (const entry of seriesEntries) {
        revalidatePath(`/${entry.collection}/${entry.slug}`);
      }

      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath("/leaves");
    } else {
      await revalidateSeriesEntryPaths(input.seriesId);
    }

    await prisma.series.delete({
      where: { id: input.seriesId },
    });

    revalidateSeriesPaths(existing.slug);
    revalidatePath("/admin/posts");

    return { ok: true };
  } catch (error) {
    console.error("deleteSeries failed:", error);
    return { ok: false, error: "Failed to delete series" };
  }
}

async function applySeriesEntryOrder(seriesId: string, entryIds: string[]) {
  await prisma.$transaction(async (tx) => {
    await tx.seriesEntry.updateMany({
      where: { seriesId },
      data: { position: null },
    });

    await Promise.all(
      entryIds.map((entryId, index) =>
        tx.seriesEntry.update({
          where: {
            seriesId_entryId: {
              seriesId,
              entryId,
            },
          },
          data: { position: index },
        }),
      ),
    );
  });
}

async function renumberSeriesEntries(seriesId: string) {
  const entries = await prisma.seriesEntry.findMany({
    where: { seriesId },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });

  await applySeriesEntryOrder(
    seriesId,
    entries.map((entry) => entry.entryId),
  );
}

export async function addEntryToSeries(input: {
  seriesId: string;
  entryId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
      include: {
        _count: { select: { entries: true } },
      },
    });

    if (!series) {
      return { ok: false, error: "Series not found" };
    }

    const entry = await prisma.entry.findUnique({
      where: { id: input.entryId },
    });

    if (!entry) {
      return { ok: false, error: "Entry not found" };
    }

    const existing = await prisma.seriesEntry.findUnique({
      where: {
        seriesId_entryId: {
          seriesId: input.seriesId,
          entryId: input.entryId,
        },
      },
    });

    if (existing) {
      return { ok: false, error: "Entry is already in this series" };
    }

    await prisma.seriesEntry.create({
      data: {
        seriesId: input.seriesId,
        entryId: input.entryId,
        position: series.customOrder ? series._count.entries : null,
      },
    });

    revalidateSeriesPaths(series.slug);
    revalidatePath(`/${entry.collection}/${entry.slug}`);

    return { ok: true };
  } catch (error) {
    console.error("addEntryToSeries failed:", error);
    return { ok: false, error: "Failed to add entry to series" };
  }
}

export async function removeEntryFromSeries(input: {
  seriesId: string;
  entryId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
    });

    if (!series) {
      return { ok: false, error: "Series not found" };
    }

    const entry = await prisma.entry.findUnique({
      where: { id: input.entryId },
    });

    await prisma.seriesEntry.delete({
      where: {
        seriesId_entryId: {
          seriesId: input.seriesId,
          entryId: input.entryId,
        },
      },
    });

    if (series.customOrder) {
      await renumberSeriesEntries(input.seriesId);
    }

    revalidateSeriesPaths(series.slug);

    if (entry) {
      revalidatePath(`/${entry.collection}/${entry.slug}`);
    }

    return { ok: true };
  } catch (error) {
    console.error("removeEntryFromSeries failed:", error);
    return { ok: false, error: "Failed to remove entry from series" };
  }
}

export async function reorderSeriesEntries(input: {
  seriesId: string;
  entryIds: string[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
    });

    if (!series) {
      return { ok: false, error: "Series not found" };
    }

    if (!series.customOrder) {
      return { ok: false, error: "Cannot reorder an unordered series" };
    }

    const memberships = await prisma.seriesEntry.findMany({
      where: { seriesId: input.seriesId },
    });

    const membershipByEntryId = new Map(
      memberships.map((membership) => [membership.entryId, membership]),
    );

    if (input.entryIds.length !== memberships.length) {
      return { ok: false, error: "Invalid entry order" };
    }

    for (const entryId of input.entryIds) {
      if (!membershipByEntryId.has(entryId)) {
        return { ok: false, error: "Invalid entry order" };
      }
    }

    await applySeriesEntryOrder(input.seriesId, input.entryIds);

    revalidateSeriesPaths(series.slug);
    await revalidateSeriesEntryPaths(input.seriesId);

    return { ok: true };
  } catch (error) {
    console.error("reorderSeriesEntries failed:", error);
    return { ok: false, error: "Failed to reorder entries" };
  }
}

export async function moveSeriesEntry(input: {
  seriesId: string;
  entryId: string;
  direction: "up" | "down";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const series = await prisma.series.findUnique({
      where: { id: input.seriesId },
      include: {
        entries: {
          orderBy: [{ position: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!series) {
      return { ok: false, error: "Series not found" };
    }

    if (!series.customOrder) {
      return { ok: false, error: "Cannot reorder an unordered series" };
    }

    const entryIds = series.entries.map((entry) => entry.entryId);
    const currentIndex = entryIds.indexOf(input.entryId);

    if (currentIndex === -1) {
      return { ok: false, error: "Entry not found in series" };
    }

    const targetIndex =
      input.direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= entryIds.length) {
      return { ok: true };
    }

    const nextOrder = [...entryIds];
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [
      nextOrder[targetIndex],
      nextOrder[currentIndex],
    ];

    return reorderSeriesEntries({
      seriesId: input.seriesId,
      entryIds: nextOrder,
    });
  } catch (error) {
    console.error("moveSeriesEntry failed:", error);
    return { ok: false, error: "Failed to move entry" };
  }
}
