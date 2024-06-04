use core::fmt;

pub enum EscapeCodes {
    DEL,
}

impl fmt::Display for EscapeCodes {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            EscapeCodes::DEL => f.write_str("\x08")
        }
    }
}
