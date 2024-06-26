use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

pub mod errors {
    pub const FAIL_ACQ_STATE_CWD: &str = "err: failed to acquire GlobalState::work_path";
    // pub const FAIL_ACQ_STATE_DATA: &str = "err: failed to acquire GlobalState::config";
}

pub struct GlobalState {
    pub work_path: Mutex<PathBuf>,
}

impl GlobalState {
    pub fn set_work_path(&self, p: PathBuf) {
        (*self.work_path
            .lock()
            .expect(errors::FAIL_ACQ_STATE_CWD)) = p.to_owned()
    }

    pub fn get_work_path_clone(&self) -> PathBuf {
        (*self.work_path
            .lock()
            .expect(errors::FAIL_ACQ_STATE_CWD))
            .clone()
    }

    fn get_work_path_as_string(&self) -> String {
        (*self.work_path
            .lock()
            .expect(errors::FAIL_ACQ_STATE_CWD))
            .to_string_lossy()
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
    let cwd = gs.get_work_path_clone();
    cwd.file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string()
}
