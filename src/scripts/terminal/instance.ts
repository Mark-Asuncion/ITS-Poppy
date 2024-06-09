import { Terminal } from "@xterm/xterm"
import { read_term, spawn_term, write_term } from "../backendconnector";

export class TerminalInstance {
    static instance: Terminal | null = null;
    // static history: string[];
    static inputBytes = 0;

    static async open(target: HTMLElement) {
        const res = await spawn_term();
        if (res) {
            const term = new Terminal({
                cols: 80,
                rows: 25
            });
            term.open(target);
            TerminalInstance.instance = term;
        }
    }

    static getCurrLine() {
        const term = TerminalInstance.instance!;
        const buffer = term.buffer.active;
        const y = buffer.cursorY;
        const linebuf = buffer.getLine(y)!;
        return linebuf.translateToString(true);
    }

    static _get_input() {
        const line = TerminalInstance.getCurrLine();
        const input = line.substring(line.length - TerminalInstance.inputBytes);
        return input;
    }

    static async _handleEnter() {
        const term = TerminalInstance.instance!;
        const input = TerminalInstance._get_input();
        console.log("input::",input);
        // if (TerminalInstance.inputBytes === 0) {
        //     const prompt = TerminalInstance.getCurrLine();
        //     term.write(`\r\n${prompt}`);
        //     return;
        // }

        term.write("\r\n");
        if (TerminalInstance.inputBytes !== 0) {
            await write_term(`${input}\r\n`);
        }
        else {
            await write_term("\r\n");
        }

        const buf = await read_term();
        const spl = buf.split("\r\n");
        const nbuf = spl.slice(1).join("\r\n");

        term.write(nbuf);
        TerminalInstance.inputBytes = 0;

        // NOTE: if the program has loops (non-ending) might cause a hang because read_term
        // will not return if there is more data
        // FIX??: don't wait for read_term and and just append to the buffer and write
    }

    static async _handleBackspace() {
        if (TerminalInstance.inputBytes === 0) {
            return;
        }
        TerminalInstance.instance!.write('\b \b');
        TerminalInstance.inputBytes--;
    }

    static init() {
        const term = TerminalInstance.instance;
        if (!term) {
            return;
        }

        // term.on('paste', function(data) {
        //     term.write(data);
        // });

        term.onKey(({ key, domEvent }) => {
            // BUG when clearing screen with cls command
            // the last text buffer on y will show up if there is no text to overwrite

            console.log("domEvent::", domEvent);
            console.log("key::", key);


            const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

            if (domEvent.key === "Enter") {
                TerminalInstance._handleEnter();
            }
            else if (domEvent.key === "Backspace") {
                TerminalInstance._handleBackspace();
            }
            else if (printable) {
                term.write(key);
                TerminalInstance.inputBytes++;
            }
        });

        read_term()
            .then((buf) => {
                if (buf.length !== 0) {
                    term.write(buf);
                }
            });
    }

    static write(command: string) {
        if (!TerminalInstance.instance || command.length === 0) {
            return;
        }

        TerminalInstance.inputBytes += command.length;
        TerminalInstance.instance.write(command, () => {
            TerminalInstance._handleEnter();
        });
    }
}
