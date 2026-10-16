export function JsonLd({ data }: { data: (Record<string, unknown> | null)[] }) {
  return (
    <>
      {data.filter(Boolean).map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // `<` is escaped so content can never close the script element
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
