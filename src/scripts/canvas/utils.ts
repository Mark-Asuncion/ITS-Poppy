import { DiagramGroup } from "./diagramgroup";
import { RectConfig } from "konva/lib/shapes/Rect";
import { Statement } from "./statement";

export function isPointIntersectRect(
    point: { x: number, y: number },
    rect: { x: number, y: number, width: number, height: number }
) {
    return point.x > rect.x && point.x < ( rect.x + rect.width )
        && point.y > rect.y && point.y < ( rect.y + rect.height );
}

export function createDiagramAt(rect: RectConfig): DiagramGroup {
    const diagGroup = new DiagramGroup();
    const diagram = new Statement(rect);
    diagGroup.addDiagram(diagram);
    return diagGroup;
}
