use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

use crate::config::Config;

pub const FAIL_ACQ_STATE_CWD: &str = "err: failed to acquire GlobalState::work_path";
const FAIL_ACQ_STATE_PROJ: &str = "err: failed to acquire GlobalState::proj_name";

pub struct GlobalState {
    pub config: Mutex<Config>,
    pub work_path: Mutex<PathBuf>,
}

impl GlobalState {
    fn set_work_path(&self, p: PathBuf) {
        (*self.work_path
            .lock()
            .expect(FAIL_ACQ_STATE_CWD)) = p.to_owned()
    }

    fn get_work_refpath(&self) -> PathBuf {
        (*self.work_path
            .lock()
            .expect(FAIL_ACQ_STATE_CWD))
            .clone()
    }

    fn get_work_path_as_string(&self) -> String {
        (*self.work_path
            .lock()
            .expect(FAIL_ACQ_STATE_CWD))
            .as_os_str()
            .to_str()
            .unwrap_or_default()
            .to_string()
    }
}

#[tauri::command]
pub fn set_cwd(p: String, gs: State<GlobalState>) {
    let path = PathBuf::from(p);
    dbg!(&path);
    gs.set_work_path(path);
}

#[tauri::command]
pub fn get_cwd(gs: State<GlobalState>) -> String {
    gs.get_work_path_as_string()
}

#[tauri::command]
pub fn get_cwd_name(gs: State<GlobalState>) -> String {
    let cwd = gs.get_work_refpath();
    cwd.file_name()
        .unwrap_or_default()
        .to_str()
        .unwrap_or_default()
        .to_string()
}
