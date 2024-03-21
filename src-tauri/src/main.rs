// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file;
mod state;
mod config;

use tauri::api::path;

fn main() {
    tauri::Builder::default()
        .manage(state::GlobalState {
            config: Default::default(),
            work_path: Default::default(),
        })
        .setup(|app| {
            dbg!(path::app_config_dir(app.config().as_ref()));
            use std::path::PathBuf;
            let p = PathBuf::from("C:/Users/marka");
            dbg!(&p, p.exists());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            file::write_diagrams_to_modules,
            state::set_cwd,
            state::get_cwd,
            state::get_cwd_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
