use core::fmt;

#[derive(Debug,serde::Serialize, serde::Deserialize)]
pub enum Error {
    PTY_WRITE_FAIL,
    PTY_NOT_INSTANTIATED,
    PTY_FAIL_TO_CLOSE,

    FILE_WRITE_FAIL,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::PTY_WRITE_FAIL => f.write_str("PTY::Failed to write to PTY"),
            Error::PTY_NOT_INSTANTIATED => f.write_str("PTY::Failed to access a PTY instance"),
            Error::PTY_FAIL_TO_CLOSE => f.write_str("PTY:: Failed to close PTY"),
            Error::FILE_WRITE_FAIL => f.write_str("FILE::Failed to write to file"),
        }
    }
}