export function JsonLd({ data }: { data: Record<string, unknown> | ReadonlyArray<Record<string, unknown>> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
