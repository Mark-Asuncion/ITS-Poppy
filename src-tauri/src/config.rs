use serde::{ Serialize, Deserialize, ser::SerializeStruct };
use std::{path::PathBuf, io::{Read, self}, fs::create_dir};
use tauri::{ State, AppHandle };

use crate::{file::{open_read, self}, state::GlobalState};

pub mod constants {
    pub const PROJECT_CONFIG_NAME: &str = "project-info.json";
    pub const F_DATA: &str = "poppy.projects";
    pub const FORMAT_DATETIME: &str = "%m/%d/%Y %H:%M";
    pub const DOTPOPPY: &str = ".poppy";
}

pub mod data {
    use std::io;
    use std::io::{Read, Write};
    use std::path::PathBuf;
    use crate::file::{self, open_write};
    use super::constants;

    pub fn load(mut path: PathBuf) -> io::Result<Vec<PathBuf>> {
        path.push(constants::F_DATA);
        if !path.exists() {
            return Ok(vec![]);
        }
        let mut file = file::open_read(&path)?;
        let mut buf = String::new();
        file.read_to_string(&mut buf)?;
        if buf.is_empty() {
            return Ok(vec![]);
        }
        let mut v_paths: Vec<PathBuf> = vec![];
        let paths: Vec<&str> = buf.split("\r\n").collect();
        for path in paths {
            v_paths.push(PathBuf::from(path));
        }
        Ok(v_paths)
    }

    pub fn append(mut path: PathBuf, data: Vec<String>) -> io::Result<()> {
        path.push(constants::F_DATA);
        let mut file =  file::open_append(&path)?;
        let data= data.join("\r\n").to_string() + "\r\n";
        file.write_all(data.as_bytes())?;
        Ok(())
    }

    pub fn delete(mut path: PathBuf, val: Vec<String>) -> io::Result<()> {
        use std::collections::HashSet;
        let projects = load(path.clone())?;
        if projects.is_empty() {
            return Ok(());
        }
        path.push(constants::F_DATA);
        let mut to_del: HashSet<String> = HashSet::new();
        for v in val.into_iter() {
            to_del.insert(v);
        }
        let remain: Vec<String> = projects.into_iter()
            .filter(|v| {
                let s = v.to_string_lossy()
                    .to_string();
                !to_del.contains(&s)
            })
            .map(|v| v.to_string_lossy().to_string())
            .collect();
        let remain = remain.join("\r\n");
        let mut file = open_write(&path)?;
        file.write_all(remain.as_bytes())?;
        Ok(())
    }
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ProjectConfig {
    projectName: String,
    author: String,
    createdAt: String
}

#[derive(Deserialize, Debug)]
pub struct ProjectInfo {
    path: String,
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
    fn new(path: &str, config: ProjectConfig) -> Self {
        Self {
            path: path.into(),
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
#[tauri::command]
pub fn load_projects(app_handle: AppHandle) -> Vec<ProjectInfo> {
    let data_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let projects_path = data::load(data_dir);
    if let Err(e) = projects_path {
        dbg!(e);
        todo!("err message");
    }

    let mut projects_config: Vec<ProjectInfo> = vec![];

    for project_path in projects_path.unwrap().into_iter() {
        let project_path_str = project_path.to_string_lossy().to_string();
        let proj_conf = ProjectConfig::from_path(project_path);
        if proj_conf.is_empty() {
            continue;
        }
        let info = ProjectInfo::new(&project_path_str, proj_conf);
        projects_config.push(info);
    }
    projects_config
}

#[tauri::command]
pub fn new_project(name: String, path: String, app_handle: AppHandle) {
    let path_to_proj = PathBuf::from(path.clone());
    if !path_to_proj.exists() {
        if let Err(e) = create_dir(&path_to_proj) {
            dbg!(e);
            todo!("show error window cannot create dir at ...")
        }
    }
    let proj_conf = ProjectConfig::new(name);
    if let Err(e) = proj_conf.write(path_to_proj.clone()) {
        dbg!(e);
        return;
    }

    let data_path = app_handle.path_resolver().app_data_dir().unwrap_or_default();
    if let Err(e) = data::append(data_path, vec![path]) {
        dbg!(e);
        return;
    }
}

#[tauri::command]
pub fn open_project(path: String, gs: State<GlobalState>) {
    let path = PathBuf::from(path);
    let proj_conf = ProjectConfig::from_path(path.clone());
    if proj_conf.is_empty() {
        dbg!("Not a project directory");
        todo!("err message");
    }
    gs.set_work_path(path);
}

#[tauri::command]
pub fn load_open_project(path: String, app_handle: AppHandle) {
    let pathb = PathBuf::from(path.as_str());
    if !pathb.exists() {
        return;
    }
    let proj_conf = ProjectConfig::from_path(pathb.clone());
    if proj_conf.is_empty() {
        return;
    }
    let data_path = app_handle.path_resolver().app_data_dir().unwrap_or_default();
    if let Err(e) = data::append(data_path, vec![path]) {
        dbg!(e);
    }
}

#[tauri::command]
pub fn del_project(path: String, app_handle: AppHandle) -> u8 {
    let data_path = app_handle.path_resolver().app_data_dir().unwrap_or_default();
    if let Err(e) = data::delete(data_path, vec![path]) {
        dbg!(e);
        todo!("err message");
    }
    0
}
