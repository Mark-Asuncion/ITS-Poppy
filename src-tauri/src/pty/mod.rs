pub mod instance;
// pub mod escape_codes;

use std::ffi::OsString;
use tauri::State;
use winptyrs::{PTY, PTYArgs, MouseMode, AgentConfig, PTYBackend};

use crate::{error, state::{errors::FAIL_ACQ_PTY, GlobalState}};

pub fn init(cwd: &str) -> Result<PTY, OsString> {

    let cwd = OsString::from(cwd);
    let cmd = OsString::from("c:\\windows\\system32\\cmd.exe");
    let pty_args = PTYArgs {
        cols: 80,
        rows: 25,
        mouse_mode: MouseMode::WINPTY_MOUSE_MODE_NONE,
        timeout: 10000,
        agent_config: AgentConfig::WINPTY_FLAG_COLOR_ESCAPES
    };

    let mut pty = PTY::new_with_backend(&pty_args, PTYBackend::ConPTY)?;
    pty.spawn(cmd, None, Some(cwd), None)?;
    Ok(pty)
}

#[tauri::command]
pub fn spawn_term(gs: State<'_, GlobalState>) -> Result<(), error::Error> {
    let cwd = gs.get_work_path_as_string();
    let pty = init(&cwd);
    if let Err(e) = pty {
        dbg!(e);
        return Err(error::Error::PTY_NOT_INSTANTIATED);
    }
    // println!("pty::spawn_term::ok");
    gs.add_pty(pty.unwrap());
    Ok(())
}

#[tauri::command]
pub fn write_term(gs: State<'_, GlobalState>, command: String) -> Result<u32, error::Error> {
    let term = &mut (*gs.pty.lock().expect(FAIL_ACQ_PTY));
    if let None = term {
        return Err(error::Error::PTY_NOT_INSTANTIATED);
    }
    let term = term.as_mut().unwrap();
    let bytes = term.write(&command);
    if let Err(e) = bytes {
        dbg!(e);
        return Err(error::Error::PTY_WRITE_FAIL);
    }
    let bytes = bytes.unwrap();
    // println!("pty::write_term::ok::bytes={}, command={}", bytes, command);
    // println!("=================");
    Ok(bytes)
}

#[tauri::command]
pub fn read_term(gs: State<'_, GlobalState>) -> Result<String, error::Error> {
    let term = & (*gs.pty.lock().expect(FAIL_ACQ_PTY));
    if let None = term {
        return Err(error::Error::PTY_NOT_INSTANTIATED);
    }
    let term = term.as_ref().unwrap();
    let buf = term.read();
    // println!("pty::read_term::ok::buf={:?}, buf={}", &buf, &buf);
    // println!("=================");
    Ok(buf)
}

#[tauri::command]
pub fn close_term(gs: State<'_, GlobalState>) {
    let term = &mut (*gs.pty.lock().expect(FAIL_ACQ_PTY));
    *term = None;
    // println!("pty::close_term::ok");
}

#[tauri::command]
pub fn restart_term(gs: State<'_, GlobalState>) -> Result<(), error::Error> {
    {
        let term = &mut (*gs.pty.lock().expect(FAIL_ACQ_PTY));
        *term = None;
    }

    let cwd = gs.get_work_path_as_string();
    let pty = init(&cwd);
    if let Err(e) = pty {
        dbg!(e);
        return Err(error::Error::PTY_NOT_INSTANTIATED);
    }
    gs.add_pty(pty.unwrap());

    // println!("pty::restart_term::ok");
    Ok(())
}
