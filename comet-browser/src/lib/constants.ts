export type Action =
    | 'new-tab'
    | 'close-tab'
    | 'next-tab'
    | 'prev-tab'
    | 'toggle-sidebar'
    | 'open-settings'
    | 'new-incognito-tab'
    | 'zoom-in'
    | 'zoom-out'
    | 'zoom-reset'
    | 'toggle-spotlight'
    | 'spotlight-search'
    | 'pop-search'
    | 'global-search';

export interface Shortcut {
    accelerator: string;
    action: Action;
}

export const defaultShortcuts: Shortcut[] = [
    { accelerator: 'CommandOrControl+T', action: 'new-tab' },
    { accelerator: 'CommandOrControl+W', action: 'close-tab' },
    { accelerator: 'CommandOrControl+Tab', action: 'next-tab' },
    { accelerator: 'CommandOrControl+Shift+Tab', action: 'prev-tab' },
    { accelerator: 'CommandOrControl+B', action: 'toggle-sidebar' },
    { accelerator: 'CommandOrControl+,', action: 'open-settings' },
    { accelerator: 'CommandOrControl+Shift+N', action: 'new-incognito-tab' },
    { accelerator: 'CommandOrControl+=', action: 'zoom-in' },
    { accelerator: 'CommandOrControl+Plus', action: 'zoom-in' }, // Add this for completeness, although '=' usually covers it
    { accelerator: 'CommandOrControl+-', action: 'zoom-out' },
    { accelerator: 'CommandOrControl+0', action: 'zoom-reset' },
    { accelerator: 'Alt+Space', action: 'spotlight-search' },
    { accelerator: 'CommandOrControl+Shift+S', action: 'pop-search' },
    { accelerator: 'Capslock+S', action: 'toggle-spotlight' },
];
