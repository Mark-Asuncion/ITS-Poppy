// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file;
mod state;
mod config;
#[cfg(test)]
mod tests;
mod pty;
mod error;
mod lint;

use std::fs::create_dir_all;

fn main() {
    tauri::Builder::default()
        .manage(state::GlobalState {
            work_path: Default::default(),
            pty:       Default::default()
        })
        .setup(|app| {
            let conf_path = app.path_resolver().app_data_dir();
            if let None = conf_path {
                panic!("Error Occured acquiring data dir");
            }
            let conf_path = conf_path.unwrap();
            if !conf_path.exists() {
                if let Err(e) = create_dir_all(&conf_path) {
                    dbg!(e);
                    panic!("Error occured creating data dir");
                }
            }

            let resource_path = app.path_resolver()
                .resolve_resource("bundle/syntaxanalyze.py")
                .expect("failed to resolve resource");
            dbg!(resource_path);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            file::write_diagrams_to_modules,
            file::load_modules,
            state::set_cwd,
            state::get_cwd,
            state::get_cwd_name,
            config::load_projects,
            config::new_project,
            config::open_project,
            config::del_project,
            config::load_open_project,
            config::del_tutorial_progress,
            pty::spawn_term,
            pty::write_term,
            pty::read_term,
            pty::close_term,
            pty::restart_term,
            lint::lint,
            lint::analyze_line
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
