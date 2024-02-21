# Requirements
- [Rust](https://www.rust-lang.org/tools/install)
- [Nodejs](https://nodejs.org/en) v20.10.0LTS or higher
- Python 3.1 or higher
- [Visual Studio 2022 Community](https://visualstudio.microsoft.com/downloads/) and install <br>
![visualstudio install](https://tauri.app/assets/images/vs-installer-dark-03cefd64bd4335f718aacc8f4842d2bb.png#gh-dark-mode-only)
# Development
- before coding install dependencies with
```
npm install
cargo install tauri-cli
```
# Building and Debugging
## Build debug
```
cargo tauri dev
```
## Build release
```
cargo tauri build
```
***will be available in 'src-tauri/target/release/'***
# Tauri + Vanilla TS
This template should help get you started developing with Tauri in vanilla HTML, CSS and Typescript.
## Recommended IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
