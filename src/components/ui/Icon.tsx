import type { ReactElement, SVGProps } from 'react'

export type IconName =
  | 'building'
  | 'desk'
  | 'meeting'
  | 'document'
  | 'scale'
  | 'check'
  | 'arrow-right'
  | 'map-pin'
  | 'phone'
  | 'mail'
  | 'whatsapp'
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'clock'
  | 'globe'
  | 'calendar'
  | 'users'
  | 'handshake'

const paths: Record<IconName, ReactElement> = {
  building: (
    <>
      <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 9h3a1 1 0 0 1 1 1v11" />
      <path d="M8 8h2m-2 4h2m-2 4h2" />
    </>
  ),
  desk: (
    <>
      <path d="M2 9h20M4 9v10m16-10v10M8 13h4v4H8z" />
      <path d="M6 9V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4" />
    </>
  ),
  meeting: (
    <>
      <circle cx="8" cy="7" r="2.5" />
      <circle cx="16" cy="7" r="2.5" />
      <path d="M3.5 20a4.5 4.5 0 0 1 9 0m-1-6.2a4.5 4.5 0 0 1 8 2.7V20" />
    </>
  ),
  document: (
    <>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5M10 13h5m-5 4h5" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18m-7 0h14M12 6l6 3-2.2 5.5a3.8 3.8 0 0 1-7.6 0L6 9l6-3z" transform="scale(0.92) translate(1 1)" />
    </>
  ),
  check: <path d="m5 13 4 4L19 7" />,
  'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
  'map-pin': (
    <>
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" />
      <path d="M9 8.5c-.5 2.5 3.5 6.5 6 6l.5-2-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4m8-4v4M3 10h18" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20a5 5 0 0 1 10 0m1-12a3 3 0 1 1 2 5.2M17 15a5 5 0 0 1 3 5" />
    </>
  ),
  handshake: (
    <>
      <path d="m2 13 5-5 3.5 3.5a1.5 1.5 0 0 0 2.12 0 1.5 1.5 0 0 0 0-2.12L9 6.75" />
      <path d="m22 13-5-5-3.5 3.5a1.5 1.5 0 0 1-2.12 0" />
      <path d="M2 13v3a2 2 0 0 0 2 2h1m17-5v3a2 2 0 0 1-2 2h-1M7 13l3.5 3.5a1.5 1.5 0 0 0 2.12 0l.38-.38" />
    </>
  ),
}

type IconProps = SVGProps<SVGSVGElement> & { name: IconName }

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
