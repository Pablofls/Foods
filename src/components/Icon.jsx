// Icon.jsx — iconos de línea geométricos (portado de ui.jsx).
export function Icon({ name, size = 24, stroke = 'currentColor', sw = 1.8, fill = 'none' }) {
  const p = { fill, stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    hoy: <><circle cx="12" cy="12" r="6.2" {...p} /><circle cx="12" cy="12" r="2.2" {...p} /></>,
    semana: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...p} /><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p} /></>,
    comidas: <><path d="M5 4h12a2 2 0 0 1 2 2v14l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4V6a2 2 0 0 1 2-2Z" {...p} /><path d="M8.5 9h7M8.5 12.5h5" {...p} /></>,
    lista: <><path d="M8 6h12M8 12h12M8 18h12" {...p} /><circle cx="4" cy="6" r="1.1" fill={stroke} stroke="none" /><circle cx="4" cy="12" r="1.1" fill={stroke} stroke="none" /><circle cx="4" cy="18" r="1.1" fill={stroke} stroke="none" /></>,
    resumen: <><path d="M5 20V10M12 20V4M19 20v-7" {...p} /></>,
    heart: <path d="M12 20.5S3.5 15 3.5 8.8A4.3 4.3 0 0 1 12 6.5a4.3 4.3 0 0 1 8.5 2.3C20.5 15 12 20.5 12 20.5Z" {...p} />,
    shuffle: <><path d="M4 6h3.5l9 12H20M4 18h3.5l2.2-3M14.5 8.5l2-2.5H20" {...p} /><path d="M17.5 3.5 21 6l-3.5 2.5M17.5 15.5 21 18l-3.5 2.5" {...p} /></>,
    check: <path d="M5 12.5 10 17.5 19.5 7" {...p} />,
    plus: <path d="M12 5v14M5 12h14" {...p} />,
    close: <path d="M6 6l12 12M18 6 6 18" {...p} />,
    search: <><circle cx="11" cy="11" r="6.5" {...p} /><path d="m16 16 4 4" {...p} /></>,
    chevron: <path d="m9 6 6 6-6 6" {...p} />,
    edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" {...p} />,
    dice: <><rect x="4" y="4" width="16" height="16" rx="4" {...p} /><circle cx="9" cy="9" r="1.2" fill={stroke} stroke="none" /><circle cx="15" cy="15" r="1.2" fill={stroke} stroke="none" /><circle cx="15" cy="9" r="1.2" fill={stroke} stroke="none" /><circle cx="9" cy="15" r="1.2" fill={stroke} stroke="none" /></>,
    back: <path d="m14 6-6 6 6 6" {...p} />,
    trash: <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" {...p} />,
    bag: <><path d="M5.5 8h13l-1 11.5a1.5 1.5 0 0 1-1.5 1.4H8a1.5 1.5 0 0 1-1.5-1.4L5.5 8Z" {...p} /><path d="M9 8a3 3 0 0 1 6 0" {...p} /></>,
    bowl: <><path d="M3.5 11h17a8.5 8.5 0 0 1-8.5 7.5A8.5 8.5 0 0 1 3.5 11Z" {...p} /><path d="M8.5 11c0-2 1-3 1.7-3.7.6-.6.8-1.3.5-2.3M13 11c0-2 1-3 1.7-3.7.6-.6.8-1.3.5-2.3" {...p} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
}
