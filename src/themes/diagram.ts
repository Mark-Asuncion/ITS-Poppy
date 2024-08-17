export const Theme = {
    SVG: {
        Normal: {
            prefix: "m 36,80 -5,-7 c -1,-2 -3,-3 -5,-3 H 3 c -2,0 -3,-1 -3,-3 L 0,3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 100,
            suffix: " c 2,0 3,1 3,3 l 0,64 c 0,2 -1,3 -3,3 H 76 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 H 41 c -2,0 -4,-1 -5,-3 z"
        }
    },
    BaseDiagram: {
        strokeWidth: 1,
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
