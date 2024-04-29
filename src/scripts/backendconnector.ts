import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';

export interface Module {
    name: string,
    content: string
};

export interface ProjectInfo {
    path: string,
    projectName: string,
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
export function set_cwd(path: string) {
    try {
        invoke("set_cwd", { p: path });
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

export function write_diagrams_to_modules(arrContents: Array<Module>) {
    try {
        const asStr = JSON.stringify(arrContents);
        invoke("write_diagrams_to_modules", {
            modules: asStr
        });
    }
    catch (e) {
        console.error(e);
    }
}

export async function load_modules(): Promise<Module[]> {
    try {
        return await invoke("load_modules") as Module[];
    }
    catch (e) {
        console.error(e);
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
    }
    return [];
}

export function new_project(name: string, path: string) {
    try {
        invoke("new_project", { name, path });
    }
    catch (e) {
        console.error(e);
    }
}

export function load_open_project(path: string) {
    try {
        invoke("load_open_project", { path });
    }
    catch (e) {
        console.error(e);
    }
}
