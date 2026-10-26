"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Confirm } from "@/components/ui/confirm";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { deleteItem, reorderItems, saveItem, setItemVisible } from "@/lib/actions";
import type { CollectionName } from "@/lib/schemas";
import { AdminForm, type Values } from "./form";
import { COLLECTION_CONFIG } from "./config";

type Item = Values & { id: string; visible: boolean };

export function CollectionManager({ collection, items: initialItems }: { collection: CollectionName; items: Item[] }) {
  const { fields, blank, noun, describe } = COLLECTION_CONFIG[collection];
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [prevInitial, setPrevInitial] = useState(initialItems);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [pending, start] = useTransition();

  if (initialItems !== prevInitial) {
    setPrevInitial(initialItems);
    setItems(initialItems);
  }

  const strip = (it: Values) => {
    const out: Values = {};
    for (const k of Object.keys(blank)) out[k] = it[k] ?? blank[k];
    return out;
  };

  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    start(async () => {
      const r = await reorderItems(collection, next.map((x) => x.id));
      if (!r.ok) {
        toast.error(r.error);
        setItems(items);
      }
      router.refresh();
    });
  }

  function toggle(it: Item, visible: boolean) {
    setItems((list) => list.map((x) => (x.id === it.id ? { ...x, visible } : x)));
    start(async () => {
      const r = await setItemVisible(collection, it.id, visible);
      if (r.ok) toast.success(r.message);
      else {
        toast.error(r.error);
        setItems((list) => list.map((x) => (x.id === it.id ? { ...x, visible: !visible } : x)));
      }
      router.refresh();
    });
  }

  function remove(it: Item) {
    start(async () => {
      const r = await deleteItem(collection, it.id);
      if (r.ok) {
        toast.success(r.message);
        setItems((list) => list.filter((x) => x.id !== it.id));
      } else toast.error(r.error);
      router.refresh();
    });
  }

  const current = editing === "new" ? blank : editing ? strip(editing) : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {items.length} {items.length === 1 ? noun.toLowerCase() : `${noun.toLowerCase()}s`}. Use the arrows to change the order on your site.
        </p>
        <Button variant="solid" onClick={() => setEditing("new")}>
          <Plus /> Add {noun.toLowerCase()}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center">
          <p className="font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted">Add your first {noun.toLowerCase()} and it will appear on your site after you publish.</p>
          <Button className="mt-4" variant="outline" onClick={() => setEditing("new")}>
            <Plus /> Add {noun.toLowerCase()}
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface" aria-busy={pending}>
          {items.map((it, i) => {
            const d = describe(it);
            return (
              <li key={it.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-sunken/40 sm:flex-nowrap">
                <div className="flex shrink-0 flex-col">
                  <button type="button" className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30" aria-label={`Move ${d.title} up`} disabled={i === 0 || pending} onClick={() => move(i, -1)}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30" aria-label={`Move ${d.title} down`} disabled={i === items.length - 1 || pending} onClick={() => move(i, 1)}>
                    <ArrowDown className="size-4" />
                  </button>
                </div>
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditing(it)}>
                  <p className={`truncate font-medium ${it.visible ? "" : "text-muted line-through decoration-line-strong"}`}>{d.title || "Untitled"}</p>
                  {d.meta && <p className="truncate text-[13px] text-muted">{d.meta}</p>}
                </button>
                <div className="flex items-center gap-1">
                  <label className="mr-2 flex items-center gap-2 text-[13px] text-muted">
                    {it.visible ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
                    <span className="hidden sm:inline">{it.visible ? "Shown" : "Hidden"}</span>
                    <Switch checked={it.visible} onCheckedChange={(c) => toggle(it, c)} aria-label={`Show ${d.title} on the site`} disabled={pending} />
                  </label>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${d.title}`} onClick={() => setEditing(it)}>
                    <Pencil />
                  </Button>
                  <Confirm
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={`Delete ${d.title}`} disabled={pending}>
                        <Trash2 />
                      </Button>
                    }
                    title={`Delete this ${noun.toLowerCase()}?`}
                    description={`"${d.title}" will be removed from your draft. It stays on the live site until you publish. To only hide it, use the switch instead.`}
                    confirmLabel="Delete"
                    onConfirm={() => remove(it)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle className="text-lg font-semibold">{editing === "new" ? `Add ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}</DialogTitle>
          <DialogDescription className="mb-6 mt-1 text-sm text-muted">Changes are saved to your draft. Publish when you&apos;re ready.</DialogDescription>
          {current && (
            <AdminForm
              key={editing === "new" ? "new" : editing?.id}
              fields={fields}
              initial={current}
              stickyFooter
              allowPristine={editing === "new"}
              inDialog
              submitLabel={editing === "new" ? `Add ${noun.toLowerCase()}` : "Save draft"}
              onSave={(v) => saveItem(collection, editing === "new" ? null : (editing as Item).id, v)}
              onSaved={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
