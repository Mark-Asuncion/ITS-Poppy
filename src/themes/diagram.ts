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
        Indent0: {
            prefix:"M 37,40 32,33 C 31,31 29,30 27,30 H 3 C 1,30 0,29 0,27 V 3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 150,
            suffix: " c 2,0 3,1 3,3 v 24 c 0,2 -1,3 -3,3 H 78 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 H 42 c -2,0 -4,-1 -5,-3 z"
        },
        Indent1: {
            prefix:"M 57,40 52,33 C 51,31 49,30 47,30 H 3 C 1,30 0,29 0,27 V 3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 150,
            suffix: " c 2,0 3,1 3,3 v 24 c 0,2 -1,3 -3,3 H 97 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 H 62 c -2,0 -4,-1 -5,-3 z"
        },
        Indent2: {
            prefix:"M 77,40 72,33 C 71,31 69,30 67,30 H 3 C 1,30 0,29 0,27 L 0,3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 150,
            suffix: " c 2,0 3,1 3,3 l 0,24 c 0,2 -1,3 -3,3 H 117 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 H 82 c -2,0 -4,-1 -5,-3 z"
        },
        Indent3: {
            prefix:"M 97,40 92,33 C 91,31 89,30 87,30 H 3 C 1,30 0,29 0,27 V 3 C 0,1 1,0 3,0 h 24 c 2,0 4,1 5,3 l 5,7 c 1,2 3,3 5,3 h 21 c 2,0 4,-1 5,-3 l 5,-7 c 1,-2 3,-3 5,-3 h ",
            hr: 150,
            suffix: " c 2,0 3,1 3,3 v 24 c 0,2 -1,3 -3,3 H 137 c -2,0 -4,1 -5,3 l -5,7 c -1,2 -2,3 -4,3 h -21 c -2,0 -4,-1 -5,-3 z"
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
        },
        Function: {
            fill: "#2782ED",
            stroke: "#0f5cb7"
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
    Button: {
        fill: "#6F6F6F",
        hover: "#E8E8E8",
        arrow_left: "M560-280 360-480l200-200v400Z",
        arrow_right: "M400-280v-400l200 200-200 200Z"
    }
};

export const SIDEBAR = {
    Statement: {
        items: [
            "statement",
            "endblock",
        ],
        tooltip: [
            "This is a statement diagram.",
            "This is a endblock diagram. this is used to end a block",
        ]
    },
    Control: {
        items: [
            "control-if",
            "control-elif",
            "control-else",
        ],
        tooltip: [
            "This is a If diagram.",
            "This is a Elif diagram.",
            "This is a Else diagram.",
        ]
    },
    Loop: {
        items: [
            "loop-for",
            "loop-while",
        ],
        tooltip: [
            "This is a For loop diagram.",
            "This is a While loop diagram.",
        ]
    },
    Utilities: {
        items: [
            "function",
            "class"
        ],
        tooltip: [
            "This is a Function diagram.",
            "This is a Class diagram.",
        ]
    }
}
