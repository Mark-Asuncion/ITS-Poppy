use std::default::Default;
use serde::{ Serialize, Deserialize };
// use std::fs;

pub struct Config;

const PROJECT_CONFIG_NAME: &str = "project-info.json";

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
pub struct ProjectConfig {
    projectName: String,
    author: String,
    createdAt: String
}

impl Default for Config {
    fn default() -> Self {
        Self
    }
}

impl  Config {
    fn get_path() -> Option<String> {
        None
    }
}
