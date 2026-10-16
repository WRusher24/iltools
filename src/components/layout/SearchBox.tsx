export function SearchBox({ label, placeholder }: { label: string; placeholder: string }) {
  // Plain GET form → works without JS; /search hydrates the client-side Fuse index.
  return (
    <form action="/search" method="get" role="search" className="flex items-center gap-1">
      <label htmlFor="site-search" className="sr-only">{label}</label>
      <input id="site-search" name="q" type="search" placeholder={placeholder} className="input w-36 md:w-52" autoComplete="off" />
      <button type="submit" className="btn btn-primary" aria-label={label}><span aria-hidden>🔍</span></button>
    </form>
  );
}
