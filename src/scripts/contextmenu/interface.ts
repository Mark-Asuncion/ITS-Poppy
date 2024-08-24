export interface _ContextMenuItem {
    name: string,
    callback?: () => void,
    // sep height
    // name is ignored if defined and not 0
    // hover is also disabled
    separator?: number,
};
