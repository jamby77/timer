import type { SVGProps } from 'react'

export default function SkipIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      {...props}
    >
      <path d="m6 18 8.5-6L6 6zM16 6v12h2V6z"></path>
    </svg>
  )
}
