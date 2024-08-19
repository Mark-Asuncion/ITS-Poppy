export const Theme = {
    SVG: {
        // cover the notch to tell that the block has ended
        EndBlock: {
            prefix: "m 37,40 -5,-7 c -1,-2 -3,-3 -5,-3 H 3 c -2,0 -3,-1 -3,-3 L 0,3 C 0,1 1,0 3,0 h ",
            hr: 100,
            suffix: " c 2,0 3,1 3,3 l 0,24 c 0,2 -1,3 -3,3 H 78 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 H 42 c -2,0 -4,-1 -5,-3 z"
        },
        Normal: {
            prefix: "m 37,80 -5,-7 c -1,-2 -3,-3 -5,-3 H 3 C 1,70 0,69 0,67 V 3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 100,
            suffix: " c 2,0 3,1 3,3 v 64 c 0,2 -1,3 -3,3 L 78,70 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 l -22,0 c -2,0 -4,-1 -5,-3 z"
        },
        // also indent1
        Block: {
            prefix:"m 57,80 -5,-7 c -1,-2 -3,-3 -5,-3 L 3,70 C 1,70 0,69 0,67 V 3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 100,
            suffix: " c 2,0 3,1 3,3 v 64 c 0,2 -1,3 -3,3 L 97,70 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 h -21 c -2,0 -4,-1 -5,-3 z"
        },
        // is relative
        // lineIndent + indent#
        // instead of moving the notch
        // create a new diagram at the top representing the indent level
        // max is indent3 more indents warn the user
        Indent2: {
            prefix:"M 77,80 72,73 C 71,71 69,70 67,70 H 3 C 1,70 0,69 0,67 V 3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 150,
            suffix: " c 2,0 3,1 3,3 v 64 c 0,2 -1,3 -3,3 L 117,70 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 H 82 c -2,0 -4,-1 -5,-3 z"
        },
        Indent3: {
            prefix:"M 97,80 92,73 C 91,71 89,70 87,70 H 3 C 1,70 0,69 0,67 V 3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 150,
            suffix: " c 2,0 3,1 3,3 v 64 c 0,2 -1,3 -3,3 L 137,70 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 h -21 c -2,0 -4,-1 -5,-3 z"
        }
    },
    BaseDiagram: {
        strokeWidth: 2,
        width: 200
    },
    Diagram: {
        Active: {
            stroke: "#E31C17",
        },
        Statement: {
            stroke: "#6F6F6F",
            fill: "#F9F9F9",
        },
        Control: {
            stroke: "#107745",
            fill: "#1AC673",
        },
        Loop: {
            stroke: "#a6600e",
            fill: "#ED9227",
        }
    },
    TextBox: {
        padding: 5,
        wrap: "none",
        fill: "#FFFFFF",
        stroke: "#6F6F6F",
        cornerRadius: 3
    },
    Text: {
        fontSize: 20,
    },
    Selection: {
        fill: "#6388eb",
        stroke: "#1A4BCC",
        strokeWidth: 1,
        opacity: 0.5
    },
    Transformer: {
        id: "transformer",
        name: "transformer",
        resizeEnabled: false,
        rotateEnabled: false,
        flipEnabled: false,
        borderEnabled: false,
        borderDash: [6, 6],
        borderStroke: "#E31C17",
        borderStrokeWidth: 1,
        padding: 1,
        anchorSize: 5,
    },
    Button: {
        fill: "#6F6F6F",
        hover: "#E8E8E8",
        arrow_left: "M560-280 360-480l200-200v400Z",
        arrow_right: "M400-280v-400l200 200-200 200Z"
    }
};
