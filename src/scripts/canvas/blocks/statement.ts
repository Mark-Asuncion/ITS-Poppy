import { Theme } from "../../../themes/diagram";
import { TextBox } from "../text/textbox";
import { BaseDiagram } from "../basediagram";
import { TextChangedEvent, TextKeyUpEvent } from "../basetext";
import { createDiagramFrom, findNodeType } from "../utils";
import { DiagramGroup } from "../diagramgroup";
import { Poppy } from "../../../poppy/poppy";

export class Statement extends BaseDiagram {
    constructor(content: string = "") {
        super({
            name: "Statement",
            theme: Theme.Diagram.Statement
        });

        const padding = Theme.TextBox.padding;
        const w = this.width() - padding * 2;
        const textPos = {
            x: this.width() / 2 - w / 2,
            y: this.height() / 2
        };
        this.components.push(new TextBox({
            text: content,
            width: w,
            fill: "#00",
            ...Theme.Text,
            ...textPos,
        }));
        let tb = this.components[0];
        tb.y(tb.y() - tb.height() / 2);
        this.setSize({ width: tb.width() + ( padding * 2 ) });
        this.add(tb);
    }

    onTextChanged(e: TextChangedEvent) {
        super.onTextChanged(e);
        if (!e.value) {
            return;
        }
        const content = e.value;
        // let varMatch = content.match(/(\w*)=(\w*)/);
        // if (varMatch != null && varMatch.length == 3) {
        //     let ncontent = varMatch[1].trim() + " = " + varMatch[2].trim();
        //     (this.components[0]! as TextBox).text.text(ncontent);
        //     (this.components[0]! as TextBox).adjustWidth(ncontent);
        //     (this.components[0]! as TextBox).setColors();
        // }
        // console.log("content: ", content);
        const type = findNodeType(content);
        if (type === "statement") {
            return;
        }
//        console.log(type, content);

        const diagram = createDiagramFrom(type, content);
        // console.log(diagram);

        const indexPos = this.getIndexPos();
        if (indexPos == -1) {
            return;
        }
        const p = (this.parent! as DiagramGroup);
        p.nodes[indexPos].remove();
        p.nodes[indexPos].destroy();
        p.nodes[indexPos] = diagram;
        p.add(diagram);
        p.refresh();
    }


    onKeyUp(e: TextKeyUpEvent) {
        super.onKeyUp(e);

        if (!e.key)
            return;

        const p = this.parent! as DiagramGroup;
        const indexPos = this.getIndexPos();
        if (indexPos == -1) {
            return;
        }
        if (e.key === "Enter") {

            let node: Statement;
//             let t = (this.components[0] as TextBox).text.text();
//            console.log(t);
//             if (t.length > 0) {
//                 return;
//             }
            if (indexPos < p.nodes.length-1) {
                node = createDiagramFrom("statement");
                p.nodes.splice(indexPos+1,0,node);
                p.add(node);
                p.refresh();
            }
            else {
                node = createDiagramFrom("statement");
                p.addDiagram(node);
                p.refresh();
            }
            if (Poppy.onDiagramDrop)
                Poppy.onDiagramDrop();

            node.focus();
        }
        else if (e.key === "Backspace" && indexPos !== 0) {
//            console.log(`${ e.value }`, typeof(e.value), e.value?.length);
            if (e.value != undefined && e.value.length === 0) {
                const nodeToDes = p.nodes[indexPos];
                nodeToDes.removeFocus();

                p.nodes.splice(indexPos, 1);
                nodeToDes.remove();
                nodeToDes.destroy();
                p.refresh();
                if (indexPos > 0) {
                    p.nodes[indexPos-1].focus();
                }
                if (Poppy.onDelete)
                    Poppy.onDelete();
            }
        }
    }

    refresh() {
        let tb = this.components[0];
        this.setSize({
            width: tb.x() + tb.width() + tb.padding(),
        });
    }

    getContent() {
        let i=0;
        let ind = "";
        while (i<this._indent) {
            ind += "\t";
            i++;
        }
        return ind + (this.components[0] as TextBox).getContent();
    }

    setTextValue(v: string) {
        let tb = (this.components[0] as TextBox);
        tb.text.text(v);
        tb.adjustWidth(v);
        tb.setColors();
    }
}
