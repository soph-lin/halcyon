"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { saveEntry } from "@/app/actions/entries";
import { EditorModal } from "@/components/editor/admin/EditorModal";
import type { CollectionKey } from "@/lib/collections";
import type { EditorInitialValues } from "@/lib/editor/types";

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
  openCreate: () => void;
  openEdit: (entry: OpenEditEntryInput) => void;
  setDefaultCollection: (collection: CollectionKey | null) => void;
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

export function EditorProvider({
  children,
  isAdmin: admin,
}: EditorProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<EditorSession | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [defaultCollection, setDefaultCollection] =
    useState<CollectionKey | null>(null);

  const openCreate = useCallback(() => {
    setSaveError(null);
    setSession({
      mode: "create",
      collection: defaultCollection ?? "blog",
      initialValues: { title: "", body: "" },
    });
  }, [defaultCollection]);

  const openEdit = useCallback((entry: OpenEditEntryInput) => {
    setSaveError(null);
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
  }, []);

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

      const wasCreate = session.mode === "create";
      close();
      router.refresh();

      if (wasCreate) {
        router.push(`/${result.collection}/${result.slug}`);
      }
    },
    [close, router, session],
  );

  const value = useMemo(
    () => ({
      isAdmin: admin,
      openCreate,
      openEdit,
      setDefaultCollection,
    }),
    [admin, openCreate, openEdit],
  );

  return (
    <EditorContext.Provider value={value}>
      {children}

      {admin && (
        <>
          <Link href="/admin/sign-out" className="admin-sign-out">
            Sign out
          </Link>

          <button
            type="button"
            onClick={openCreate}
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
              initialValues={session.initialValues}
              saveError={saveError}
              onClose={close}
              onSave={handleSave}
            />
          )}
        </>
      )}
    </EditorContext.Provider>
  );
}
