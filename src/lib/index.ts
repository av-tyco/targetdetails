// place files you want to import through the `$lib` alias in this folder.
export interface Target {
    id: number, x: number, y: number, width: number, height: number
}
export function getScaledDimensions(
    width: number,
    height: number,
    size: number
): { newWidth: number; newHeight: number } {
    let newWidth = size;
    let newHeight = size;

    if (height > width) {
        newWidth = size * (width / height);
    } else if (width > height) {
        newHeight = size * (height / width);
    }
    return { newWidth, newHeight };
}