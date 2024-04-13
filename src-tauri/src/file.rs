use serde::{ Serialize, Deserialize };
use std::{
    fs::{File, rename, self},
    path::{ PathBuf, Path },
    io::{self, Write}
};

use crate::state::GlobalState;
use tauri::State;

fn open_write(path: &Path) -> io::Result<File> {
    File::options()
        .create(true)
        .truncate(true)
        .write(true)
        .open(path)
}

#[tauri::command]
pub fn write_with_temp_to(p: String, content: String) {
    let mut path = PathBuf::from(p.clone());
    let mut f_name = path.file_name()
        .unwrap_or_default()
        .to_str()
        .unwrap_or("tmp");
    if f_name.is_empty() {
        f_name = "tmp";
    }

    let f_name = String::from(".") + f_name;
    path.set_file_name(f_name);

    match open_write(&path) {
        Ok(mut v) => {
            if let Err(e) = v.write_all(content.as_bytes()) {
                dbg!(e);
                return;
            }
            if let Err(e) = rename(
                path,
                PathBuf::from(p.clone())
            ) {
                dbg!(e);
                return;
            }
        },
        Err(e) => {
            dbg!(e);
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Module {
    pub name: String,
    pub content: String
}

impl Module {
    async fn write(&self, mut cwd: PathBuf) -> io::Result<()> {
        if cwd.exists() && cwd.is_file() {
            return Err(io::Error::new(io::ErrorKind::Other, "Path must be a directory"));
        }
        cwd.push(self.name.as_str());
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
            fs::remove_file(&cwd)?
        }
        rename(&file_tmp_path, cwd)?;
        Ok(())
    }
}

#[tauri::command]
pub async fn write_diagrams_to_modules(modules: String, gs: State<'_, GlobalState>) -> Result<(),()> {
    use serde_json::from_str;
    use crate::state::FAIL_ACQ_STATE_CWD;
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
