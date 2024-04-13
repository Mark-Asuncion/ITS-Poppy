import { invoke } from "@tauri-apps/api/tauri";
import { open } from '@tauri-apps/api/dialog';

export interface Module {
    name: string,
    content: string
};
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

export async function get_cwd() {
    try {
        return await invoke("get_cwd");
    }
    catch (e) {
        console.error(e);
    }
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

