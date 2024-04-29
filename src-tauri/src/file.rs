use serde::{ Serialize, Deserialize };
use std::{
    fs::{File, rename, self, create_dir_all, read_dir, ReadDir},
    path::{ PathBuf, Path },
    io::{self, Write, Read}
};

use crate::{state::GlobalState, config::constants::{PROJECT_CONFIG_NAME, DOTPOPPY}};
use tauri::State;

pub fn open_write(path: &Path) -> io::Result<File> {
    File::options()
        .create(true)
        .truncate(true)
        .write(true)
        .open(path)
}

pub fn open_append(path: &Path) -> io::Result<File> {
    File::options()
        .create(true)
        .append(true)
        .open(path)
}

pub fn open_read(path: &Path) -> io::Result<File> {
    File::options()
        .read(true)
        .open(path)
}

pub fn write_with_temp_to(mut path: PathBuf, content: String) -> io::Result<()> {
    let p = path.clone();
    let mut f_name = path.file_name()
        .unwrap_or_default()
        .to_str()
        .unwrap_or("tmp");

    let f_name = String::from(".") + f_name;
    path.set_file_name(f_name);

    let mut file = open_write(&path)?;
    file.write_all(content.as_bytes())?;
    rename( path, PathBuf::from(p.clone()))?;
    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Module {
    pub name: String,
    pub content: String
}

impl Default for Module {
    fn default() -> Self {
        Self {
            name: Default::default(),
            content: Default::default()
        }
    }
}

impl Module {
    async fn write(&self, mut cwd: PathBuf) -> io::Result<()> {
        if cwd.exists() && cwd.is_file() {
            return Err(io::Error::new(io::ErrorKind::Other, "Path must be a directory"));
        }
        cwd.push(self.name.as_str());
        let opt_parent = cwd.parent();
        if let Some(p) = opt_parent {
            if !p.exists() {
                create_dir_all(p)?
            }
        }
        cwd.set_extension("py");

        dbg!(&cwd);
        let mut file_tmp_path = cwd.clone();
        let fname = file_tmp_path.file_name()
            .unwrap_or_default()
            .to_str()
            .unwrap_or_default()
            .to_string();
        let tmp_fname = ".".to_string() + &fname;
        file_tmp_path.set_file_name(tmp_fname);
        dbg!(&file_tmp_path);

        let mut file_tmp = open_write(&file_tmp_path)?;
        file_tmp.write_all(self.content.as_bytes())?;

        if cwd.exists() {
            dbg!(&cwd);
            fs::remove_file(&cwd)?
        }
        rename(&file_tmp_path, cwd)?;
        Ok(())
    }

    fn load(path: &Path) -> io::Result<Self> {
        if !path.exists() {
            return Ok( Default::default() );
        }

        let mut file_name = path.file_name()
            .unwrap()
            .to_string_lossy()
            .to_string();
        // file_name = file_name.replace(".py", "");
        let mut file = open_read(path)?;
        let mut buf = String::new();
        file.read_to_string(&mut buf)?;
        Ok(Self {
            name: file_name,
            content: buf
        })
    }
}

fn _should_ignore(path: &Path) -> bool {
    let file_name = path.file_name()
        .unwrap()
        .to_string_lossy()
        .to_string();
    match file_name.as_str() {
        PROJECT_CONFIG_NAME | DOTPOPPY => return true,
        _ => return false
    }

}

fn _load_modules(cwd: &Path, rd: ReadDir) -> io::Result<Vec<Module>> {
    let mut list: Vec<Module> = vec![];
    for entry in rd {
        let entry = entry?;
        let path = entry.path();
        if _should_ignore(&path) {
            continue;
        }
        if path.is_dir() {
            let prd = read_dir(path)?;
            let l = _load_modules(cwd, prd)?;
            l.into_iter()
                .for_each(|v| {
                    list.push(v);
                });
        }
        else {
            let mut md = Module::load(&path)?;
            let mut cwd_str = cwd.to_string_lossy().to_string();
            let path = path.to_string_lossy().to_string();
            cwd_str += "\\";
            let mut new_name = path.replace(cwd_str.as_str(), "")
                .replace(".py", "")
                .to_string();
            new_name = new_name.trim()
                .to_string();
            md.name = new_name;
            list.push(md);
        }
    }
    Ok( list )
}

#[tauri::command]
pub fn load_modules(gs: State<GlobalState>) -> Vec<Module> {
    let work_path = gs.get_work_path_clone();
    if !work_path.exists() {
        return vec![];
    }

    let dirs = read_dir(&work_path);
    if let Err(e) = dirs {
        dbg!(e);
        todo!("display err");
    }
    let list = _load_modules(&work_path, dirs.unwrap());
    if let Err(e) = list {
        dbg!(e);
        todo!("display err");
    }
    list.unwrap()
}

#[tauri::command]
pub async fn write_diagrams_to_modules(modules: String, gs: State<'_, GlobalState>) -> Result<(),()> {
    use serde_json::from_str;
    use crate::state::errors::FAIL_ACQ_STATE_CWD;
    use std::collections::HashMap;
    match from_str(modules.as_str()) {
        Ok(v) => {
            let mut modules: Vec<Module> = v;
            let cwd = (*gs.work_path.lock()
                .expect(FAIL_ACQ_STATE_CWD))
                .clone();
            if cwd == PathBuf::new() {
                return Ok(());
            }
            let mut names: HashMap<&String, u8> = HashMap::new();
            for module in modules.iter_mut() {
                if let Some(v) = names.get(&module.name) {
                    module.name += &(*v).to_string();
                }
                dbg!(&module);
                if let Err(e) = module.write(cwd.clone()).await {
                    dbg!(e);
                    continue;
                }
                match names.get_mut(&module.name) {
                    Some(v) => *v += 1,
                    None => {
                        names.insert(&module.name, 1);
                    },
                }
            }

            dbg!(&modules);
        }
        Err(e) => {
            dbg!(e);
        }
    }
    Ok(())
}
