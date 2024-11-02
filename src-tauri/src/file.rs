use serde::{ Serialize, Deserialize };
use std::{
    fs::{File, rename, create_dir_all, read_dir, ReadDir, remove_file},
    path::{ PathBuf, Path },
    io::{self, Write, Read}, collections::HashSet
};
use std::collections::HashMap;

use crate::{state::GlobalState, config::constants::{PROJECT_CONFIG_NAME, DOTPOPPY, get_dot_poppy, DOT_MODULE_POSITIONS}};
use crate::error;
use crate::config::constants;
use tauri::{State, AppHandle};

pub fn open_write(path: &Path) -> io::Result<File> {
    File::options()
        .create(true)
        .truncate(true)
        .write(true)
        .open(path)
}

#[allow(dead_code)]
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
    let f_name = path.file_name()
        .unwrap_or_default()
        .to_str()
        .unwrap_or("tmp");

    let f_name = String::from(".") + f_name;
    path.set_file_name(f_name);

    let mut file = open_write(&path)?;
    file.write_all(content.as_bytes())?;
    rename( path, p )?;
    Ok(())
}

type PositionMap = HashMap<PathBuf, (f32,f32)>;

#[derive(Serialize, Deserialize, Debug)]
pub struct Module {
    pub name: String, // not including the extension
    pub content: String,
    pub position: Option<(f32,f32)>
}

impl Default for Module {
    fn default() -> Self {
        Self {
            name: Default::default(),
            content: Default::default(),
            position: Default::default()
        }
    }
}

impl Module {
    async fn write(&self, mut cwd: PathBuf, positions: &mut PositionMap) -> io::Result<()> {
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
        positions.insert( cwd.clone(), self.position.unwrap_or_default() );

        // TODO std::fs::File is sync so async is useless :|
        write_with_temp_to(cwd, self.content.clone())
    }

    fn load(path: &Path, positions: &PositionMap) -> io::Result<Self> {
        if !path.exists() {
            return Ok( Default::default() );
        }

        let file_name = path.file_name()
            .unwrap()
            .to_string_lossy()
            .to_string();
        // file_name = file_name.replace(".py", "");
        let mut file = open_read(path)?;
        let mut buf = String::new();
        file.read_to_string(&mut buf)?;
        Ok(Self {
            name: file_name,
            content: buf,
            position: positions.get(path).copied()
        })
    }
}

pub fn _should_ignore(path: &Path) -> bool {
    let file_name = path.file_name()
        .unwrap()
        .to_string_lossy()
        .to_string();
    match file_name.as_str() {
        PROJECT_CONFIG_NAME | DOTPOPPY => return true,
        _ => return false
    }

}

fn _delete_not_in(rd: io::Result<ReadDir>, cwd: &Path, modules: &Vec<Module>) -> io::Result<()> {
    let rd: ReadDir = rd?;
    let mut name_map: HashSet<String> = HashSet::new();

    for module in modules {
        name_map.insert(module.name.clone());
    }

    for entry in rd {
        let entry = entry?;
        let path = entry.path();
        if _should_ignore(&path) {
            continue;
        }

        if path.is_dir() {
            let r = read_dir(path);
            _delete_not_in(r, cwd, &modules)?;
            continue;
        }

        let ext = path.extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let mut name = path
            .to_string_lossy()
            .to_string();

        let cwd_str = cwd
            .to_string_lossy()
            .to_string();

        name = name.replace(cwd_str.as_str(), "");
        name = name.replace(".py", "");
        // remove the beginning \\
        if name.as_bytes()[0] as char == '\\' {
            name = name[1..].to_string();
        }

        if name.is_empty() {
            continue;
        }

        if ext != "py" {
            continue;
        }

        if let None = name_map.get(&name) {
            dbg!(&path, &name);
            remove_file(path)?;
            return Ok(());
        }
    }
    Ok(())
}

fn _write_cached_module_positions(cwd: PathBuf, positions: PositionMap ) -> io::Result<()> {
    let cwd = get_dot_poppy(cwd.clone());
    if let None = cwd {
        return Err(io::Error::new(
            io::ErrorKind::Other,
            "_write_cached_module_positions::error occured creating DOTPOPPY folder")
        );
    }
    let mut dot_module_pos = cwd.unwrap();
    dot_module_pos.push(DOT_MODULE_POSITIONS);

    let content = serde_json::to_string(&positions)?;
    write_with_temp_to(dot_module_pos, content)
}

fn _read_cached_module_positions(cwd: PathBuf) -> Option<PositionMap> {
    let dotpoppy = get_dot_poppy(cwd.clone());
    if let None = dotpoppy {
        dbg!("_read_cached_module_positions::error occured creating DOTPOPPY folder");
        return None;
    }
    let mut dotpoppy = dotpoppy.unwrap();
    dotpoppy.push(DOT_MODULE_POSITIONS);
    if !dotpoppy.exists() {
        return None;
    }
    let cache_file = open_read(&dotpoppy);
    if let Err(e) = cache_file {
        dbg!(e);
        return None;
    }
    let mut cache_file = cache_file.unwrap();
    let mut c_buf = String::new();
    if let Err(e) = cache_file.read_to_string(&mut c_buf) {
        dbg!(e);
        return None;
    }
    let res = serde_json::from_str(c_buf.as_str());
    if let Err(e) = res {
        dbg!(e);
        return None;
    }
    let positions: PositionMap = res.unwrap();
    Some( positions )
}

fn _load_modules(cwd: &Path, rd: ReadDir, positions: &PositionMap) -> io::Result<Vec<Module>> {
    let mut list: Vec<Module> = vec![];
    for entry in rd {
        let entry = entry?;
        let path = entry.path();
        if _should_ignore(&path) {
            continue;
        }
        if path.is_dir() {
            let prd = read_dir(path)?;
            let l = _load_modules(cwd, prd, positions)?;
            l.into_iter()
                .for_each(|v| {
                    list.push(v);
                });
        }
        else {
            let mut md = Module::load(&path, positions)?;
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
pub fn load_modules(gs: State<GlobalState>) -> Result<Vec<Module>, String> {
    let work_path = gs.get_work_path_clone();
    if !work_path.exists() {
        return Ok(vec![]);
    }

    let dirs = read_dir(&work_path);
    if let Err(e) = dirs {
        dbg!(&e);
        return Err(e.to_string());
    }
    let positions = _read_cached_module_positions(work_path.clone())
        .unwrap_or_default();
    let list = _load_modules(&work_path, dirs.unwrap(), &positions);
    if let Err(e) = list {
        dbg!(&e);
        return Err(e.to_string());
    }
    Ok(list.unwrap())
}

#[tauri::command]
pub async fn write_diagrams_to_modules(modules: String, gs: State<'_, GlobalState>) -> Result<(),String> {
    use std::collections::HashMap;
    match serde_json::from_str(modules.as_str()) {
        Ok(v) => {
            let mut modules: Vec<Module> = v;
            let cwd = gs.get_work_path_clone();
            if cwd == PathBuf::new() {
                return Ok(());
            }
            let mut names: HashMap<&String, u8> = HashMap::new();
            let mut positions: PositionMap = PositionMap::new();
            for module in modules.iter_mut() {
                if let Some(v) = names.get(&module.name) {
                    module.name += &(*v).to_string();
                }
                // dbg!(&module);
                if let Err(e) = module.write(cwd.clone(), &mut positions).await {
                    dbg!(&e);
                    return Err(e.to_string());
                }
                match names.get_mut(&module.name) {
                    Some(v) => *v += 1,
                    None => {
                        names.insert(&module.name, 1);
                    },
                }
            }
            let dir = read_dir(&cwd);
            if let Err(e) = _delete_not_in(dir, &cwd, &modules) {
                dbg!(e);
            }

            if let Err(e) = _write_cached_module_positions(
                cwd.clone(),
                positions
            ) {
                dbg!(e);
            }
            // dbg!(&modules);
        }
        Err(e) => {
            dbg!(&e);
            return Err(e.to_string());
        }
    }
    Ok(())
}

#[tauri::command]
pub fn save_post_test_answers(answers: Vec<String>, gs: State<GlobalState>, app_handle: AppHandle) -> Result<(), String> {
    let mut p = app_handle.path_resolver().app_data_dir()
            .expect(error::Error::DATA_DIR_FAIL.to_string().as_str());
    let profile_name = gs.get_profile();
    p.push(constants::D_LOGS);
    p.push(&profile_name);
    if !p.exists() {
        if let Err(e) = create_dir_all(&p) {
            dbg!(e);
            return Err(String::from("Failed to Save Post Test Answers"));
        }
    }
    p.push("posttest.anwers.json");

    let file = open_write(&p);
    if let Err(e) = file {
        dbg!(&e);
        dbg!(answers);
        return Err(String::from("Failed to Save Post Test Answers"));
    }

    let mut file = file.unwrap();

    let to_str = serde_json::to_string_pretty(&answers);
    if let Err(e) = to_str {
        dbg!(&e);
        dbg!(answers);
        return Err(String::from("Failed to Save Post Test Answers"));
    }

    let to_str = to_str.unwrap();

    if let Err(e) = file.write_all(to_str.as_bytes()) {
        dbg!(e);
        dbg!(answers);
        return Err(String::from("Failed to Save Post Test Answers"));
    }

    Ok(())
}
