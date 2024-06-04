pub mod instance;
pub mod escape_codes;

use std::ffi::OsString;
use tauri::State;
use winptyrs::{PTY, PTYArgs, MouseMode, AgentConfig, PTYBackend};

use crate::{error, state::{errors::FAIL_ACQ_PTY_LIST, GlobalState}};

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
pub fn spawn_term(gs: State<'_, GlobalState>) {
    let cwd = gs.get_work_path_as_string();
    let pty = init(&cwd);
    if let Err(e) = pty {
        dbg!(e);
        todo!("Show error window");
    }
    gs.add_pty(pty.unwrap());
}

#[tauri::command]
pub fn write_term(gs: State<'_, GlobalState>, command: String) -> Result<u32, error::Error> {
    let term = &mut (*gs.pty.lock().expect(FAIL_ACQ_PTY_LIST));
    if let None = term {
        return Err(error::Error::PTY_NOT_INSTANTIATED);
    }
    let term = term.as_mut().unwrap();
    let bytes = term.write(&command);
    if let Err(e) = bytes {
        dbg!(e);
        return Err(error::Error::PTY_WRITE_FAIL);
    }
    Ok(bytes.unwrap())
}

#[tauri::command]
pub fn read_term(gs: State<'_, GlobalState>) -> Result<String, error::Error> {
    let term = & (*gs.pty.lock().expect(FAIL_ACQ_PTY_LIST));
    if let None = term {
        return Err(error::Error::PTY_NOT_INSTANTIATED);
    }
    let term = term.as_ref().unwrap();
    Ok(term.read())
}

#[tauri::command]
pub fn close_term(gs: State<'_, GlobalState>) -> Result<u32, error::Error> {
    let term = &mut (*gs.pty.lock().expect(FAIL_ACQ_PTY_LIST));
    if let None = term {
        return Err(error::Error::PTY_NOT_INSTANTIATED);
    }
    let term = term.as_mut().unwrap();

    let res = term.close();
    dbg!(res.unwrap_or_default());

    if term.is_alive() {
        return Err(error::Error::PTY_FAIL_TO_CLOSE);
    }

    let status = term.exit_status().unwrap_or_default();
    dbg!(status);

    Ok(status)
}
