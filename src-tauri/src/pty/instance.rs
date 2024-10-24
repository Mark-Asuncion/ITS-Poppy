use std::{ffi::OsString, fmt};

use winptyrs::PTY;

pub struct PTYInstance {
    term: PTY
}

impl fmt::Debug for PTYInstance {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("PTYInstance")
            .field("term (pid)", &self.term.get_pid())
            .finish()
    }
}

impl PTYInstance {
    pub fn new(pty: PTY) -> Self {
        Self {
            term: pty
        }
    }

    pub fn write(&mut self, buf: &str) -> Result<u32, OsString>  {
        self.term.write(OsString::from(buf))
    }

    pub fn read(&self) -> String {
        let mut buf = String::new();
        while let Ok(v) = self.term.read(1000, false) {
            if v.is_empty() {
                break;
            }
            buf += &v.to_string_lossy().to_string();
        }
        buf
    }

    // ======for debugging==========
    #[allow(dead_code)]
    pub fn is_alive(&self) -> bool {
        let alive = self.term.is_alive();
        if let Err(e) = alive {
            dbg!(e);
            return false;
        }
        alive.unwrap()
    }
    #[allow(dead_code)]
    pub fn exit_status(&self) -> Option<u32> {
        let status = self.term.get_exitstatus();
        if let Err(e) = status {
            dbg!(e);
            return None;
        }
        status.unwrap()
    }
    // ============================
}
