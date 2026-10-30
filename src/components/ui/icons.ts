/**
 * Custom icon set. Every icon is drawn on a 24×24 grid with a 1.5 stroke,
 * round caps and joins, and no fills — the same pen as the illustrations.
 * The markup is static and authored here, so it is safe to inline.
 *
 * `directional` icons point "forward" and are mirrored in RTL layouts.
 */
interface IconDefinition {
  readonly body: string;
  readonly directional?: boolean;
}

const icons = {
  // Incidents & data — one pen: 1.5 stroke, 2px corner radius, round joins
  fileLock: {
    body: '<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M13.5 3L19 8.5V11"/><path d="M13.5 3v5.5H19"/><rect x="13" y="15" width="8" height="6" rx="1.5"/><path d="M15 15v-1.5a2 2 0 0 1 4 0V15"/>',
  },
  fileRestore: {
    body: '<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M13.5 3L19 8.5V10"/><path d="M13.5 3v5.5H19"/><path d="M14 17.5a3.5 3.5 0 1 0 1-2.45"/><path d="M14.5 13v2.5H17"/>',
  },
  fileCheck: {
    body: '<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M13.5 3v5.5H19"/><path d="M9 14.5l2 2 4-4"/>',
  },
  timeline: {
    body: '<path d="M3 12h18"/><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 10V6h5M18 14v4h-5"/>',
  },
  layers: {
    body: '<path d="M12 3l9 4.5-9 4.5-9-4.5z"/><path d="M3 12l9 4.5 9-4.5"/><path d="M3 16.5L12 21l9-4.5"/>',
  },
  isolate: {
    body: '<rect x="3" y="4" width="8" height="6" rx="2"/><rect x="13" y="14" width="8" height="6" rx="2"/><path d="M7 10v2.5h3.5M17 14v-2.5h-3.5"/><path d="M12.5 9.5l-1 5"/>',
  },
  report: {
    body: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3"/><path d="M8.5 10h7M8.5 13.5h7M8.5 17h4"/>',
  },
  handshake: {
    body: '<path d="M8 4h8a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2z"/><path d="M9 9h6M9 12.5h4"/><path d="M13.5 15.5l1.25 1.25L17 14.5"/>',
  },
  mailbox: {
    body: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  },
  database: {
    body: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.75"/><path d="M4.5 5.5v13c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75v-13"/><path d="M4.5 12c0 1.5 3.4 2.75 7.5 2.75s7.5-1.25 7.5-2.75"/>',
  },
  server: {
    body: '<rect x="3.5" y="3.5" width="17" height="7" rx="2"/><rect x="3.5" y="13.5" width="17" height="7" rx="2"/><path d="M7 7h4M7 17h4"/><circle cx="16.5" cy="7" r=".5"/><circle cx="16.5" cy="17" r=".5"/>',
  },
  cloud: {
    body: '<path d="M7 18.5h10.5a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.4 9.1 4.75 4.75 0 0 0 7 18.5z"/><path d="M9.5 14h5"/>',
  },
  // Sectors
  person: {
    body: '<circle cx="12" cy="8" r="3.75"/><path d="M4.75 20.5c.6-3.9 3.5-6.25 7.25-6.25s6.65 2.35 7.25 6.25"/>',
  },
  shop: {
    body: '<path d="M3.5 9.5l1.5-5.75h14l1.5 5.75"/><path d="M3.5 9.5a2.75 2.75 0 0 0 5.5 0 2.75 2.75 0 0 0 6 0 2.75 2.75 0 0 0 5.5 0"/><path d="M5 12v8.25h14V12"/><path d="M10 20.25V15h4v5.25"/>',
  },
  building: {
    body: '<path d="M4.5 20.75V4.25A1.5 1.5 0 0 1 6 2.75h8a1.5 1.5 0 0 1 1.5 1.5v16.5"/><path d="M15.5 9.25H18a1.5 1.5 0 0 1 1.5 1.5v10"/><path d="M3 20.75h18"/><path d="M8 7h4M8 10.5h4M8 14h4"/><path d="M10 20.75v-3.25"/>',
  },
  health: {
    body: '<rect x="3.25" y="3.25" width="17.5" height="17.5" rx="2"/><path d="M12 7.5v9M7.5 12h9"/>',
  },
  scale: {
    body: '<path d="M12 3v18M7.5 21h9M4.5 6.5h15"/><path d="M6.5 6.5L3.75 13a2.75 2.75 0 0 0 5.5 0z"/><path d="M17.5 6.5L14.75 13a2.75 2.75 0 0 0 5.5 0z"/>',
  },
  ledger: {
    body: '<rect x="4.5" y="2.75" width="15" height="18.5" rx="1.5"/><path d="M8 7.5h8M8 11h8M8 14.5h4"/><path d="M14.5 17.5l1.25 1.25 2.25-2.5"/>',
  },
  book: {
    body: '<path d="M12 6.25C10.25 4.6 7.5 4 3.75 4.25v14.5c3.75-.25 6.5.35 8.25 2 1.75-1.65 4.5-2.25 8.25-2V4.25C16.5 4 13.75 4.6 12 6.25z"/><path d="M12 6.25v14.5"/>',
  },
  seal: {
    body: '<circle cx="12" cy="9.5" r="6.25"/><circle cx="12" cy="9.5" r="3"/><path d="M8.25 14.5L6.5 21l5.5-2.5 5.5 2.5-1.75-6.5"/>',
  },
  // Trust & process
  lock: {
    body: '<rect x="4.75" y="10.25" width="14.5" height="10.5" rx="2"/><path d="M8 10.25V7.5a4 4 0 0 1 8 0v2.75"/><path d="M12 14.5v2.5"/>',
  },
  search: {
    body: '<circle cx="10.5" cy="10.5" r="6.25"/><path d="M15 15l5.5 5.5"/>',
  },
  check: { body: '<path d="M4.5 12.5l4.75 4.75L19.5 7"/>' },
  alert: {
    body: '<path d="M12 3.25L2.75 19.75h18.5z"/><path d="M12 9.5v4.75"/><circle cx="12" cy="17" r=".5"/>',
  },
  unplug: {
    body: '<path d="M9 3v4M15 3v4"/><path d="M6.5 7h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M12 15.5V21"/><path d="M3 3l18 18"/>',
  },
  noEntry: {
    body: '<circle cx="12" cy="12" r="8.75"/><path d="M8 12h8"/>',
  },
  clock: { body: '<circle cx="12" cy="12" r="8.75"/><path d="M12 7v5l3.25 2"/>' },
  // Contact
  call: {
    body: '<path d="M5.1 3.25h3.4l1.6 4.3-2.05 1.4a10.6 10.6 0 0 0 5 5l1.4-2.05 4.3 1.6v3.4a2 2 0 0 1-2.2 2A16 16 0 0 1 3.1 5.45a2 2 0 0 1 2-2.2z"/>',
  },
  whatsapp: {
    body: '<path d="M3.5 20.5l1.2-4.25A8.6 8.6 0 1 1 8 19.4z"/><path d="M9 8.25c0 3.5 2.75 6.75 6.5 6.75l.75-1.75-2-.9-.9.9a4.6 4.6 0 0 1-2.85-2.85l.9-.9-.9-2H9.75z"/>',
  },
  mail: {
    body: '<rect x="2.75" y="5" width="18.5" height="14" rx="1.5"/><path d="M3.25 6l8.75 7 8.75-7"/>',
  },
  pin: {
    body: '<path d="M12 21.25s6.75-6.1 6.75-11.5a6.75 6.75 0 0 0-13.5 0c0 5.4 6.75 11.5 6.75 11.5z"/><circle cx="12" cy="9.75" r="2.5"/>',
  },
  // Interface
  arrow: { body: '<path d="M4 12h15.5M13.5 6l6 6-6 6"/>', directional: true },
  chevronDown: { body: '<path d="M5.5 9.5l6.5 6.5 6.5-6.5"/>' },
  chevron: { body: '<path d="M9.5 5.5l6.5 6.5-6.5 6.5"/>', directional: true },
  external: {
    body: '<path d="M14 4.25h5.75V10M19.5 4.5L11 13"/><path d="M18 14v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 5.25 6.5H10"/>',
    directional: true,
  },
  plus: { body: '<path d="M12 4.5v15M4.5 12h15"/>' },
  menu: { body: '<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>' },
  close: { body: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>' },
  sun: {
    body: '<circle cx="12" cy="12" r="4"/><path d="M12 2.75v2M12 19.25v2M2.75 12h2M19.25 12h2M5.45 5.45l1.4 1.4M17.15 17.15l1.4 1.4M5.45 18.55l1.4-1.4M17.15 6.85l1.4-1.4"/>',
  },
  moon: { body: '<path d="M19.75 14.6A8.25 8.25 0 0 1 9.4 4.25a8.25 8.25 0 1 0 10.35 10.35z"/>' },
  globe: {
    body: '<circle cx="12" cy="12" r="8.75"/><path d="M3.25 12h17.5M12 3.25c2.4 2.4 3.6 5.3 3.6 8.75s-1.2 6.35-3.6 8.75c-2.4-2.4-3.6-5.3-3.6-8.75S9.6 5.65 12 3.25z"/>',
  },
  // Social
  linkedin: {
    body: '<rect x="3.25" y="3.25" width="17.5" height="17.5" rx="2"/><path d="M8 10.5v6M8 7.5v.01M11.75 16.5v-6M11.75 13.25a2.75 2.75 0 0 1 5.25-1v4.25"/>',
  },
  x: { body: '<path d="M4 4l16 16M20 4L4 20"/>' },
  instagram: {
    body: '<rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.25" cy="6.75" r=".5"/>',
  },
  facebook: {
    body: '<path d="M14.5 3.25h2.75v3.5H15a1 1 0 0 0-1 1v2.5h3.25l-.5 3.5H14v7h-3.5v-7H7.75v-3.5h2.75V7.5a4.25 4.25 0 0 1 4-4.25z"/>',
  },
  youtube: {
    body: '<rect x="2.75" y="5.5" width="18.5" height="13" rx="3.5"/><path d="M10 9.25v5.5l4.75-2.75z"/>',
  },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as [IconName, ...IconName[]];

export function getIcon(name: IconName): IconDefinition {
  return icons[name];
}
