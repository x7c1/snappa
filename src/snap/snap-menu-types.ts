export interface SnapLayout {
    label: string;
    x: number | string; // number: percentage (0-1), string: expression ('1/3', '50%', '100px', '50% - 10px')
    y: number | string; // number: percentage (0-1), string: expression ('0', '50%', '10px')
    width: number | string; // number: percentage (0-1), string: expression ('1/3', '300px', '100% - 20px')
    height: number | string; // number: percentage (0-1), string: expression ('100%', '1/2', '500px')
    zIndex: number; // stacking order for overlapping layouts
}

export interface SnapLayoutGroup {
    name: string;
    layouts: SnapLayout[];
}
