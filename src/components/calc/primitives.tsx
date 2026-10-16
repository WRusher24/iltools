'use client';
import { useId, type ReactNode } from 'react';
import { formatILS, formatNumber, formatPct, NA } from '@/lib/format';
import type { FormApi } from './useCalc';
import { S } from './strings';

interface BaseFieldProps {
  form: FormApi;
  name: string;
  label: string;
  hint?: ReactNode;
  optional?: boolean;
}

function describedBy(id: string, hint: unknown, error: string | undefined): string | undefined {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ');
  return ids || undefined;
}

function Label({ id, label, optional }: { id: string; label: string; optional?: boolean }) {
  return (
    <label htmlFor={id}>
      {label}
      {optional ? <span className="field-hint"> ({S.optional})</span> : null}
    </label>
  );
}

function Messages({ id, hint, error }: { id: string; hint?: ReactNode; error?: string }) {
  return (
    <>
      {hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

export function NumberField({ form, name, label, hint, optional, unit, placeholder }: BaseFieldProps & { unit?: string; placeholder?: string }) {
  const id = useId();
  const error = form.errors[name];
  const value = form.raw[name];
  return (
    <div className="field">
      <Label id={id} label={label} optional={optional} />
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="input"
          value={typeof value === 'string' ? value : ''}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          onChange={(e) => form.set(name, e.target.value)}
          onBlur={() => form.blur(name)}
        />
        {unit ? <span className="field-hint shrink-0">{unit}</span> : null}
      </div>
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextField({ form, name, label, hint, optional, type = 'text', placeholder }: BaseFieldProps & { type?: 'text' | 'month' | 'date'; placeholder?: string }) {
  const id = useId();
  const error = form.errors[name];
  const value = form.raw[name];
  return (
    <div className="field">
      <Label id={id} label={label} optional={optional} />
      <input
        id={id}
        name={name}
        type={type}
        autoComplete="off"
        className="input"
        value={typeof value === 'string' ? value : ''}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(e) => form.set(name, e.target.value)}
        onBlur={() => form.blur(name)}
      />
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

export function SelectField({ form, name, label, hint, options }: BaseFieldProps & { options: { value: string; label: string }[] }) {
  const id = useId();
  const error = form.errors[name];
  const value = form.raw[name];
  return (
    <div className="field">
      <Label id={id} label={label} />
      <select
        id={id}
        name={name}
        className="input"
        value={typeof value === 'string' ? value : ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(e) => form.set(name, e.target.value)}
        onBlur={() => form.blur(name)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

export function RadioGroup({ form, name, label, hint, options }: BaseFieldProps & { options: { value: string; label: string }[] }) {
  const id = useId();
  const error = form.errors[name];
  const value = form.raw[name];
  return (
    <fieldset className="field" aria-describedby={describedBy(id, hint, error)} aria-invalid={error ? true : undefined}>
      <legend>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => form.set(name, o.value)} className="size-5" />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <Messages id={id} hint={hint} error={error} />
    </fieldset>
  );
}

export function CheckboxField({ form, name, label, hint }: BaseFieldProps) {
  const id = useId();
  const error = form.errors[name];
  return (
    <div className="field">
      <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-2" style={{ fontWeight: 500 }}>
        <input id={id} name={name} type="checkbox" className="size-5" checked={form.raw[name] === true} aria-describedby={describedBy(id, hint, error)} onChange={(e) => form.set(name, e.target.checked)} />
        <span>{label}</span>
      </label>
      <Messages id={id} hint={hint} error={error} />
    </div>
  );
}

/* ---------- output primitives ---------- */

export function Money({ v, decimals = true }: { v: number | null | undefined; decimals?: boolean }) {
  return <bdi>{formatILS(v, decimals)}</bdi>;
}
export function Pct({ v }: { v: number | null | undefined }) {
  return <bdi>{formatPct(v)}</bdi>;
}
export function Num({ v }: { v: number | null | undefined }) {
  return <bdi>{formatNumber(v)}</bdi>;
}
export function NaText() {
  return <span className="text-muted">{NA}</span>;
}

export function ResultList({ children }: { children: ReactNode }) {
  return <dl className="m-0">{children}</dl>;
}

export function ResultRow({ label, value, strong, note }: { label: ReactNode; value: ReactNode; strong?: boolean; note?: ReactNode }) {
  return (
    <div className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line py-2 ${strong ? 'text-lg font-bold text-brand' : ''}`}>
      <dt className="min-w-0">
        {label}
        {note ? <span className="field-hint block font-normal">{note}</span> : null}
      </dt>
      <dd className="m-0 font-semibold">{value}</dd>
    </div>
  );
}

export interface Column {
  header: ReactNode;
  numeric?: boolean;
}
export function ResultTable({ caption, columns, rows, footer }: { caption: string; columns: Column[]; rows: ReactNode[][]; footer?: ReactNode[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-start">
        <caption className="pb-2 text-start font-bold text-brand">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} scope="col" className="border border-line bg-surface-2 px-2 py-2 text-start">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                <td key={ci} className="border border-line px-2 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer ? (
          <tfoot>
            <tr>
              {footer.map((cell, ci) => (
                <td key={ci} className="border border-line bg-surface-2 px-2 py-2 font-bold">
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

export function LowConfidenceBadge() {
  return (
    <p className="badge" role="note">
      {S.lowConfidence}
    </p>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <p className={`m-0 rounded-lg border border-line p-3 ${tone === 'warn' ? 'bg-warn-soft' : 'bg-surface-2'}`} role="note">
      {children}
    </p>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-2">
      <h3 className="m-0 text-lg">{title}</h3>
      {children}
    </section>
  );
}
