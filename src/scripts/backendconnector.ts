import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';
import { createErrorModal } from "./error";
import { Lint } from "./lint";

export interface Module {
    name: string,
    content: string,
    position?: number[]
};

export interface ProjectInfo {
    path: string,
    projectName: string,
}

export interface ProjectInfoEx extends ProjectInfo {
    tutorialId: number | undefined
}

export interface LintItem {
    linen: number,
    message: string,
    errorCode: string,
    errorTypeName: string
}

export interface LintInfo {
    moduleName: string,
    messages: LintItem[]
}

export interface LineCodeTokens {
    tokenType: string,
    value: string,
    index: number,
    len: number,
    keyword: boolean
}

// export function write_with_temp_to(path: string, content: String) {
//     try {
//         invoke("write_with_temp_to", { p: path, content });
//     }
//     catch (e) {
//         console.error(e);
//     }
// }
//
export function set_cwd(path: string, isTutorial = false) {
    try {
        invoke("set_cwd", { p: path, isTutorial });
    }
    catch (e) {
        console.error(e);
    }
}

export async function get_cwd(): Promise<string> {
    try {
        return await invoke("get_cwd");
    }
    catch (e) {
        console.error(e);
    }
    return "";
}

export async function get_cwd_name(): Promise<string> {
    try {
        return await invoke("get_cwd_name");
    }
    catch (e) {
        console.error(e);
    }
    return "";
}

export async function write_diagrams_to_modules(arrContents: Array<Module>) {
    try {
        const asStr = JSON.stringify(arrContents);
        await invoke("write_diagrams_to_modules", {
            modules: asStr
        });
        Lint.lint();
    }
    catch (e) {
        console.error(e);
        createErrorModal(e as string);
    }
}

export async function load_modules(): Promise<Module[]> {
    try {
        let modules = await invoke("load_modules") as Module[];
        console.log(modules);
        return modules;
    }
    catch (e) {
        console.error(e);
        createErrorModal(e as string);
    }
    return [];
}

export async function dialog_one_dir(title: string): Promise<string> {
    try {
        return await open({
            title: title,
            directory: true,
        }) as string;
    }
    catch (e) {
        console.error(e);
    }
    return "";
}

export async function load_projects(): Promise<ProjectInfo[]> {
    try {
        const linfo = await invoke("load_projects") as ProjectInfo[];
        return linfo;
    }
    catch (e) {
        console.error(e);
        createErrorModal(e as string);
    }
    return [];
}

export async function new_project(name: string, path: string) {
    try {
        await invoke("new_project", { name, path });
    }
    catch (e) {
        console.error(e);
        createErrorModal(e as string);
    }
}

export async function del_project(path: string) {
    try {
        await invoke("del_project", { path });
    }
    catch (e) {
        console.error(e);
        createErrorModal(e as string);
    }
}

export async function load_open_project(path: string): Promise<boolean> {
    try {
        await invoke("load_open_project", { path });
        return true;
    }
    catch (e) {
        console.error(e);
        createErrorModal(e as string);
    }
    return false;
}

export async function reset_work_path() {
    try {
        await invoke("del_tutorial_progress");
    }
    catch (e) {
        console.error(e);
        createErrorModal(e as string);
    }
}

export async function spawn_term(): Promise<boolean> {
    try {
        await invoke("spawn_term");
        return true;
    }
    catch (e) {
        console.error(e);
        createErrorModal(JSON.stringify(e));
    }
    return false;
}

export async function write_term(command: string): Promise<number> {
    try {
        return await invoke("write_term", { command }) as number;
    }
    catch (e) {
        console.error(e);
        createErrorModal(JSON.stringify(e));
    }
    return 0;
}

export async function read_term(): Promise<string> {
    try {
        return await invoke("read_term") as string;
    }
    catch (e) {
        console.error(e);
        createErrorModal(JSON.stringify(e));
    }
    return "";
}

export async function close_term(): Promise<number> {
    try {
        return await invoke("close_term") as number;
    }
    catch (e) {
        console.error(e);
    }
    return -1;
}

export async function restart_term(): Promise<void | string> {
    try {
        await invoke("restart_term");
        return;
    }
    catch (e) {
        console.error(e);
        createErrorModal(JSON.stringify(e));
        return (e as Error).message;
    }
}

export async function lint(): Promise<LintInfo[] | string> {
    try {
        return await invoke("lint");
    }
    catch (e) {
        console.error(e);
        createErrorModal(JSON.stringify(e));
        return e as string;
    }
}

export async function analyze_line(line: string): Promise<LineCodeTokens[]> {
    try {
        let tokens = await invoke("analyze_line", { line });
        // console.log(tokens);
        return tokens as LineCodeTokens[];
    }
    catch (e) {
        console.error(e);
        createErrorModal(JSON.stringify(e));
    }
    return [];
}
