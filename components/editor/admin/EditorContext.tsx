"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { saveEntry } from "@/app/actions/entries";
import {
  addEntryToSeries,
  createSeriesAndAddEntry,
} from "@/app/actions/series";
import { EditorModal } from "@/components/editor/admin/EditorModal";
import type { CollectionKey } from "@/lib/data/collections";
import type { EditorInitialValues } from "@/lib/editor/types";
import type { PendingSeriesAssignment } from "@/lib/editor/types/series";
import { shouldIgnoreViewToggle } from "@/lib/editor/lexical/editor-shortcuts";

type EditorSession = {
  mode: "create" | "edit";
  collection: CollectionKey;
  initialValues?: EditorInitialValues;
  entryId?: string;
  slug?: string;
};

export type OpenEditEntryInput = {
  id: string;
  collection: CollectionKey;
  slug: string;
  title: string;
  body: string;
};

type EditorContextValue = {
  isAdmin: boolean;
  showAdminUi: boolean;
  isEditorOpen: boolean;
  openCreate: (options?: {
    series?: { seriesId: string; title: string };
  }) => void;
  openEdit: (entry: OpenEditEntryInput) => void;
  setDefaultCollection: (collection: CollectionKey | null) => void;
  toggleAdminUi: () => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);

  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }

  return context;
}

type EditorProviderProps = {
  children: ReactNode;
  isAdmin: boolean;
};

async function applyPendingSeries(
  entryId: string,
  pendingSeries: PendingSeriesAssignment[],
) {
  for (const item of pendingSeries) {
    if (item.kind === "existing") {
      await addEntryToSeries({
        seriesId: item.seriesId,
        entryId,
      });
      continue;
    }

    await createSeriesAndAddEntry({
      title: item.title,
      description: item.description,
      customOrder: item.customOrder,
      entryId,
    });
  }
}

export function EditorProvider({
  children,
  isAdmin: admin,
}: EditorProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<EditorSession | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingSeries, setPendingSeries] = useState<PendingSeriesAssignment[]>(
    [],
  );
  const [defaultCollection, setDefaultCollection] =
    useState<CollectionKey | null>(null);
  const [showAdminUi, setShowAdminUi] = useState(true);

  const toggleAdminUi = useCallback(() => {
    setShowAdminUi((visible) => !visible);
  }, []);

  useEffect(() => {
    if (!admin) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "v" && event.key !== "V") {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (shouldIgnoreViewToggle(event.target)) {
        return;
      }

      event.preventDefault();
      toggleAdminUi();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [admin, toggleAdminUi]);

  const openCreate = useCallback(
    (options?: { series?: { seriesId: string; title: string } }) => {
      setSaveError(null);
      setPendingSeries(
        options?.series
          ? [
              {
                kind: "existing",
                seriesId: options.series.seriesId,
                title: options.series.title,
              },
            ]
          : [],
      );
      setSession({
        mode: "create",
        collection: defaultCollection ?? "blog",
        initialValues: { title: "", body: "" },
      });
    },
    [defaultCollection],
  );

  const openEdit = useCallback((entry: OpenEditEntryInput) => {
    setSaveError(null);
    setPendingSeries([]);
    setSession({
      mode: "edit",
      collection: entry.collection,
      entryId: entry.id,
      slug: entry.slug,
      initialValues: {
        title: entry.title,
        body: entry.body,
      },
    });
  }, []);

  const close = useCallback(() => {
    setSession(null);
    setSaveError(null);
    setPendingSeries([]);
  }, []);

  useEffect(() => {
    if (!showAdminUi && session !== null) {
      close();
    }
  }, [close, session, showAdminUi]);

  const handleSave = useCallback(
    async (payload: {
      title: string;
      body: string;
      collection: CollectionKey;
    }) => {
      if (!session) {
        return;
      }

      setSaveError(null);

      const result = await saveEntry({
        mode: session.mode,
        collection: payload.collection,
        title: payload.title,
        body: payload.body,
        entryId: session.entryId,
      });

      if (!result.ok) {
        setSaveError(result.error);
        return;
      }

      if (pendingSeries.length > 0) {
        await applyPendingSeries(result.entryId, pendingSeries);
      }

      const wasCreate = session.mode === "create";
      close();
      router.refresh();

      if (wasCreate) {
        router.push(`/${result.collection}/${result.slug}`);
      }
    },
    [close, pendingSeries, router, session],
  );

  const value = useMemo(
    () => ({
      isAdmin: admin,
      showAdminUi,
      isEditorOpen: session !== null,
      openCreate,
      openEdit,
      setDefaultCollection,
      toggleAdminUi,
    }),
    [admin, openCreate, openEdit, session, showAdminUi, toggleAdminUi],
  );

  return (
    <EditorContext.Provider value={value}>
      {children}

      {admin && showAdminUi && (
        <>
          <button
            type="button"
            onClick={() => openCreate()}
            className="admin-editor-fab"
            aria-label="New entry"
          >
            <Pencil size={20} strokeWidth={1.75} />
          </button>

          {session && (
            <EditorModal
              key={session.entryId ?? `create-${session.collection}`}
              isOpen
              mode={session.mode}
              collection={session.collection}
              entryId={session.entryId}
              initialValues={session.initialValues}
              saveError={saveError}
              pendingSeries={pendingSeries}
              onPendingSeriesChange={setPendingSeries}
              onSeriesMembershipChange={() => router.refresh()}
              onClose={close}
              onSave={handleSave}
            />
          )}
        </>
      )}
    </EditorContext.Provider>
  );
}
