use std::ffi::OsString;

use winptyrs::PTY;

pub struct PTYInstance {
    term: PTY
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
        let buf = self.term.read(1000, false);
        if let Err(e) = buf {
            dbg!(e);
            return String::new();
        }
        buf.unwrap().to_string_lossy().to_string()
    }

    pub fn is_alive(&self) -> bool {
        let alive = self.term.is_alive();
        if let Err(e) = alive {
            dbg!(e);
            return false;
        }
        alive.unwrap()
    }

    pub fn close(&mut self) -> Result<u32, OsString> {
        self.write("exit\r\n")
    }

    pub fn exit_status(&self) -> Option<u32> {
        let status = self.term.get_exitstatus();
        if let Err(e) = status {
            dbg!(e);
            return None;
        }
        status.unwrap()
    }
}
