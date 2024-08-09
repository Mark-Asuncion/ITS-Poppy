use crate::config::ProjectConfig;
use crate::config::constants::PROJECT_CONFIG_NAME;
use crate::pty::instance::PTYInstance;
use crate::state::GlobalState;
use core::time;
use std::path::PathBuf;
use crate::config::data;
use crate::pty;

const TEST_FOLDER: &str = r#"C:\Users\marka\Documents\poppy-dev\project1"#;

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

#[test]
pub fn t_term() {
    // NOTE problem if I read the first stdout and then run an invalid command
    // output becomes messedup sh**** solution create 2 instance 1 is for reading the first output and delete it
    let pty = pty::init(TEST_FOLDER);
    let gs = GlobalState {
        work_path: Default::default(),
        pty:       Default::default()
    };

    {
        gs.add_pty(pty.unwrap());
        let instance = &mut (*gs.pty.lock().expect(""));
        let instance = instance.as_mut().unwrap();

        // let buf = &instance.read();
        // println!("{}{}", cls, buf);

        // instance.write("python\r\n").unwrap();

        // let w = format!("{}ir\n\r\n", EscapeCodes::DEL.to_string());
        // instance.write(&w).unwrap();
        instance.write("python\r\n").unwrap();
        // instance.write("\x03").unwrap();

        let mut buf = instance.read();
        buf += &instance.read();
        println!("{}", buf);
        buf = instance.read();
        println!("{}", buf);

        // std::thread::sleep(time::Duration::from_secs(5));
        dbg!(instance.is_alive());
        dbg!(instance.exit_status());
        std::thread::sleep(time::Duration::from_secs(10));
    }
    {
        let mut guard = gs.pty.lock().expect("");
        let term = guard.take();
        drop(term);
    }

    dbg!(&gs);
    // dbg!(instance.is_alive());
    // dbg!(instance.exit_status());

    // dbg!(instance.write("dir\r\n"));
    // buf = instance.read();
    // println!("{}", buf);
    // assert!(!instance.is_alive());

    // instance.write("10+2\r\n").unwrap();

    // let buf = &instance.read();
    // println!("{}{}", cls, buf);

    // instance.write("d\r\n").unwrap();
    //
    // let buf = &instance.read();
    // println!("{}", buf);
}
