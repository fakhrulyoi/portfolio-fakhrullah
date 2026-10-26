"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { storageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/actions";
import { uploadImage, type ImageVariant } from "./uploads";
import { TemplateThumb } from "./template-thumb";

type Base = { name: string; label: string; help?: string; half?: boolean; showIf?: (v: Values) => boolean };
export type Field =
  | (Base & { type: "text" | "email" | "url" | "month" | "password"; placeholder?: string; maxLength?: number; required?: boolean })
  | (Base & { type: "textarea"; rows?: number; maxLength?: number; placeholder?: string })
  | (Base & { type: "toggle" })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "color" })
  | (Base & { type: "choice"; options: { value: string; label: string; description?: string }[]; thumbs?: boolean })
  | (Base & { type: "list"; itemLabel: string; multiline?: boolean; maxLength?: number })
  | (Base & { type: "tags"; placeholder?: string })
  | (Base & { type: "links" })
  | (Base & { type: "image"; folder: string; variant: ImageVariant; aspect?: string })
  | { type: "heading"; name: string; label: string; help?: string; showIf?: (v: Values) => boolean };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Values = Record<string, any>;

export function getPath(obj: Values, path: string) {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Values)[k] : undefined), obj);
}
function setPath(obj: Values, path: string, value: unknown): Values {
  const [k, ...rest] = path.split(".");
  if (!rest.length) return { ...obj, [k]: value };
  return { ...obj, [k]: setPath((obj[k] as Values) ?? {}, rest.join("."), value) };
}

function Help({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="text-[13px] leading-relaxed text-muted">
      {children}
    </p>
  );
}
function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="text-[13px] text-danger">
      {msg}
    </p>
  );
}

function ListEditor({
  value,
  onChange,
  itemLabel,
  multiline,
  maxLength,
  labelId,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  itemLabel: string;
  multiline?: boolean;
  maxLength?: number;
  labelId: string;
}) {
  const refs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  useEffect(() => {
    if (focusIdx !== null) refs.current[focusIdx]?.focus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusIdx(null);
  }, [focusIdx]);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2" role="group" aria-labelledby={labelId}>
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          {multiline ? (
            <Textarea
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={item}
              rows={2}
              maxLength={maxLength}
              aria-label={`${itemLabel} ${i + 1}`}
              onChange={(e) => onChange(value.map((v, k) => (k === i ? e.target.value : v)))}
              className="min-h-0 text-sm"
            />
          ) : (
            <Input
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={item}
              maxLength={maxLength}
              aria-label={`${itemLabel} ${i + 1}`}
              onChange={(e) => onChange(value.map((v, k) => (k === i ? e.target.value : v)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const next = [...value];
                  next.splice(i + 1, 0, "");
                  onChange(next);
                  setFocusIdx(i + 1);
                }
              }}
              className="text-sm"
            />
          )}
          <div className="flex shrink-0">
            <Button type="button" variant="ghost" size="icon" aria-label={`Move ${itemLabel} ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label={`Move ${itemLabel} ${i + 1} down`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${itemLabel} ${i + 1}`} onClick={() => onChange(value.filter((_, k) => k !== i))}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          onChange([...value, ""]);
          setFocusIdx(value.length);
        }}
      >
        <Plus /> Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}

function TagInput({ value, onChange, placeholder, id }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; id: string }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft("");
  };
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2 py-1.5 focus-within:border-accent">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-sunken px-2 py-0.5 text-[13px]">
          {t}
          <button type="button" aria-label={`Remove ${t}`} className="text-muted hover:text-ink" onClick={() => onChange(value.filter((v) => v !== t))}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={value.length ? "" : placeholder ?? "Type and press Enter"}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => add(draft)}
        className="min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted/80"
      />
    </div>
  );
}

function LinksEditor({ value, onChange, errors, base }: { value: { label: string; url: string }[]; onChange: (v: { label: string; url: string }[]) => void; errors: Record<string, string>; base: string }) {
  return (
    <div className="space-y-2">
      {value.map((l, i) => (
        <div key={i} className="grid gap-1.5 sm:grid-cols-[10rem_1fr_auto]">
          <Input placeholder="Label, e.g. Portfolio" aria-label={`Link ${i + 1} label`} value={l.label} maxLength={40} onChange={(e) => onChange(value.map((v, k) => (k === i ? { ...v, label: e.target.value } : v)))} />
          <Input placeholder="https://" aria-label={`Link ${i + 1} URL`} value={l.url} type="url" onChange={(e) => onChange(value.map((v, k) => (k === i ? { ...v, url: e.target.value } : v)))} aria-invalid={Boolean(errors[`${base}.${i}.url`])} />
          <Button type="button" variant="ghost" size="icon" aria-label={`Remove link ${i + 1}`} onClick={() => onChange(value.filter((_, k) => k !== i))}>
            <Trash2 />
          </Button>
          {(errors[`${base}.${i}.url`] || errors[`${base}.${i}.label`]) && (
            <p className="text-[13px] text-danger sm:col-span-3">{errors[`${base}.${i}.url`] || errors[`${base}.${i}.label`]}</p>
          )}
        </div>
      ))}
      {value.length < 6 && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { label: "", url: "" }])}>
          <Plus /> Add link
        </Button>
      )}
    </div>
  );
}

function ImageField({ value, onChange, folder, variant, aspect, id }: { value: string; onChange: (v: string) => void; folder: string; variant: ImageVariant; aspect?: string; id: string }) {
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const url = value ? storageUrl(value) : "";
  async function onFile(f?: File) {
    if (!f) return;
    setBusy(true);
    try {
      const path = await uploadImage(f, folder, variant);
      onChange(path);
      toast.success("Image uploaded. Save the form to keep it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden border border-line bg-sunken text-muted",
          variant === "photo" ? "size-24 rounded-full" : cn("w-48 rounded-lg", aspect ?? "aspect-[5/3]"),
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="size-6" aria-hidden />}
      </div>
      <div className="flex flex-col gap-2">
        <input id={id} ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {busy ? "Uploading" : value ? "Replace image" : "Upload image"}
        </Button>
        {value && !busy && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remove image
          </Button>
        )}
        <p className="text-[12px] text-muted">JPG, PNG, WebP or AVIF, up to 15 MB. Resized automatically.</p>
      </div>
    </div>
  );
}

export function FieldControl({ field, values, setValue, errors }: { field: Exclude<Field, { type: "heading" }>; values: Values; setValue: (name: string, v: unknown) => void; errors: Record<string, string> }) {
  const uid = useId();
  const id = `${uid}-${field.name}`;
  const err = errors[field.name];
  const v = getPath(values, field.name);
  const describedBy = [field.help ? `${id}-help` : "", err ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-invalid": err ? true : undefined, "aria-describedby": describedBy };

  if (field.type === "toggle") {
    return (
      <div className={cn("flex items-start justify-between gap-6 rounded-xl border border-line bg-surface px-4 py-3", !field.half && "sm:col-span-2")}>
        <div className="space-y-0.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Help id={`${id}-help`}>{field.help}</Help>
        </div>
        <Switch id={id} checked={Boolean(v)} onCheckedChange={(c) => setValue(field.name, c)} />
      </div>
    );
  }

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = <Textarea {...common} rows={field.rows ?? 4} maxLength={field.maxLength} placeholder={field.placeholder} value={String(v ?? "")} onChange={(e) => setValue(field.name, e.target.value)} />;
      break;
    case "select":
      control = (
        <Select {...common} value={String(v ?? "")} onChange={(e) => setValue(field.name, e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      );
      break;
    case "color":
      control = (
        <div className="flex items-center gap-3">
          <input type="color" aria-label={`${field.label} picker`} value={/^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : "#2450d8"} onChange={(e) => setValue(field.name, e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line-strong bg-surface p-1" />
          <Input {...common} value={String(v ?? "")} onChange={(e) => setValue(field.name, e.target.value)} className="w-32 font-mono" maxLength={7} />
          <div className="flex gap-1.5">
            {["#2450D8", "#0F766E", "#7C3AED", "#B45309", "#18181B"].map((c) => (
              <button key={c} type="button" aria-label={`Use ${c}`} onClick={() => setValue(field.name, c)} className="size-7 rounded-full border border-line" style={{ background: c }} />
            ))}
          </div>
        </div>
      );
      break;
    case "choice":
      control = (
        <div role="radiogroup" aria-labelledby={`${id}-label`} className="grid gap-3 sm:grid-cols-3">
          {field.options.map((o) => {
            const checked = v === o.value;
            return (
              <label
                key={o.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-3 rounded-xl border bg-surface p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent",
                  checked ? "border-accent shadow-[0_0_0_1px_var(--accent)]" : "border-line hover:border-line-strong",
                )}
              >
                <input type="radio" name={id} value={o.value} checked={checked} onChange={() => setValue(field.name, o.value)} className="sr-only" />
                {field.thumbs && <TemplateThumb id={o.value} />}
                <span>
                  <span className="block text-sm font-medium">{o.label}</span>
                  {o.description && <span className="mt-0.5 block text-[12px] leading-snug text-muted">{o.description}</span>}
                </span>
              </label>
            );
          })}
        </div>
      );
      break;
    case "list":
      control = <ListEditor labelId={`${id}-label`} value={Array.isArray(v) ? v : []} onChange={(x) => setValue(field.name, x)} itemLabel={field.itemLabel} multiline={field.multiline} maxLength={field.maxLength} />;
      break;
    case "tags":
      control = <TagInput id={id} value={Array.isArray(v) ? v : []} onChange={(x) => setValue(field.name, x)} placeholder={field.placeholder} />;
      break;
    case "links":
      control = <LinksEditor base={field.name} errors={errors} value={Array.isArray(v) ? v : []} onChange={(x) => setValue(field.name, x)} />;
      break;
    case "image":
      control = <ImageField id={id} value={String(v ?? "")} onChange={(x) => setValue(field.name, x)} folder={field.folder} variant={field.variant} aspect={field.aspect} />;
      break;
    default:
      control = (
        <Input
          {...common}
          type={field.type}
          autoComplete={field.type === "password" ? "new-password" : undefined}
          value={String(v ?? "")}
          maxLength={"maxLength" in field ? field.maxLength : undefined}
          placeholder={"placeholder" in field ? field.placeholder : undefined}
          onChange={(e) => setValue(field.name, e.target.value)}
        />
      );
  }
  const fullWidth = !field.half || ["list", "links", "textarea", "image", "tags", "choice"].includes(field.type);
  return (
    <div className={cn("space-y-1.5", fullWidth && "sm:col-span-2")}>
      <Label id={`${id}-label`} htmlFor={["list", "links"].includes(field.type) ? undefined : id}>
        {field.label}
        {"required" in field && field.required && <span className="text-danger"> *</span>}
      </Label>
      {control}
      <Help id={`${id}-help`}>{field.help}</Help>
      <FieldError id={`${id}-err`} msg={err} />
    </div>
  );
}

/** Generic "edit and save as draft" form. */
export function AdminForm({
  fields,
  initial,
  onSave,
  submitLabel = "Save draft",
  onSaved,
  secondary,
  stickyFooter = true,
  allowPristine = false,
  inDialog = false,
}: {
  fields: Field[];
  initial: Values;
  onSave: (values: Values) => Promise<ActionResult<unknown>>;
  submitLabel?: string;
  onSaved?: (values: Values) => void;
  secondary?: React.ReactNode;
  stickyFooter?: boolean;
  allowPristine?: boolean;
  inDialog?: boolean;
}) {
  const [values, setValues] = useState<Values>(initial);
  const [saved, setSaved] = useState<string>(() => JSON.stringify(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(values) !== saved, [values, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const setValue = (name: string, v: unknown) => setValues((prev) => setPath(prev, name, v));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await onSave(values);
      if (res.ok) {
        setErrors({});
        setSaved(JSON.stringify(values));
        toast.success(res.message ?? "Saved.");
        onSaved?.(values);
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        const first = Object.keys(res.fieldErrors ?? {})[0];
        if (first) document.querySelector<HTMLElement>(`[aria-invalid="true"]`)?.focus();
      }
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => {
          if (f.showIf && !f.showIf(values)) return null;
          if (f.type === "heading")
            return (
              <div key={f.name} className="border-t border-line pt-6 first:border-0 first:pt-0 sm:col-span-2">
                <h3 className="font-semibold">{f.label}</h3>
                {f.help && <p className="mt-1 text-[13px] text-muted">{f.help}</p>}
              </div>
            );
          return <FieldControl key={f.name} field={f} values={values} setValue={setValue} errors={errors} />;
        })}
      </div>
      <div className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4", stickyFooter && !inDialog && "sticky bottom-0 -mx-1 bg-paper/95 px-1 pb-4 backdrop-blur",
          inDialog && "sticky -bottom-6 -mx-6 -mb-6 bg-surface px-6 pb-6")}>
        <p className="text-[13px] text-muted" aria-live="polite">
          {dirty ? "You have unsaved edits." : "All edits saved to your draft."}
        </p>
        <div className="flex gap-2">
          {secondary}
          <Button type="submit" variant="solid" disabled={saving || (!dirty && !allowPristine)}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Saving" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
