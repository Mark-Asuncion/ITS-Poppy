use tauri::{ State, AppHandle };
use tauri::PathResolver;
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::fs::{read_dir, ReadDir, create_dir_all};
use std::path::PathBuf;
use std::process::Command;
use std::env;
use std::io::{self, Read, Write};
use std::str::from_utf8;

use crate::config::constants;
use crate::{error, file};
use crate::file::{_should_ignore, open_write};
use crate::state::GlobalState;

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
#[allow(non_snake_case)]
pub struct LintItem {
    pub linen: u16, // linenumber
    pub message: String,
    pub errorCode: String,
    pub errorTypeName: String
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
#[allow(non_snake_case)]
pub struct LineCodeTokens {
    pub tokenType: String,
    pub value: String,
    pub index: u16,
    pub len: u16,
    pub keyword: bool
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
#[allow(non_snake_case)]
pub struct LintInfo {
    pub moduleName: String, // extension not included
    pub messages: Vec<LintItem>
}

fn log_lints(lints: &Vec<LintInfo>, profile_name: String, path_resolver: &PathResolver) {
    if lints.is_empty() {
        return;
    }

    let mut data_dir = path_resolver.app_data_dir()
        .expect(error::Error::DATA_DIR_FAIL.to_string().as_str());
    data_dir.push(constants::D_LOGS);
    data_dir.push(&profile_name);
    if !data_dir.exists() {
        if let Err(e) = create_dir_all(&data_dir) {
            dbg!(&e);
            return;
        }
    }

    let fname = chrono::Local::now()
        .format("%Y-%m-%d");
    data_dir.push(fname.to_string());
    let file = data_dir;
    let mut logs: Vec<LintInfo> = Vec::new();
    if file.exists() {
        let f = file::open_read(&file);
        if let Err(e) = f {
            let path_name = file.to_string_lossy().to_string();
            println!(
                "{}, path={}::{}",
                error::Error::FILE_OPEN_FAIL,
                path_name, e
            );
            return;
        }
        let mut f = f.unwrap();
        let mut content: String = String::new();
        f.read_to_string(&mut content).unwrap();
        let old_lints: Result<Vec<LintInfo>, serde_json::error::Error> =
            serde_json::from_str(content.as_str());
        if let Err(e) = old_lints {
            dbg!(&e);
            return;
        }
        logs = old_lints.unwrap();
    }
    logs.extend_from_slice(lints);
    let content = serde_json::to_string_pretty(&logs);
    if let Err(e) = content {
        dbg!(&e);
        return;
    }
    let content = content.unwrap();
    let wfile = open_write(&file);
    if let Err(e) = wfile {
        let path_name = file.to_string_lossy().to_string();
        println!(
        "{}, path={}::{}",
        error::Error::FILE_OPEN_FAIL,
        path_name, e
    );
        return;
    }
    let mut wfile = wfile.unwrap();
    if let Err(e) = wfile.write_all(content.as_bytes()) {
        let path_name = file.to_string_lossy().to_string();
        println!(
        "{}, path={}::{}",
        error::Error::FILE_WRITE_FAIL,
        path_name, e
    );
        return;
    }
}

pub fn _find_py_files_in(rd: io::Result<ReadDir>) -> io::Result<Vec<String>> {
    let rd = rd?;
    let mut res = vec![];

    for entry in rd {
        let entry = entry?;
        let path = entry.path();

        if _should_ignore(&path) {
            continue;
        }

        if path.is_dir() {
            let r = read_dir(&path);
            res.extend_from_slice(&_find_py_files_in(r)?);
        }

        let ext = path.extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let name = path
            .to_string_lossy()
            .to_string();

        if name.is_empty() {
            continue;
        }

        if ext != "py" {
            continue;
        }

        res.push(name);
    }

    Ok(res)
}

#[tauri::command]
pub async fn lint(gs: State<'_, GlobalState>, app_handle: AppHandle) -> Result<Vec<LintInfo>, String> {
    let work_path = gs.get_work_path_clone();

    let curr_dir = env::current_dir();
    if let Err(e) = curr_dir {
        dbg!(&e);
        return Err(error::Error::LINT_COMMAND_FAIL.to_string());
    }

    let curr_dir = curr_dir.unwrap();

    if work_path != curr_dir {
        if let Err(e) = env::set_current_dir(&work_path) {
            println!("lint::lint_FAIL");
            dbg!(&e);
            return Err(error::Error::LINT_COMMAND_FAIL.to_string());
        }
    }

    // find name of py files
    let rd = read_dir(&work_path);
    let fnames = _find_py_files_in(rd);
    if let Err(e) = fnames {
        println!("lint::lint_FAIL");
        dbg!(&e);
        return Ok(vec![]);
    }
    let fnames_str: Vec<String> = {
        let cwd = &work_path.to_string_lossy()
            .to_string();
        let f = fnames.unwrap();
        let res = f.iter().map(|v| {
            v.replace(cwd.as_str(), ".\\")
        }).collect();
        res
    };

    let mut args = vec!["/C","pylint", "-d", "C0114,C0115,C0116,R0903,W0301,C0103,W0311,W0125"];

    if fnames_str.is_empty() {
        return Ok(vec![]);
    }

    for name in &fnames_str {
        args.push(name.as_str());
    }

    let output = Command::new("cmd")
        .args(&args)
        .output();

    if let Err(e) = output {
        dbg!(&e);
        return Ok(vec![]);
    }

    let output = output.unwrap();

    let stdout = output.stdout;
    if stdout.is_empty() || !output.stderr.is_empty()  {
        return Ok(vec![]);
    }

    let output = from_utf8(&stdout);
    if let Err(e) = output {
        dbg!(&e);
        return Ok(vec![]);
    }
    let output = output.unwrap();


    let mut out: HashMap<String, LintInfo> = HashMap::new();
    let lines: Vec<&str> = output.split("\n").collect();

    // dbg!(&lines);
    for line in lines {
        // dbg!(&line);
        let line = line.trim();
        if line.is_empty() || line.starts_with("Your code") {
            continue;
        }

        let firstchar = line.chars().next().unwrap();
        if firstchar == '*' || firstchar == '-' {
            continue;
        }

        let mut linespl: Vec<&str> = vec![];

        let mut indexes: Vec<usize> = vec![];
        let mut index = 0;
        for ch in line.chars() {
            if indexes.len() >= 4 {
                break;
            }

            if ch == ':' {
                indexes.push(index);
            }
            index += 1;
        }
        if indexes.len() < 4 {
            continue;
        }
        linespl.push(&line[0..indexes[0]]);
        linespl.push(&line[indexes[0]+1..indexes[1]].trim());
        linespl.push(&line[indexes[2]+1..indexes[3]].trim());
        linespl.push(&line[indexes[3]+1..].trim());

        let mut info: LintInfo = LintInfo::default();
        let mut item = LintItem::default();

        info.moduleName = linespl[0].to_string();
        info.moduleName = info.moduleName.replace(".py", "");
        item.linen = linespl[1].parse::<u16>().unwrap();
        item.errorCode = linespl[2].to_string();
        let message = linespl[3].trim().to_string();
        {
            let mut endindex = 0;
            let arr_str = message.as_bytes();
            for i in ( 0..message.len() ).rev() {
                let ch = arr_str[i] as char;
                if ch == ')' {
                    endindex = i;
                }
                if ch == '(' {
                    item.errorTypeName = (&message[i+1..endindex]).to_string();
                    item.message = (&message[0..i].trim()).to_string();
                    break;
                }
            }
        }

        let ref_lint = out.get_mut(&info.moduleName);
        if let None = ref_lint {
            info.messages = vec![item];
            out.insert(info.moduleName.clone(), info);
        }
        else {
            let ref_lint = ref_lint.unwrap();
            ref_lint.messages.push(item);
        }
    }
    let out = out.values().cloned().collect();
    let profile_name = gs.get_profile();
    log_lints(&out, profile_name, &app_handle.path_resolver());
    // dbg!(&out);
    Ok(out)
}

#[tauri::command]
pub fn analyze_line(line: String, app_handle: AppHandle) -> Result<Vec<LineCodeTokens>, String> {
    let resource_path = app_handle.path_resolver()
        .resolve_resource("bundle/syntaxanalyze.py")
        .unwrap_or_default();

    if resource_path == PathBuf::new() {
        println!("Err::Resource Path to syntaxanalyze.py not found");
        return Ok(vec![]);
    }

    let rs_path_str = resource_path.to_string_lossy()
        .to_string();
    let output = Command::new("python")
        .args(&[&rs_path_str, &line])
        .output();

    if let Err(e) = output {
        dbg!(&e);
        return Ok(vec![]);
    }

    let output = output.unwrap();

    let stdout = output.stdout;
    if stdout.is_empty() || !output.stderr.is_empty()  {
        return Ok(vec![]);
    }

    let output = from_utf8(&stdout);
    if let Err(e) = output {
        dbg!(&e);
        return Ok(vec![]);
    }

    let output = output.unwrap()
        .trim();

    let out: Result<Vec<LineCodeTokens>, serde_json::error::Error> = serde_json::from_str(output);
    if let Err(e) = out {
        dbg!(&e);
        return Ok(vec![]);
    }

    Ok(out.unwrap())
}
