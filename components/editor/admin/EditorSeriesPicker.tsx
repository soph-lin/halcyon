"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  addEntryToSeries,
  createSeriesAndAddEntry,
  getEntrySeriesMembershipsForEditor,
  listSeriesOptionsForEditor,
  removeEntryFromSeries,
} from "@/app/actions/series";
import { NewSeriesModal } from "@/components/editor/admin/NewSeriesModal";
import type {
  EditorSeriesMembership,
  PendingSeriesAssignment,
  SeriesOption,
} from "@/lib/editor/types/series";

const NEW_SERIES_VALUE = "__new__";

type UseEditorSeriesPickerOptions = {
  entryId?: string;
  pendingSeries: PendingSeriesAssignment[];
  onPendingSeriesChange: (items: PendingSeriesAssignment[]) => void;
  onMembershipChange: () => void;
};

export function useEditorSeriesPicker({
  entryId,
  pendingSeries,
  onPendingSeriesChange,
  onMembershipChange,
}: UseEditorSeriesPickerOptions) {
  const [allSeries, setAllSeries] = useState<SeriesOption[]>([]);
  const [memberships, setMemberships] = useState<EditorSeriesMembership[]>([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [isNewSeriesModalOpen, setIsNewSeriesModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const loadSeriesState = async () => {
    const options = await listSeriesOptionsForEditor();
    setAllSeries(options);

    if (entryId) {
      const current = await getEntrySeriesMembershipsForEditor(entryId);
      setMemberships(current);
    } else {
      setMemberships([]);
    }
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const options = await listSeriesOptionsForEditor();
      if (cancelled) {
        return;
      }

      setAllSeries(options);

      if (entryId) {
        const current = await getEntrySeriesMembershipsForEditor(entryId);
        if (cancelled) {
          return;
        }
        setMemberships(current);
      } else {
        setMemberships([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entryId]);

  const assignedSeriesIds = new Set([
    ...memberships.map((membership) => membership.seriesId),
    ...pendingSeries
      .filter((item) => item.kind === "existing")
      .map((item) => item.seriesId),
  ]);

  const availableSeries = allSeries.filter(
    (series) => !assignedSeriesIds.has(series.id),
  );

  const handleSelectChange = async (value: string) => {
    setSelectedValue(value);
    setError(null);

    if (!value) {
      return;
    }

    if (value === NEW_SERIES_VALUE) {
      setIsNewSeriesModalOpen(true);
      setSelectedValue("");
      return;
    }

    const series = allSeries.find((item) => item.id === value);
    if (!series) {
      setSelectedValue("");
      return;
    }

    setIsPending(true);

    if (entryId) {
      const result = await addEntryToSeries({
        seriesId: series.id,
        entryId,
      });

      setIsPending(false);
      setSelectedValue("");

      if (!result.ok) {
        setError(result.error);
        return;
      }

      await loadSeriesState();
      onMembershipChange();
      return;
    }

    onPendingSeriesChange([
      ...pendingSeries,
      {
        kind: "existing",
        seriesId: series.id,
        title: series.title,
      },
    ]);
    setIsPending(false);
    setSelectedValue("");
  };

  const handleCreateSeries = async (input: {
    title: string;
    description: string;
    customOrder: boolean;
  }): Promise<{ ok: true } | { ok: false; error: string }> => {
    setError(null);
    setIsPending(true);

    if (entryId) {
      const result = await createSeriesAndAddEntry({
        title: input.title,
        description: input.description,
        customOrder: input.customOrder,
        entryId,
      });

      setIsPending(false);

      if (!result.ok) {
        setError(result.error);
        return { ok: false, error: result.error };
      }

      await loadSeriesState();
      onMembershipChange();
      return { ok: true };
    }

    onPendingSeriesChange([
      ...pendingSeries,
      {
        kind: "new",
        title: input.title,
        description: input.description,
        customOrder: input.customOrder,
      },
    ]);
    setIsPending(false);
    return { ok: true };
  };

  const handleRemoveMembership = async (seriesId: string) => {
    if (!entryId) {
      return;
    }

    setError(null);
    setIsPending(true);

    const result = await removeEntryFromSeries({ seriesId, entryId });

    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await loadSeriesState();
    onMembershipChange();
  };

  const handleRemovePending = (index: number) => {
    onPendingSeriesChange(pendingSeries.filter((_, i) => i !== index));
  };

  return {
    entryId,
    pendingSeries,
    selectedValue,
    isNewSeriesModalOpen,
    error,
    isPending,
    memberships,
    availableSeries,
    handleSelectChange,
    handleCreateSeries,
    handleRemoveMembership,
    handleRemovePending,
    closeNewSeriesModal: () => setIsNewSeriesModalOpen(false),
  };
}

type EditorSeriesPickerProps = UseEditorSeriesPickerOptions;

export function EditorSeriesSelect({
  picker,
}: {
  picker: ReturnType<typeof useEditorSeriesPicker>;
}) {
  return (
    <label className="admin-editor-meta-field">
      <span>series</span>
      <select
        value={picker.selectedValue}
        onChange={(event) => void picker.handleSelectChange(event.target.value)}
        disabled={picker.isPending}
        className="admin-editor-collection-select"
      >
        <option value="">Choose series…</option>
        <option value={NEW_SERIES_VALUE}>New series…</option>
        {picker.availableSeries.map((series) => (
          <option key={series.id} value={series.id}>
            {series.title}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EditorSeriesExtras({
  picker,
}: {
  picker: ReturnType<typeof useEditorSeriesPicker>;
}) {
  const hasExtras =
    picker.error ||
    picker.memberships.length > 0 ||
    picker.pendingSeries.length > 0;

  if (!hasExtras) {
    return null;
  }

  return (
    <div className="admin-editor-series-extras">
      {picker.error && (
        <p className="admin-editor-series-error" role="alert">
          {picker.error}
        </p>
      )}

      {(picker.memberships.length > 0 || picker.pendingSeries.length > 0) && (
        <ul className="entry-series-chip-list">
          {picker.memberships.map((membership) => (
            <li key={membership.seriesId} className="entry-series-chip">
              <span>{membership.title}</span>
              {picker.entryId ? (
                <button
                  type="button"
                  className="entry-series-chip-remove"
                  disabled={picker.isPending}
                  onClick={() =>
                    void picker.handleRemoveMembership(membership.seriesId)
                  }
                  aria-label={`Remove from ${membership.title}`}
                >
                  <X size={14} strokeWidth={1.75} aria-hidden />
                </button>
              ) : null}
            </li>
          ))}
          {picker.pendingSeries.map((item, index) => (
            <li
              key={`pending-${index}`}
              className="entry-series-chip entry-series-chip-pending"
            >
              <span>
                {item.title}
                {!picker.entryId ? " (on save)" : ""}
              </span>
              <button
                type="button"
                className="entry-series-chip-remove"
                disabled={picker.isPending}
                onClick={() => picker.handleRemovePending(index)}
                aria-label="Remove pending series"
              >
                <X size={14} strokeWidth={1.75} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EditorSeriesModals({
  picker,
}: {
  picker: ReturnType<typeof useEditorSeriesPicker>;
}) {
  return (
    <NewSeriesModal
      isOpen={picker.isNewSeriesModalOpen}
      isPending={picker.isPending}
      onClose={picker.closeNewSeriesModal}
      onCreate={picker.handleCreateSeries}
    />
  );
}

export function EditorSeriesPicker(props: EditorSeriesPickerProps) {
  const picker = useEditorSeriesPicker(props);

  return (
    <>
      <EditorSeriesSelect picker={picker} />
      <EditorSeriesExtras picker={picker} />
      <EditorSeriesModals picker={picker} />
    </>
  );
}
