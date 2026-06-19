type P = { className?: string };
const S = (props: { children: React.ReactNode } & P) => (
  <svg viewBox="0 0 24 24" className={props.className}>
    {props.children}
  </svg>
);

export const IconCreate = (p: P) => (
  <S {...p}>
    <path d="M12 19l7-7 2 2M14 6l3.5 3.5M3 21l1-4L16 5l3 3L7 20z" />
  </S>
);
export const IconIdeas = (p: P) => (
  <S {...p}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.2-1 2.5H9c0-1.3-.3-1.8-1-2.5A6 6 0 0 1 12 3z" />
  </S>
);
export const IconQueue = (p: P) => (
  <S {...p}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <rect x="3" y="10" width="18" height="4" rx="1" />
    <rect x="3" y="16" width="18" height="4" rx="1" />
  </S>
);
export const IconBrain = (p: P) => (
  <S {...p}>
    <path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 7 17a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 2-5.2A3 3 0 0 0 18 6a3 3 0 0 0-3-3 3 3 0 0 0-3 1.5A3 3 0 0 0 9 3zM12 4.5v13" />
  </S>
);
export const IconCheck = (p: P) => (
  <S {...p}>
    <path d="M20 6 9 17l-5-5" />
  </S>
);
export const IconSpark = (p: P) => (
  <S {...p}>
    <path d="M5 3v4M3 5h4M13 3l2.3 6.2L22 12l-6.7 2.8L13 21l-2.3-6.2L4 12l6.7-2.8z" />
  </S>
);
export const IconRefresh = (p: P) => (
  <S {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
  </S>
);
export const IconEdit = (p: P) => (
  <S {...p}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </S>
);
export const IconPlus = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);
export const IconX = (p: P) => (
  <S {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </S>
);
export const IconCopy = (p: P) => (
  <S {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </S>
);
