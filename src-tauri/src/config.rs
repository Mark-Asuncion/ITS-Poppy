use serde::{ Serialize, Deserialize, ser::SerializeStruct };
use std::{path::{PathBuf, Path}, io::{Read, self, Write}, fs::{create_dir, create_dir_all, remove_dir_all, read_dir, remove_file}};
use tauri::{ State, AppHandle };
use tauri::PathResolver;

use crate::{file::{open_read, self}, state::GlobalState, error};

pub mod constants {
    use std::fs::create_dir;
    use std::path::PathBuf;

    pub const PROJECT_CONFIG_NAME: &str = "project-info.json";
    pub const F_DATA: &str = "poppy.json";
    pub const D_LOGS: &str = "logs";
    pub const FORMAT_DATETIME: &str = "%m/%d/%Y %H:%M";
    pub const DOTPOPPY: &str = ".poppy";
    pub const DOT_MODULE_POSITIONS: &str = "positions.json";

    pub fn get_dot_poppy(mut cwd: PathBuf) -> Option<PathBuf> {
        cwd.push(DOTPOPPY);
        if !cwd.exists() {
            let res = create_dir(&cwd);
            if let Err(e) = res {
                dbg!(e);
                return None;
            }
        }
        Some(cwd)
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AppConfig {
    projects: Vec<PathBuf>,
    profiles: Option<Vec<String>>
}

impl AppConfig {
    pub fn load(path_resolver: &PathResolver) -> io::Result<Self> {
        // immediate fail if data dir cannot be obtained
        // because no fallback
        let mut data_dir = path_resolver.app_data_dir()
            .expect(error::Error::DATA_DIR_FAIL.to_string().as_str());

        if let Err(e) = create_dir_all(data_dir.as_path()) {
            println!("{}::{}", error::Error::DATA_DIR_CREATE_FAIL, e);
            return Err(e);
        }

        data_dir.push(constants::F_DATA);

        if !data_dir.exists() {
            return Ok(
                AppConfig {
                    projects: Vec::new(),
                    profiles: None
                }
            );
        }

        let f = file::open_read(&data_dir);
        if let Err(e) = f {
            let path_name = data_dir.to_string_lossy().to_string();
            println!(
                "{}, path={}::{}",
                error::Error::FILE_OPEN_FAIL,
                path_name, e
            );
            return Err(e);
        }
        let mut f = f.unwrap();
        let mut content: String = String::new();
        f.read_to_string(&mut content).unwrap();

        let err_msg = format!("Error Occured Reading {}", &content);
        let appconfig: Self = serde_json::from_str(content.as_str())
            .expect(err_msg.as_str());

        Ok(appconfig)
    }

    pub fn write(&self, path_resolver: &PathResolver) -> io::Result<()> {
        let mut data_dir = path_resolver.app_data_dir()
            .expect(error::Error::DATA_DIR_FAIL.to_string().as_str());

        if let Err(e) = create_dir_all(data_dir.as_path()) {
            println!("{}::{}", error::Error::DATA_DIR_CREATE_FAIL, e);
            return Err(e);
        }
        data_dir.push(constants::F_DATA);

        let f = file::open_write(&data_dir);
        if let Err(e) = f {
            let path_name = data_dir.to_string_lossy().to_string();
            println!(
                "{}, path={}::{}",
                error::Error::FILE_OPEN_FAIL,
                path_name, e
            );
            return Err(e);
        }
        let mut f = f.unwrap();

        let content = serde_json::to_string_pretty(&self);
        if let Err(e) = &content {
            println!("Conversion Error {}", e);
        }
        let content = content.unwrap_or_default();

        if let Err(e) = f.write_all(content.as_bytes()) {
            let path_name = data_dir.to_string_lossy().to_string();
            println!(
                "{}, path={}::{}",
                error::Error::FILE_WRITE_FAIL,
                path_name, e
            );
            return Err(e);
        }

        Ok(())
    }

    pub fn delete(path_resolver: &PathResolver) -> io::Result<()> {
        let mut data_dir = path_resolver.app_data_dir()
            .expect(error::Error::DATA_DIR_FAIL.to_string().as_str());

        data_dir.push(constants::F_DATA);
        if data_dir.exists() {
            remove_file(&data_dir)?;
        }

        Ok(())
    }

    pub fn append_project(&mut self, path: PathBuf) {
        let proj_conf_check = ProjectConfig::from_path(path.clone());
        if proj_conf_check.is_empty() {
            let path_name = path.to_string_lossy().to_string();
            print!("Path {} is not a poppy project", path_name);
            return;
        }
        let mut is_appended;

        let new_p_str = path.to_string_lossy().to_string();
        for p in self.projects.clone().into_iter() {
            let p_str = p.to_string_lossy().to_string();
            is_appended = p_str == new_p_str;
            if is_appended {
                return;
            }
        }
        self.projects.push(path);
    }

    pub fn delete_project(&mut self, path_name: String) {
        self.projects = self.projects.clone().into_iter().filter(|v| {
            let v_str = v.to_string_lossy().to_string();
            return !(path_name == v_str);
        }).collect();
    }

    pub fn get_or_set_default_profile(&mut self) -> String {
        if let None = self.profiles {
            self.profiles = Some(Vec::from(["Profile1".to_string()]));
        }
        self.profiles.clone().unwrap()[0].clone()
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ProjectConfig {
    projectName: String,
    author: String,
    createdAt: String
}

// To make sure that the paths is generated by the app
#[derive(Deserialize, Debug)]
pub struct ProjectInfo {
    path: PathBuf,
    config: ProjectConfig
}

impl serde::Serialize for ProjectInfo {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer {
        let mut s = serializer.serialize_struct("ProjectInfo", 4)?;
        s.serialize_field("path", &self.path)?;
        s.serialize_field("projectName", &self.config.projectName)?;
        s.serialize_field("author", &self.config.author)?;
        s.serialize_field("createdAt", &self.config.createdAt)?;
        s.end()
    }
}

impl ProjectInfo {
    fn new(path: PathBuf, config: ProjectConfig) -> Self {
        Self {
            path,
            config
        }
    }
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            projectName: Default::default(),
            author: Default::default(),
            createdAt: Default::default()
        }
    }
}

impl ProjectConfig {
    pub fn new(project_name: String) -> Self {
        let t = chrono::offset::Local::now()
            .format(constants::FORMAT_DATETIME)
            .to_string();
        let user = whoami::username();
        Self {
            projectName: project_name,
            author: user,
            createdAt: t
        }
    }

    pub fn from_path(mut path: PathBuf) -> Self {
        path.push(constants::PROJECT_CONFIG_NAME);
        if !path.exists() {
            return Default::default();
        }
        match open_read(&path) {
            Ok(mut v) => {
                let mut buf = String::new();
                if let Err(e) = v.read_to_string(&mut buf) {
                    dbg!(e);
                    return Default::default();
                }
                let res_projconf = serde_json::from_str(buf.as_str());
                if let Err(e) = res_projconf {
                    dbg!(e);
                    return Default::default();
                }
                return res_projconf.unwrap();

            },
            Err(e) => { dbg!(e); () }
        }
        return Default::default();
    }

    pub fn is_empty(&self) -> bool {
        self.projectName.is_empty() &&
        self.author.is_empty() &&
        self.createdAt.is_empty()
    }

    pub fn write(&self, mut path: PathBuf) -> io::Result<()> {
        path.push(constants::PROJECT_CONFIG_NAME);
        let proj_conf_j = serde_json::to_string(self)
            .expect("should not happen");
        file::write_with_temp_to(path, proj_conf_j)?;
        Ok(())
    }
}

// ================================
//      == TAURI COMMANDS ==
// ================================

#[tauri::command]
pub fn load_projects(app_handle: AppHandle) -> Result<Vec<ProjectInfo>, String> {
    let appconfig = AppConfig::load(&app_handle.path_resolver());
    if let Err(e) = appconfig {
        dbg!(&e);
        return Err(e.to_string());
    }
    let mut appconfig = appconfig.unwrap();
    let projects_path = appconfig.projects.clone();

    let mut projects_config: Vec<ProjectInfo> = vec![];
    let mut to_del: Vec<String> = vec![];

    // double check paths if it contains the poppy config file
    for project_path in projects_path.into_iter() {
        let proj_conf = ProjectConfig::from_path(project_path.clone());
        if proj_conf.is_empty() {
            let project_path_str = project_path.to_string_lossy().to_string();
            to_del.push(project_path_str);
            continue;
        }
        let info = ProjectInfo::new(project_path.clone(), proj_conf);
        projects_config.push(info);
    }

    for path in to_del {
        appconfig.delete_project(path);
    }

    if let Err(e) = appconfig.write(&app_handle.path_resolver()) {
        dbg!(&e);
        return Err(e.to_string());
    }

    Ok(projects_config)
}

#[tauri::command]
pub fn new_project(name: String, path: String, app_handle: AppHandle) -> Result<(), String> {
    let mut path_to_proj = PathBuf::from(path.clone());
    path_to_proj.push(&name);
    if !path_to_proj.exists() {
        if let Err(e) = create_dir(&path_to_proj) {
            dbg!(&e);
            return Err(e.to_string());
        }
    }
    let proj_conf = ProjectConfig::new(name);
    if let Err(e) = proj_conf.write(path_to_proj.clone()) {
        dbg!(&e);
        return Err(e.to_string());
    }

    let appconfig = AppConfig::load(&app_handle.path_resolver());
    if let Err(e) = appconfig {
        dbg!(&e);
        return Err(e.to_string());
    }

    let mut appconfig = appconfig.unwrap();
    appconfig.append_project(PathBuf::from(path_to_proj));
    if let Err(e) = appconfig.write(&app_handle.path_resolver()) {
        dbg!(&e);
        return Err(e.to_string());
    }
    Ok(())
}

#[tauri::command]
pub fn open_project(path: String, gs: State<GlobalState>) -> Result<(), String> {
    let path = PathBuf::from(path);
    let proj_conf = ProjectConfig::from_path(path.clone());
    if proj_conf.is_empty() {
        return Err(String::from("Not a Project Directory"));
    }
    gs.set_work_path(path);
    Ok(())
}

// Load a poppy projects and append it to the list
// doesn't actually open the project
#[tauri::command]
pub fn load_open_project(path: String, app_handle: AppHandle) -> Result<(), String> {
    let pathb = PathBuf::from(path.as_str());
    if !pathb.exists() {
        return Ok(());
    }
    let proj_conf = ProjectConfig::from_path(pathb.clone());
    if proj_conf.is_empty() {
        return Ok(());
    }

    let appconfig = AppConfig::load(&app_handle.path_resolver());
    if let Err(e) = appconfig {
        dbg!(&e);
        return Err(e.to_string());
    }
    let mut appconfig = appconfig.unwrap();

    appconfig.append_project(PathBuf::from(path));
    if let Err(e) = appconfig.write(&app_handle.path_resolver()) {
        dbg!(&e);
        return Err(e.to_string());
    }
    Ok(())
}

#[tauri::command]
pub fn del_project(path: String, app_handle: AppHandle) -> Result<(), String> {
    let appconfig = AppConfig::load(&app_handle.path_resolver());
    if let Err(e) = appconfig {
        dbg!(&e);
        return Err(e.to_string());
    }
    let mut appconfig = appconfig.unwrap();

    appconfig.delete_project(path);
    if let Err(e) = appconfig.write(&app_handle.path_resolver()) {
        dbg!(&e);
        return Err(e.to_string());
    }
    Ok(())
}

fn _delete_dir_contents(p: PathBuf) -> io::Result<()> {
    let rd = read_dir(p)?;

    for entry in rd {
        let entry = entry?;
        let path = entry.path();

        if path.is_dir() {
            remove_dir_all(path)?;
        }
        else if path.is_file() {
            remove_file(path)?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn del_tutorial_progress(gs: State<GlobalState>) {
    let p = gs.get_work_path_clone();
    let pr = p.parent().unwrap_or(Path::new(""));
    if pr == Path::new("") {
        return;
    }
    let pr_path_stem = pr.file_stem().unwrap_or_default();
    if pr_path_stem == "tutorials" && p.exists() {
        if let Err(e) = _delete_dir_contents(p) {
            dbg!(&e);
        }
    }
    gs.set_work_path(PathBuf::new());
}
