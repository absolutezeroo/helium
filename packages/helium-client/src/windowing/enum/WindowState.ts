export const WINDOW_STATE =
{
    DEFAULT: 0,
    ACTIVE: 1,
    FOCUSED: 2,
    HOVERING: 4,
    SELECTED: 8,
    PRESSED: 16,
    DISABLED: 32,
    LOCKED: 64,
    DESTROYING: 1073741824
} as const;

export type WindowStateFlag = typeof WINDOW_STATE[keyof typeof WINDOW_STATE];
