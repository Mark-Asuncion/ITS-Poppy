import { Terminal } from "@xterm/xterm"
import { read_term, spawn_term, write_term } from "../backendconnector";
import { clipboard } from "@tauri-apps/api";

enum RawArrowKeys {
    LEFT = "[D",
    UP = "[A",
    RIGHT = "[C",
    DOWN = "[B"
};

enum RawCtrlChars {
    CTRLC = "\x03",
    CTRLD = "\x04"
};

export class TerminalInstance {
    static instance: Terminal | null = null;
    static history: string[] = [];
    static historyOffset: number = 0;
    static inputBytes = 0;
    static maxCursorPosX = 0;

    static async open(target: HTMLElement) {
        const res = await spawn_term();
        if (res) {
            const parentHeight = Math.floor(target.parentElement!.clientHeight / 16 * .75);
            // console.log(parentHeight);
            const term = new Terminal({
                cols: 80,
                rows: parentHeight,
                fontSize: 16,
                overviewRulerWidth: 15,
            });
            term.open(target);
            TerminalInstance.instance = term;
        }
        // TODO: send error event
    }

    static getCursorPosition() {
        const term = TerminalInstance.instance!;
        const buffer = term.buffer.normal;
        return {
            x: buffer.cursorX,
            y: buffer.cursorY
        };
    }
    static getCurrLine() {
        TerminalInstance.maxCursorPosX = Math.max(TerminalInstance.maxCursorPosX, TerminalInstance.getCursorPosition().x);
        const term = TerminalInstance.instance!;
        const buffer = term.buffer.normal;
        let y = buffer.cursorY;
        const linebuf = buffer.getLine(y)!;
        // BUG:
        // if the input has whitespace at the end this cuts it
        // and prompt len will be different
        return linebuf.translateToString(true).trimEnd();
    }

    static getPrompt() {
        const line = TerminalInstance.getCurrLine();
        let st = 0;
        if (TerminalInstance.maxCursorPosX != 0) {
            st = TerminalInstance.maxCursorPosX - TerminalInstance.inputBytes;
        }
        else {
            st = line.length - TerminalInstance.inputBytes;
        }
        console.log(line.substring(0, st));
        return line.substring(0, st);
    }

    static getInput() {
        if (TerminalInstance.inputBytes === 0) {
            return "";
        }
        const line = TerminalInstance.getCurrLine();
        const prompt = TerminalInstance.getPrompt();
        let input = line.substring(prompt.length);
        if (input.length < TerminalInstance.inputBytes) {
            input += " ".repeat(TerminalInstance.inputBytes - input.length);
        }
        // console.log(`_get_inpput::line="${line}", input="${input}"`);
        return input;
    }

    static _historyPush(value: string) {
        TerminalInstance.historyOffset = 0;
        if (value.length == 0) {
            return;
        }

        TerminalInstance.history.push(value);
        const len = 100 - TerminalInstance.history.length;
        if (len < 0) {
            const nhist = TerminalInstance.history
            .slice(-len);
            TerminalInstance.history = nhist;
        }
    }

    static _historyCycle(offset: number) {
        let len = TerminalInstance.history.length;
        if (len == 0) {
            return "";
        }
        TerminalInstance.historyOffset += offset;
        TerminalInstance.historyOffset = Math.min(len, Math.max(TerminalInstance.historyOffset, -len));
        const index = Math.min(len-1, Math.max(len + TerminalInstance.historyOffset, 0));
        const last = 
            TerminalInstance.history[index];
        return last;
    }

    static async _handleEnter() {
        const term = TerminalInstance.instance!;
        const input = TerminalInstance.getInput();
        TerminalInstance.maxCursorPosX = 0;

        await write_term(`${input}\r\n`);
        TerminalInstance._historyPush(input);

        const buf = await read_term();
        let spl = buf.split("\r\n");
        // remove the input from previous write_term
        let nbuf = spl.slice(1).join("\r\n");
        // console.log(`_handleEnter:: nbuf="${nbuf}"`);

        // for command that doesn't return an output
        if (nbuf.trim().length === 0) {
            spl = (await read_term()).split("\r\n");
            nbuf = spl.slice(1).join("\r\n");
            console.log(`_handleEnter:: re_nbuf="${nbuf}"`);
        }

        TerminalInstance.inputBytes = 0;

        term.write(`\r\n${nbuf}`);

        // NOTE: if the program has loops (non-ending) might cause a hang because read_term
        // will not return if there is more data
        // FIX??: don't wait for read_term and and just append to the buffer and write
    }

    static _handleBackspace() {
        if (TerminalInstance.inputBytes === 0) {
            return;
        }
        const prompt = TerminalInstance.getPrompt();
        const input = TerminalInstance.getInput();

        const posx = TerminalInstance.getCursorPosition().x;
        const posRel = posx - prompt.length;
        const term = TerminalInstance.instance!;

        if (posRel <= 0) {
            return;
        }

        TerminalInstance.inputBytes--;
        TerminalInstance.maxCursorPosX--;
        if (posRel >= input.length) {
            term.write("\b \b");
        }
        else {
            const rside = input.substring(posRel);
            let left = RawArrowKeys.LEFT.repeat(rside.length);
            let whitespace = " ".repeat(rside.length);
            term.write(`${whitespace}${left}\b${rside}`);
            term.write(`${left}`);
        }

    }

    static _handleDelete() {
        if (TerminalInstance.inputBytes == 0) {
            return;
        }
        const prompt = TerminalInstance.getPrompt();
        const input = TerminalInstance.getInput();

        const posx = TerminalInstance.getCursorPosition().x;
        const posRel = posx - prompt.length;
        const term = TerminalInstance.instance!;

        // console.log(posRel, input.length, promptLen, posx);
        if (posRel >= input.length) {
            return;
        }

        let rside = input.substring(posRel);
        let left = RawArrowKeys.LEFT.repeat(rside.length);
        let whitespace = " ".repeat(rside.length);

        if (rside.length != 0) {
            rside = rside.slice(1);
        }

        TerminalInstance.inputBytes--;
        TerminalInstance.maxCursorPosX--;
        term.write(`${whitespace}${left}${rside}${left}${RawArrowKeys.RIGHT}`);
    }

    static _handleArrow(raw: string, domEvent: KeyboardEvent) {
        const term = TerminalInstance.instance!;
        const direction = domEvent.key.slice(5);

        let prompt = TerminalInstance.getPrompt();
        let cursorx = TerminalInstance.getCursorPosition().x;
        // The start of input is the length of prompt
        const input = TerminalInstance.getInput();
        cursorx = cursorx - prompt.length;

        switch (direction) {
            case "Left":
                if (TerminalInstance.inputBytes !== 0 && cursorx > 0) {
                    term.write(raw);
                }
                break;
            case "Right":
                if (TerminalInstance.inputBytes !== 0 &&
                    cursorx < input.length) {
                    term.write(raw);
                }
                break;
            case "Up": {
                    const last = TerminalInstance._historyCycle(-1);
                    if (last.length == 0) {
                        return;
                    }
                    TerminalInstance.inputBytes = last.length;

                    let left = RawArrowKeys.LEFT.repeat(cursorx);
                    let whitespace = " ".repeat(cursorx);
                    term.write(`${left}${whitespace}${left}${last}`);
                }
                break;
            case "Down": {
                    const last = TerminalInstance._historyCycle(1);
                    if (last.length == 0) {
                        return;
                    }
                    TerminalInstance.inputBytes = last.length;

                    let left = RawArrowKeys.LEFT.repeat(cursorx);
                    let whitespace = " ".repeat(cursorx);
                    term.write(`${left}${whitespace}${left}${last}`);
                }
                break;
            default:
                break;
        }
    }

    static _handlePrintable(raw: string) {
        const prompt = TerminalInstance.getPrompt();
        const input = TerminalInstance.getInput();
        const promptLen = prompt.length;
        const posx = TerminalInstance.getCursorPosition().x;
        // posRel - 1 to get index
        const posRel = posx - promptLen;
        const term = TerminalInstance.instance!;

        TerminalInstance.inputBytes++;
        if (posRel >= input.length) {
            term.write(raw);
        }
        else {
            const rside = input.substring(posRel);
            let left = RawArrowKeys.LEFT.repeat(rside.length);
            term.write(`${raw}${rside}`);
            term.write(`${left}`);
        }
    }

    static init() {
        const term = TerminalInstance.instance;
        if (!term) {
            return;
        }

        window["TerminalInstance"] = this;

        // term.on('paste', function(data) {
        //     term.write(data);
        // });

        term.onKey(({ key, domEvent }) => {
            // BUG when clearing screen with cls command
            // the last text buffer on y will show up if there is no text to overwrite

            // console.log("domEvent::", domEvent);
            // domEvent.key == "c" && domEvent.ctrlKey
            // domEvent.key == "v" && domEvent.ctrlKey
            // console.log("key::", key);

            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
            const isArrow = domEvent.key.startsWith("Arrow");

            if (domEvent.key === "Enter") {
                TerminalInstance._handleEnter();
            }
            else if (isArrow) {
                TerminalInstance._handleArrow(key, domEvent);
            }
            else if (domEvent.key === "Backspace") {
                TerminalInstance._handleBackspace();
            }
            else if (domEvent.key === "Delete") {
                TerminalInstance._handleDelete();
            }
            else if (printable) {
                TerminalInstance._handlePrintable(key);
            }
            else if (domEvent.ctrlKey) {
                const term = TerminalInstance.instance!;
                if (domEvent.key == "c") {
                    if (term.hasSelection()) {
                        const selection = term.getSelection();
                        clipboard.writeText(selection);
                    }
                    else {
                        // send ctrl+c
                    }
                }
            }
        });

        term.onWriteParsed(() => {
            // console.log(`TerminalInstance::inputBytes="${TerminalInstance.inputBytes}"`);
            // console.log(`getCurrLine()="${TerminalInstance.getCurrLine()}"`);
            TerminalInstance.maxCursorPosX = Math.max(TerminalInstance.maxCursorPosX, TerminalInstance.getCursorPosition().x);
            console.log(`maxX=${TerminalInstance.maxCursorPosX}`);
        });

        read_term()
            .then((buf) => {
                if (buf.length !== 0) {
                    term.write(buf);
                }
            });
    }

    static close() {
        // TODO:
    }
}
