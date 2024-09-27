use crate::config::ProjectConfig;
use crate::config::constants::PROJECT_CONFIG_NAME;
use crate::lint::{LintInfo, LintItem, _find_py_files_in};
use crate::state::GlobalState;
use core::time;
use std::collections::HashMap;
use std::env;
use std::fs::read_dir;
use std::path::PathBuf;
use std::process::Command;
use std::str::from_utf8;
use crate::pty;

const TEST_FOLDER: &str = r#"C:\Users\marka\Documents\poppy-dev\project1"#;

#[test]
fn project_config_new() {
    let pc = ProjectConfig::new("testing".to_string());
    assert!(!pc.is_empty());
}

#[test]
fn project_config_write() {
    let pc = ProjectConfig::new("testing".to_string());
    let mut path = PathBuf::from(TEST_FOLDER);
    pc.write(path.clone()).unwrap();
    path.push(PROJECT_CONFIG_NAME);
    assert!(path.exists());
}

#[test]
fn project_config_load() {
    let path = PathBuf::from(TEST_FOLDER);
    let pc = ProjectConfig::from_path(path.clone());
    assert!(!pc.is_empty());
}

// #[test]
// fn data_list_of_projects() {
//     let path = PathBuf::from(TEST_FOLDER);
//     // dbg!(data::load(path.clone()).unwrap());
//
//     let datas = vec![
//         String::from("val1"),
//         String::from("val2"),
//         String::from("val3"),
//         String::from("val4"),
//     ];
//
//     let mut data_p: Vec<PathBuf> = vec![];
//     for data in datas.clone().into_iter() {
//         data_p.push(PathBuf::from(data.clone()));
//     }
//     assert_eq!( data::append(path.clone(), datas.clone()).unwrap(),
//     () );
//
//     assert_eq!(data::load(path.clone()).unwrap(), data_p);
//
//     let datas_del = vec![
//         String::from("val2"),
//         String::from("val3"),
//     ];
//     assert_eq!( data::delete(path, datas_del).unwrap(), () );
// }

#[test]
pub fn t_term() {
    // NOTE problem if I read the first stdout and then run an invalid command
    // output becomes messedup sh**** solution create 2 instance 1 is for reading the first output and delete it
    let pty = pty::init(TEST_FOLDER);
    let gs = GlobalState {
        work_path: Default::default(),
        pty:       Default::default()
    };

    {
        gs.add_pty(pty.unwrap());
        let instance = &mut (*gs.pty.lock().expect(""));
        let instance = instance.as_mut().unwrap();

        // let buf = &instance.read();
        // println!("{}{}", cls, buf);

        // instance.write("python\r\n").unwrap();

        // let w = format!("{}ir\n\r\n", EscapeCodes::DEL.to_string());
        // instance.write(&w).unwrap();
        instance.write("python\r\n").unwrap();
        // instance.write("\x03").unwrap();

        let mut buf = instance.read();
        buf += &instance.read();
        println!("{}", buf);
        buf = instance.read();
        println!("{}", buf);

        // std::thread::sleep(time::Duration::from_secs(5));
        dbg!(instance.is_alive());
        dbg!(instance.exit_status());
        std::thread::sleep(time::Duration::from_secs(10));
    }
    {
        let mut guard = gs.pty.lock().expect("");
        let term = guard.take();
        drop(term);
    }

    dbg!(&gs);
    // dbg!(instance.is_alive());
    // dbg!(instance.exit_status());

    // dbg!(instance.write("dir\r\n"));
    // buf = instance.read();
    // println!("{}", buf);
    // assert!(!instance.is_alive());

    // instance.write("10+2\r\n").unwrap();

    // let buf = &instance.read();
    // println!("{}{}", cls, buf);

    // instance.write("d\r\n").unwrap();
    //
    // let buf = &instance.read();
    // println!("{}", buf);
}

#[test]
pub fn t_lint() -> Result<(), String> {
    let work_path = PathBuf::from("C:\\Users\\marka\\Documents\\poppy-dev\\test1");

    let curr_dir = env::current_dir();
    if let Err(e) = curr_dir {
        dbg!(&e);
        return Err(format!("lint::lint_FAIL {}", e));
    }

    let curr_dir = curr_dir.unwrap();

    if work_path != curr_dir {
        if let Err(e) = env::set_current_dir(&work_path) {
            dbg!(&e);
            return Err(format!("lint::lint_FAIL {}", e));
        }
    }

    // find name of py files
    let rd = read_dir(&work_path);
    let fnames = _find_py_files_in(rd);
    if let Err(e) = fnames {
        println!("lint::lint_FAIL");
        dbg!(&e);
        return Err(format!("lint::lint_FAIL {}", e));
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
    for name in &fnames_str {
        args.push(name.as_str());
    }

    let output = Command::new("cmd")
        .args(&args)
        .output();

    dbg!(&args);

    if let Err(e) = output {
        dbg!(&e);
        return Err(format!("lint::lint_FAIL {}", e));
    }

    let output = output.unwrap();
    dbg!(&output);

    let stdout = output.stdout;

    if stdout.is_empty() || !output.stderr.is_empty()  {
         return Err(crate::error::Error::LINT_COMMAND_FAIL.to_string());
    }

    let output = from_utf8(&stdout);
    if let Err(e) = output {
        dbg!(&e);
        return Err(format!("lint::lint_FAIL {}", e));
    }
    let output = output.unwrap();


    let mut out: HashMap<String, LintInfo> = HashMap::new();
    let lines: Vec<&str> = output.split("\n").collect();

    for line in lines {
        let line = line.trim();
        if line.is_empty() || line.starts_with("Your code") {
            continue;
        }

        let firstchar = line.chars().next().unwrap();
        if firstchar == '*' || firstchar == '-' {
            continue;
        }

        let mut linespl: Vec<&str> = vec![];
        {
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
            linespl.push(&line[0..indexes[0]]);
            linespl.push(&line[indexes[0]+1..indexes[1]].trim());
            linespl.push(&line[indexes[2]+1..indexes[3]].trim());
            linespl.push(&line[indexes[3]+1..].trim());
            assert!(linespl.len() == 4);
        }
        dbg!(&linespl);

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
    let out: Vec<LintInfo> = out.values().cloned().collect();
    dbg!(out);
    Ok(())
}
