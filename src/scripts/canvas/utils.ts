import { DiagramGroup } from "./diagramgroup";
import { Statement } from "./blocks/statement";
import { If, Elif, Else } from "./blocks/control";
import { For, While } from "./blocks/loop";
import { BaseDiagram } from "./basediagram";
import { Theme } from "../../themes/diagram";
import { Function } from "./blocks/function";

export function isPointIntersectRect(
    point: { x: number, y: number },
    rect: { x: number, y: number, width: number, height: number }
) {
    return point.x > rect.x && point.x < ( rect.x + rect.width )
        && point.y > rect.y && point.y < ( rect.y + rect.height );
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

export function findNodeType(line: string) {
    let lineTrim = line.trim();

    let ifMatch = lineTrim.match(/if\s.*:/g);
    if (ifMatch && ifMatch.length > 0) {
        let elifMatch = lineTrim.match(/elif\s.*:/g);
        if (elifMatch && elifMatch.length > 0) {
            return "elif";
        }
        else {
            return "if";
        }
    }
    let elseMatch = lineTrim.match(/else:/);
    if (elseMatch && elseMatch.length > 0) {
        return "else";
    }

    let forMatch = lineTrim.match(/for\s.*\sin\s.*:/);
    if (forMatch && forMatch.length > 0) {
        return "for";
    }

    let whileMatch = lineTrim.match(/while\s.*:/);
    if (whileMatch && whileMatch.length > 0) {
        return "while";
    }

    let functionMatch = lineTrim.match(/.*\(.*\)/);
    if (functionMatch && functionMatch.length > 0) {
        return "function";
    }

    return "statement";
}

// type is obtained from findNodeType + the endblock and indent#
export function createDiagramFrom(type: string, line: string = ""): BaseDiagram {
    let content = "";
    switch(type) {
        case "statement":
            return  new Statement(line);
        case "if":
            if (line.length > 0) {
                content = line.replace(/if|:/g, "").trim();
            }
            return new If(content)
        case "elif":
            if (line.length > 0) {
                content = line.replace(/elif|:/g, "").trim();
            }
            return new Elif(content)
        case "else":
            return new Else();
        case "for":
            if (line.length > 0) {
                let forContent = /for\s(.*)\sin\s(.*):/.exec(line);
                if (forContent == null) {
                    break;
                }
                return new For([ forContent[1], forContent[2] ]);
            }
            else {
                return new For();
            }
        case "while":
            if (line.length > 0) {
                content = line.replace(/while|:/g, "").trim();
            }
            return new While(content)
        case "function":
            if (line.length > 0) {
                let funInfo = /(.*)\((.*)\)/.exec(line);
                if (funInfo == null) {
                    break;
                }
                return new Function(funInfo[1].trim(), funInfo[2].trim());
            }
            else {
                return new Function();
            }
        case "endblock":
            return new BaseDiagram({
                name: type,
                theme: Theme.Diagram.Statement,
                diagramType: "endblock"
            });
        case "indent0":
        case "indent1":
        case "indent2":
        case "indent3":
            return new BaseDiagram({
                name: type,
                theme: Theme.Diagram.Statement,
                diagramType: type
            });
        default:
            console.warn("Should Not Happen");
            break;
    }
    return  new Statement(line);
}

let gHoverTimerMap = new Map<HTMLElement, number | undefined>();
window["gHoverTimerMap"] = gHoverTimerMap;

export function setHover(
    source: HTMLElement,
    message: string,
    timeout: number = 1000
) {
    let id = gHoverTimerMap.get(source);
    if (id != undefined) {
        clearTimeout(id);
        gHoverTimerMap.set(source, undefined);
        return;
    }

    source.addEventListener("mouseenter", (e) => {
        let id = setTimeout(() =>  {
            const div = document.createElement("div");
            div.classList.add("hover-item");
            div.innerHTML = `<p style="margin: 0">${message}</p>`;

            div.style.left = `${e.x}px`;
            div.style.top = `${e.y}px`;
            document.body.appendChild(div);
        }, timeout);
        gHoverTimerMap.set(source, id as unknown as number);
    });

    source.addEventListener("mouseleave", () => {
        let id = gHoverTimerMap.get(source);
        if (id != undefined) {
            clearTimeout(id);
            let items = document.querySelectorAll(".hover-item");
            items.forEach((v) => {
                v.remove();
            });
            gHoverTimerMap.set(source, undefined);
            return;
        }
    })

}

export function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max));
}
