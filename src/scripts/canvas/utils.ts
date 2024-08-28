import Konva from "konva";
import { DiagramGroup } from "./diagramgroup";
import { Statement } from "./blocks/statement";
import { If, Elif, Else } from "./blocks/control";
import { For } from "./blocks/loop";
import { BaseDiagram } from "./basediagram";
import { KonvaEventObject } from "konva/lib/Node";

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

export function getSvgPathDimensions(pathData: string, scale: number = 1) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    path.setAttribute('d', pathData);
    svg.appendChild(path);

    // Append SVG to the body (necessary to get dimensions)
    document.body.appendChild(svg);

    const bbox = path.getBBox();

    document.body.removeChild(svg);

    return {
        width: bbox.width * scale,
        height: bbox.height * scale
    };
}

export interface _Selected {
    setActive: () => void,
    removeActive: () => void,
    // moveToTop: () => void,
    // moveToBottom: () => void
};

export function toDiagram(curr: BaseDiagram, what: string, parent: any) {
    const p = parent as DiagramGroup;
    // find the insertion index
    let insertionIndex = -1;
    for (let i=0;i<p.nodes.length;i++) {
        if (p.nodes[i] === curr) {
            insertionIndex = i;
            break;
        }
    }

    if (insertionIndex == -1) {
        return;
    }

    let ct = curr.getInputContent();
    let node: null | BaseDiagram = null;
    if (what == "if") {
        curr.remove();
        curr.destroy();

        ct = ct.replace(/if|:/g,'').trim();
        node = new If(ct);
    }
    else if (what == "elif") {
        curr.remove();
        curr.destroy();

        ct = ct.replace(/elif|:/g,'').trim();
        node = new Elif(ct);
    }
    else if (what == "else") {
        curr.remove();
        curr.destroy();
        node = new Else();
    }

    if (node == null)
        return;

    p.nodes.splice(insertionIndex, 1, node);
    p.add(node);
    p.refresh();
}

export interface TextKeyUpEvent extends KonvaEventObject<any> {
    value?: string,
    key?: string
};
