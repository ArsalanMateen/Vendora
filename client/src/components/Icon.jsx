const paths = {
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
  edit: (
    <>
      <path d="m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
    </>
  ),
  shop: (
    <>
      <path d="M3 10V6l2-3h14l2 3v4M4 10v11h16V10M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 21v-7h6v7" />
    </>
  ),
  gavel: (
    <>
      <path d="m13 3 8 8-3 3-8-8Zm-5 5 8 8-3 3-8-8Zm3 5-8 8M14 21h8" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  bag: (
    <>
      <path d="M5 7h14l2 14H3ZM8 8V6a4 4 0 0 1 8 0v2" />
    </>
  ),
  box: (
    <>
      <path d="m12 3 9 5v9l-9 5-9-5V8ZM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  arrowUp: <path d="M6 18 18 6M6 6h12v12" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 3 1 3-1 3 1 2-3-1-3 2-2-2-3-3-1-1-3Z" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9a3 3 0 1 1 4 2.8c-1 .4-1 1.2-1 2.2M12 17h.01" />
    </>
  ),
  logout: <path d="M9 3H4v18h5M9 12h12m-4-4 4 4-4 4" />,
  sparkle: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4" />,
  check: <path d="m5 12 4 4L19 6" />,
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  filter: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="8" cy="7" r="2" fill="currentColor" />
      <circle cx="16" cy="17" r="2" fill="currentColor" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  shirt: <path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4a4 4 0 0 1-8 0Z" />,
  home: <path d="m3 10 9-7 9 7v11H3ZM9 21v-8h6v8" />,
  laptop: (
    <>
      <rect x="4" y="3" width="16" height="12" rx="2" />
      <path d="m4 15-2 5h20l-2-5" />
    </>
  ),
  leaf: <path d="M20 3S5 1 4 12c-.6 6 7 10 12 5 5-5 4-14 4-14ZM4 21 15 10" />,
  watch: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="m9 6 1-4h4l1 4m-6 12 1 4h4l1-4M12 9v3l2 1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <path d="m3 3 18 18M10.6 5.1A12 12 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-3.3 4.2M6.2 6.2A20 20 0 0 0 2 12s4 7 10 7a13 13 0 0 0 5.8-1.7" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.box}
    </svg>
  );
}
