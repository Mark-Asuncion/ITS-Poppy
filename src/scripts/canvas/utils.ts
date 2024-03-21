import Konva from "konva";
import { DiagramGroup } from "./diagramgroup";
import { Statement } from "./blocks/statement";
import { If, Elif, Else } from "./blocks/control";
import { For } from "./blocks/loop";

export function isPointIntersectRect(
    point: { x: number, y: number },
    rect: { x: number, y: number, width: number, height: number }
) {
    return point.x > rect.x && point.x < ( rect.x + rect.width )
        && point.y > rect.y && point.y < ( rect.y + rect.height );
}

export function createStatementDiagramAt(pos: Konva.Vector2d): DiagramGroup {
    const diagGroup = new DiagramGroup(pos);
    const diagram = new Statement();
    diagGroup.addDiagram(diagram);
    return diagGroup;
}

export function createIfDiagramAt(pos: Konva.Vector2d): DiagramGroup {
    const diagGroup = new DiagramGroup(pos);
    const diagram = new If();
    diagGroup.addDiagram(diagram);
    return diagGroup;
}

export function createElifDiagramAt(pos: Konva.Vector2d): DiagramGroup {
    const diagGroup = new DiagramGroup(pos);
    const diagram = new Elif();
    diagGroup.addDiagram(diagram);
    return diagGroup;
}

export function createElseDiagramAt(pos: Konva.Vector2d): DiagramGroup {
    const diagGroup = new DiagramGroup(pos);
    const diagram = new Else();
    diagGroup.addDiagram(diagram);
    return diagGroup;
}

export function createForDiagramAt(pos: Konva.Vector2d): DiagramGroup {
    const diagGroup = new DiagramGroup(pos);
    const diagram = new For();
    diagGroup.addDiagram(diagram);
    return diagGroup;
}
