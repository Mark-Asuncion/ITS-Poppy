export const Theme = {
    BaseDiagram: {
        cornerRadius: 10,
        strokeWidth: 2
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
            stroke: "#6F6F6F",
            fill: "#1AC673",
        },
        Loop: {
            stroke: "#6F6F6F",
            fill: "#ED9227",
        }
    },
    TextBox: {
        padding: 10,
        wrap: "none",
        fill: "#FFFFFF",
        stroke: "#6F6F6F",
    },
    Text: {
        fontSize: 16,
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
