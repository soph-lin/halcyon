"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { useBodyScrollLock } from "@/components/ui/useBodyScrollLock";

import {
  addEntryToSeries,
  createSeries,
  deleteSeries,
  removeEntryFromSeries,
  reorderSeriesEntries,
  updateSeries,
} from "@/app/actions/series";
import { NewSeriesModal } from "@/components/editor/admin/NewSeriesModal";
import { useEditor } from "@/components/editor/admin/EditorContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { getCollectionMeta, isCollectionKey } from "@/lib/data/collections";
import { entryDisplayDate } from "@/lib/editor/format/entry";
import type { AdminEntryListItem } from "@/lib/editor/types/entry";
import type {
  AdminSeriesDetail,
  AdminSeriesEntry,
} from "@/lib/editor/types/series";

function entryToSeriesEntry(
  entry: AdminEntryListItem,
): AdminSeriesEntry | null {
  if (!isCollectionKey(entry.collection)) {
    return null;
  }

  return {
    id: entry.id,
    title: entry.title,
    collection: entry.collection,
    slug: entry.slug,
    href: `/${entry.collection}/${entry.slug}`,
    status: entry.status,
    position: null,
    seriesEntryId: `pending-${entry.id}`,
  };
}

function seriesEntriesMatch(
  saved: AdminSeriesEntry[],
  local: AdminSeriesEntry[],
): boolean {
  if (saved.length !== local.length) {
    return false;
  }

  return saved.every((entry, index) => entry.id === local[index]?.id);
}

function seriesMembershipChanged(
  saved: AdminSeriesEntry[],
  local: AdminSeriesEntry[],
): boolean {
  const savedIds = new Set(saved.map((entry) => entry.id));
  const localIds = new Set(local.map((entry) => entry.id));

  if (savedIds.size !== localIds.size) {
    return true;
  }

  for (const id of savedIds) {
    if (!localIds.has(id)) {
      return true;
    }
  }

  return false;
}

type AdminSeriesCardProps = {
  series: AdminSeriesDetail;
  onOpen: () => void;
};

function AdminSeriesCard({ series, onOpen }: AdminSeriesCardProps) {
  return (
    <li className="admin-series-card">
      <button
        type="button"
        className="admin-series-card-summary"
        onClick={onOpen}
      >
        <span className="admin-entry-row-title">{series.title}</span>
        <span className="admin-series-card-meta">
          {series.entries.length} post{series.entries.length === 1 ? "" : "s"}
        </span>
      </button>
    </li>
  );
}

type EditSeriesPostsSectionProps = {
  localEntries: AdminSeriesEntry[];
  customOrder: boolean;
  entries: AdminEntryListItem[];
  disabled?: boolean;
  onAddEntry: (entryId: string) => void;
  onRemoveEntry: (entryId: string) => void;
  onReorderEntries: (entryIds: string[]) => void;
  onNewPost: () => void;
};

type SeriesPostRowProps = {
  entry: AdminSeriesEntry;
  index: number;
  customOrder: boolean;
  canDrag: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isBusy: boolean;
  isFirst: boolean;
  isLast: boolean;
  onDragStart: (
    entryId: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  onDragOver: (entryId: string, event: React.DragEvent<HTMLLIElement>) => void;
  onDragLeave: () => void;
  onDrop: (entryId: string, event: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onMove: (entryId: string, direction: "up" | "down") => void;
  onRemove: (entryId: string) => void;
};

function SeriesPostRow({
  entry,
  index,
  customOrder,
  canDrag,
  isDragging,
  isDragOver,
  isBusy,
  isFirst,
  isLast,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMove,
  onRemove,
}: SeriesPostRowProps) {
  const rowClassName = [
    "admin-series-member-row",
    isDragging ? "is-dragging" : "",
    isDragOver ? "is-drag-over" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mainClassName = [
    "admin-series-member-main",
    canDrag ? "is-draggable" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      className={rowClassName}
      onDragOver={(event) => onDragOver(entry.id, event)}
      onDragLeave={onDragLeave}
      onDrop={(event) => onDrop(entry.id, event)}
    >
      <div
        className={mainClassName}
        draggable={canDrag}
        onDragStart={(event) => onDragStart(entry.id, event)}
        onDragEnd={onDragEnd}
      >
        {customOrder ? (
          <span className="admin-series-member-position">{index + 1}.</span>
        ) : null}
        <div className="min-w-0">
          <Link
            href={entry.href}
            className="admin-series-post-link"
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
          >
            {entry.title}
          </Link>
          {isCollectionKey(entry.collection) ? (
            <p className="mt-0.5 text-xs text-[var(--editor-muted)]">
              {getCollectionMeta(entry.collection).title}
            </p>
          ) : null}
        </div>
      </div>

      <div className="admin-series-member-actions">
        {customOrder ? (
          <>
            <button
              type="button"
              className="admin-entry-action-btn"
              aria-label={`Move ${entry.title} up`}
              disabled={isBusy || isFirst}
              onClick={() => onMove(entry.id, "up")}
            >
              <ChevronUp size={16} strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              className="admin-entry-action-btn"
              aria-label={`Move ${entry.title} down`}
              disabled={isBusy || isLast}
              onClick={() => onMove(entry.id, "down")}
            >
              <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="admin-entry-action-btn admin-entry-delete-btn"
          aria-label={`Remove ${entry.title} from series`}
          disabled={isBusy}
          onClick={() => onRemove(entry.id)}
        >
          <X size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </li>
  );
}

function reorderEntryIds(
  entryIds: string[],
  draggedId: string,
  targetId: string,
): string[] {
  const fromIndex = entryIds.indexOf(draggedId);
  const toIndex = entryIds.indexOf(targetId);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return entryIds;
  }

  const next = [...entryIds];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

function EditSeriesPostsSection({
  localEntries,
  customOrder,
  entries,
  disabled = false,
  onAddEntry,
  onRemoveEntry,
  onReorderEntries,
  onNewPost,
}: EditSeriesPostsSectionProps) {
  const [entryToAdd, setEntryToAdd] = useState("");
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);
  const [dragOverEntryId, setDragOverEntryId] = useState<string | null>(null);

  const localEntryIds = useMemo(
    () => new Set(localEntries.map((entry) => entry.id)),
    [localEntries],
  );

  const availableEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => !localEntryIds.has(entry.id))
        .sort(
          (a, b) =>
            entryDisplayDate(b).getTime() - entryDisplayDate(a).getTime(),
        ),
    [entries, localEntryIds],
  );

  const handleAdd = () => {
    if (!entryToAdd) {
      return;
    }

    onAddEntry(entryToAdd);
    setEntryToAdd("");
  };

  const handleMove = (entryId: string, direction: "up" | "down") => {
    const entryIds = localEntries.map((entry) => entry.id);
    const currentIndex = entryIds.indexOf(entryId);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= entryIds.length) {
      return;
    }

    const next = [...entryIds];
    [next[currentIndex], next[targetIndex]] = [
      next[targetIndex],
      next[currentIndex],
    ];
    onReorderEntries(next);
  };

  const clearDragState = () => {
    setDraggedEntryId(null);
    setDragOverEntryId(null);
  };

  const canDragPosts = customOrder && !disabled;

  const handleDragStart = (
    entryId: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    if (!canDragPosts) {
      return;
    }

    setDraggedEntryId(entryId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", entryId);
  };

  const handleDragOver = (
    entryId: string,
    event: React.DragEvent<HTMLLIElement>,
  ) => {
    if (!canDragPosts || !draggedEntryId || draggedEntryId === entryId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverEntryId(entryId);
  };

  const handleDrop = (
    targetEntryId: string,
    event: React.DragEvent<HTMLLIElement>,
  ) => {
    event.preventDefault();

    if (!canDragPosts || !draggedEntryId) {
      clearDragState();
      return;
    }

    const entryIds = localEntries.map((entry) => entry.id);
    const nextEntryIds = reorderEntryIds(
      entryIds,
      draggedEntryId,
      targetEntryId,
    );

    clearDragState();

    if (nextEntryIds.join(",") !== entryIds.join(",")) {
      onReorderEntries(nextEntryIds);
    }
  };

  return (
    <details className="admin-series-modal-section" open>
      <summary className="admin-series-modal-section-summary">
        <span>Posts</span>
        <ChevronDown
          className="admin-series-modal-section-chevron"
          size={18}
          strokeWidth={1.75}
          aria-hidden
        />
      </summary>

      <div className="admin-series-add-row mt-4">
        <button
          type="button"
          onClick={onNewPost}
          disabled={disabled}
          className="admin-new-post-button"
        >
          New post
        </button>

        {availableEntries.length > 0 ? (
          <>
            <select
              value={entryToAdd}
              onChange={(event) => setEntryToAdd(event.target.value)}
              className="admin-series-form-select admin-series-add-select"
              disabled={disabled}
            >
              <option value="">Add a post…</option>
              {availableEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={disabled || !entryToAdd}
              className="admin-new-post-button"
            >
              Add
            </button>
          </>
        ) : null}
      </div>

      {localEntries.length > 0 ? (
        <ul className="mt-4">
          {localEntries.map((entry, index) => (
            <SeriesPostRow
              key={entry.id}
              entry={entry}
              index={index}
              customOrder={customOrder}
              canDrag={canDragPosts}
              isDragging={draggedEntryId === entry.id}
              isDragOver={dragOverEntryId === entry.id}
              isBusy={disabled}
              isFirst={index === 0}
              isLast={index === localEntries.length - 1}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOverEntryId(null)}
              onDrop={handleDrop}
              onDragEnd={clearDragState}
              onMove={handleMove}
              onRemove={onRemoveEntry}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--editor-muted)]">
          No posts in this series yet.
        </p>
      )}
    </details>
  );
}

type EditSeriesModalContentProps = {
  series: AdminSeriesDetail;
  entries: AdminEntryListItem[];
  onClose: () => void;
};

function EditSeriesModalContent({
  series,
  entries,
  onClose,
}: EditSeriesModalContentProps) {
  const router = useRouter();
  const { isEditorOpen, openCreate } = useEditor();
  const titleId = useId();
  const [title, setTitle] = useState(series.title);
  const [description, setDescription] = useState(series.description);
  const [customOrder, setCustomOrder] = useState(series.customOrder);
  const [localEntries, setLocalEntries] = useState(series.entries);
  const [seriesEntriesSnapshot, setSeriesEntriesSnapshot] = useState(
    series.entries,
  );
  const [deleteEntries, setDeleteEntries] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isBusy = isSaving || isDeleting;

  const hasInfoChanges =
    title !== series.title ||
    description !== series.description ||
    customOrder !== series.customOrder;

  const hasPostsChanges =
    seriesMembershipChanged(series.entries, localEntries) ||
    (customOrder && !seriesEntriesMatch(series.entries, localEntries));

  const hasChanges = hasInfoChanges || hasPostsChanges;

  const entryDatesById = useMemo(
    () => new Map(entries.map((entry) => [entry.id, entryDisplayDate(entry)])),
    [entries],
  );

  const displayedEntries = useMemo(() => {
    if (customOrder) {
      return localEntries;
    }

    return [...localEntries].sort((a, b) => {
      const aDate = entryDatesById.get(a.id)?.getTime() ?? 0;
      const bDate = entryDatesById.get(b.id)?.getTime() ?? 0;
      return bDate - aDate;
    });
  }, [entryDatesById, customOrder, localEntries]);

  if (series.entries !== seriesEntriesSnapshot) {
    setSeriesEntriesSnapshot(series.entries);
    setLocalEntries((previous) => {
      if (seriesEntriesMatch(series.entries, previous)) {
        return series.entries;
      }

      const localIds = new Set(previous.map((entry) => entry.id));
      const removedIds = new Set(
        series.entries
          .filter((entry) => !localIds.has(entry.id))
          .map((entry) => entry.id),
      );
      const addedFromServer = series.entries.filter(
        (entry) => !localIds.has(entry.id) && !removedIds.has(entry.id),
      );

      if (addedFromServer.length > 0) {
        return [...previous, ...addedFromServer];
      }

      return previous;
    });
  }

  const handleAddEntry = useCallback(
    (entryId: string) => {
      const entry = entries.find((item) => item.id === entryId);
      const ref = entry ? entryToSeriesEntry(entry) : null;

      if (!ref) {
        return;
      }

      setLocalEntries((previous) => [...previous, ref]);
    },
    [entries],
  );

  const handleRemoveEntry = useCallback((entryId: string) => {
    setLocalEntries((previous) =>
      previous.filter((entry) => entry.id !== entryId),
    );
  }, []);

  const handleReorderEntries = useCallback((entryIds: string[]) => {
    setLocalEntries((previous) => {
      const byId = new Map(previous.map((entry) => [entry.id, entry]));

      return entryIds
        .map((entryId) => byId.get(entryId))
        .filter((entry): entry is AdminSeriesEntry => entry !== undefined);
    });
  }, []);

  const handleNewPost = useCallback(() => {
    openCreate({
      series: {
        seriesId: series.id,
        title: title.trim() || series.title,
      },
    });
  }, [openCreate, series.id, series.title, title]);

  const saveAll = useCallback(async (): Promise<boolean> => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setSaveError("Title is required");
      return false;
    }

    if (!hasChanges) {
      return true;
    }

    setIsSaving(true);
    setSaveError(null);

    if (hasInfoChanges) {
      const result = await updateSeries({
        seriesId: series.id,
        title: trimmedTitle,
        description,
        customOrder,
      });

      if (!result.ok) {
        setIsSaving(false);
        setSaveError(result.error);
        return false;
      }
    }

    if (hasPostsChanges) {
      const savedIds = series.entries.map((entry) => entry.id);
      const localIds = localEntries.map((entry) => entry.id);
      const membershipChanged = seriesMembershipChanged(
        series.entries,
        localEntries,
      );
      const orderChanged = !seriesEntriesMatch(series.entries, localEntries);

      if (membershipChanged) {
        for (const entryId of savedIds) {
          if (!localIds.includes(entryId)) {
            const result = await removeEntryFromSeries({
              seriesId: series.id,
              entryId,
            });

            if (!result.ok) {
              setIsSaving(false);
              setSaveError(result.error);
              return false;
            }
          }
        }

        for (const entryId of localIds) {
          if (!savedIds.includes(entryId)) {
            const result = await addEntryToSeries({
              seriesId: series.id,
              entryId,
            });

            if (!result.ok) {
              setIsSaving(false);
              setSaveError(result.error);
              return false;
            }
          }
        }
      }

      if (customOrder && orderChanged) {
        const result = await reorderSeriesEntries({
          seriesId: series.id,
          entryIds: localIds,
        });

        if (!result.ok) {
          setIsSaving(false);
          setSaveError(result.error);
          return false;
        }
      }
    }

    setIsSaving(false);
    router.refresh();
    return true;
  }, [
    description,
    hasChanges,
    hasInfoChanges,
    hasPostsChanges,
    customOrder,
    localEntries,
    router,
    series.entries,
    series.id,
    title,
  ]);

  const handleClose = useCallback(async () => {
    if (isSaving || isDeleting || isDeleteOpen) {
      return;
    }

    if (!(await saveAll())) {
      return;
    }

    onClose();
  }, [isSaving, isDeleting, isDeleteOpen, onClose, saveAll]);

  const handleClearChanges = () => {
    setTitle(series.title);
    setDescription(series.description);
    setCustomOrder(series.customOrder);
    setLocalEntries(series.entries);
    setSeriesEntriesSnapshot(series.entries);
    setSaveError(null);
  };

  useBodyScrollLock(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditorOpen) {
        return;
      }

      if (event.key === "Escape" && !isBusy && !isDeleteOpen) {
        void handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBusy, isDeleteOpen, handleClose, isEditorOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteSeries({
      seriesId: series.id,
      deleteEntries,
    });

    setIsDeleting(false);

    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }

    setIsDeleteOpen(false);
    onClose();
    router.refresh();
  };

  return (
    <ModalPortal>
      <div className="entry-series-modal-root" role="presentation">
        <button
          type="button"
          className="entry-series-modal-backdrop"
          aria-label="Close edit series dialog"
          disabled={isBusy}
          onClick={() => void handleClose()}
        />

        <div
          className="entry-series-modal-panel entry-series-modal-panel-edit"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <header className="entry-series-modal-header">
            <h2 id={titleId} className="font-heading text-lg tracking-tight">
              Edit series
            </h2>
            <button
              type="button"
              onClick={() => void handleClose()}
              className="admin-editor-modal-close"
              aria-label="Close"
              disabled={isBusy}
            >
              <X size={20} strokeWidth={1.75} aria-hidden />
            </button>
          </header>

          <div className="entry-series-modal-body">
            <details className="admin-series-modal-section" open>
              <summary className="admin-series-modal-section-summary">
                <span>Info</span>
                <ChevronDown
                  className="admin-series-modal-section-chevron"
                  size={18}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </summary>

              <div className="admin-series-form mt-4">
                <div className="admin-series-form-field">
                  <label
                    htmlFor={`series-title-${series.id}`}
                    className="admin-series-form-label"
                  >
                    Title
                  </label>
                  <input
                    id={`series-title-${series.id}`}
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="admin-series-form-input"
                    required
                  />
                </div>

                <div className="admin-series-form-field">
                  <label
                    htmlFor={`series-description-${series.id}`}
                    className="admin-series-form-label"
                  >
                    Description
                  </label>
                  <textarea
                    id={`series-description-${series.id}`}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="admin-series-form-textarea"
                    rows={3}
                  />
                </div>

                <label className="admin-series-form-checkbox">
                  <input
                    type="checkbox"
                    checked={customOrder}
                    onChange={(event) => setCustomOrder(event.target.checked)}
                  />
                  Custom order
                </label>

                {saveError ? (
                  <p className="admin-editor-save-error">{saveError}</p>
                ) : null}

                {hasChanges ? (
                  <div className="admin-series-form-actions">
                    <button
                      type="button"
                      onClick={handleClearChanges}
                      disabled={isBusy}
                      className="admin-new-post-button"
                    >
                      Clear changes
                    </button>
                  </div>
                ) : null}
              </div>
            </details>

            <EditSeriesPostsSection
              localEntries={displayedEntries}
              customOrder={customOrder}
              entries={entries}
              disabled={isBusy}
              onAddEntry={handleAddEntry}
              onRemoveEntry={handleRemoveEntry}
              onReorderEntries={handleReorderEntries}
              onNewPost={handleNewPost}
            />

            <section className="admin-series-danger-zone">
              <h3 className="font-heading text-lg tracking-tight text-[var(--foreground)]">
                Delete series
              </h3>
              <label className="admin-series-form-checkbox mt-3">
                <input
                  type="checkbox"
                  checked={deleteEntries}
                  onChange={(event) => setDeleteEntries(event.target.checked)}
                />
                Also delete all posts in this series
              </label>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteOpen(true);
                }}
                className="admin-series-delete-button"
                disabled={isBusy}
              >
                Delete series
              </button>
            </section>
          </div>
        </div>

        <ConfirmModal
          isOpen={isDeleteOpen}
          title="Delete series?"
          message={
            deleteEntries
              ? `Delete “${series.title}” and all ${localEntries.length} post${localEntries.length === 1 ? "" : "s"} in it? This cannot be undone.`
              : `Delete “${series.title}”? Posts will stay published.`
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          tone="danger"
          isPending={isDeleting}
          error={deleteError}
          onClose={() => {
            if (!isDeleting) {
              setIsDeleteOpen(false);
              setDeleteError(null);
            }
          }}
          onConfirm={handleDelete}
        />
      </div>
    </ModalPortal>
  );
}

type EditSeriesModalProps = {
  series: AdminSeriesDetail | null;
  entries: AdminEntryListItem[];
  onClose: () => void;
};

function EditSeriesModal({ series, entries, onClose }: EditSeriesModalProps) {
  if (!series) {
    return null;
  }

  return (
    <EditSeriesModalContent
      key={series.id}
      series={series}
      entries={entries}
      onClose={onClose}
    />
  );
}

type AdminSeriesSectionProps = {
  series: AdminSeriesDetail[];
  entries: AdminEntryListItem[];
};

export function AdminSeriesSection({
  series,
  entries,
}: AdminSeriesSectionProps) {
  const router = useRouter();
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [isNewSeriesOpen, setIsNewSeriesOpen] = useState(false);
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);

  const editingSeries =
    editingSeriesId === null
      ? null
      : (series.find((item) => item.id === editingSeriesId) ?? null);

  const handleCreateSeries = async (input: {
    title: string;
    description: string;
    customOrder: boolean;
  }) => {
    setIsCreatingSeries(true);

    const result = await createSeries(input);

    setIsCreatingSeries(false);

    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }

    router.refresh();
    return { ok: true as const };
  };

  return (
    <section className="admin-dashboard-section">
      <h2 className="font-heading text-xl tracking-tight text-[var(--foreground)]">
        Series
      </h2>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setIsNewSeriesOpen(true)}
          className="admin-new-post-button"
        >
          New series
        </button>
      </div>

      {series.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--editor-muted)]">
          No series yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {series.map((item) => (
            <AdminSeriesCard
              key={item.id}
              series={item}
              onOpen={() => setEditingSeriesId(item.id)}
            />
          ))}
        </ul>
      )}

      <NewSeriesModal
        isOpen={isNewSeriesOpen}
        isPending={isCreatingSeries}
        onClose={() => setIsNewSeriesOpen(false)}
        onCreate={handleCreateSeries}
      />

      <EditSeriesModal
        series={editingSeries}
        entries={entries}
        onClose={() => setEditingSeriesId(null)}
      />
    </section>
  );
}
