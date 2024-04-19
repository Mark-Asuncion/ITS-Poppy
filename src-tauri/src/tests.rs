use crate::config::{ProjectConfig, constants::{PROJECT_CONFIG_NAME, self}};
use std::path::PathBuf;
use crate::config::data;

const TEST_FOLDER: &str = "C:\\Users\\marka\\Documents\\testfolder";

#[test]
fn project_config_new() {
    let pc = ProjectConfig::new("testing".to_string());
    assert!(!pc.is_empty());
}

#[test]
fn project_config_write() {
    let pc = ProjectConfig::new("testing".to_string());
    let mut path = PathBuf::from(TEST_FOLDER);
    pc.write(path.clone()).unwrap();
    path.push(PROJECT_CONFIG_NAME);
    assert!(path.exists());
}

#[test]
fn project_config_load() {
    let path = PathBuf::from(TEST_FOLDER);
    let pc = ProjectConfig::from_path(path.clone());
    assert!(!pc.is_empty());
}

#[test]
fn data_list_of_projects() {
    let path = PathBuf::from(TEST_FOLDER);
    // dbg!(data::load(path.clone()).unwrap());

    let datas = vec![
        String::from("val1"),
        String::from("val2"),
        String::from("val3"),
        String::from("val4"),
    ];

    let mut data_p: Vec<PathBuf> = vec![];
    for data in datas.clone().into_iter() {
        data_p.push(PathBuf::from(data.clone()));
    }
    assert_eq!( data::append(path.clone(), datas.clone()).unwrap(),
    () );

    assert_eq!(data::load(path.clone()).unwrap(), data_p);

    let datas_del = vec![
        String::from("val2"),
        String::from("val3"),
    ];
    assert_eq!( data::delete(path, datas_del).unwrap(), () );
}
