import { MousePosition } from "../model/map_objects/mouse-position";

export function stopEvent(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}

export function getMousePosition(
    event: MouseEvent | TouchEvent,
    element: SVGGraphicsElement,
    scale: number
): MousePosition {
    let x = 0;
    let y = 0;
    if (event instanceof MouseEvent) {
        x = event.offsetX;
        y = event.offsetY;
    }
    if (window.TouchEvent && event instanceof TouchEvent && event.touches) {
        x = (event.touches[0].clientX - element.getBoundingClientRect().x) / scale;
        y = (event.touches[0].clientY - element.getBoundingClientRect().y) / scale;
    }
    return new MousePosition(x, y);
}
