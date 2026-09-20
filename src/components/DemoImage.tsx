/**
 * DemoImage renders a plain <img> for placeholder/demo imagery.
 *
 * We use a standard <img> element (rather than next/image) because Phase 1 demo
 * images come from an external placeholder service; wiring next/image
 * remote-pattern config for throwaway demo images is not worth it. The
 * `@next/next/no-img-element` lint rule is disabled in this single component so
 * all consumers stay lint-clean.
 */
export function DemoImage({
  src,
  alt,
  className = '',
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
    />
  )
}
