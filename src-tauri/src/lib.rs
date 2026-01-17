use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OutlineItem {
    pub id: String,
    pub text: String,
    pub level: usize,
    pub children: Vec<OutlineItem>,
}

/// Read directory contents and return list of markdown files
#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = PathBuf::from(&path);
    if !dir_path.is_dir() {
        return Err("Not a directory".to_string());
    }

    let mut entries = Vec::new();
    let read_dir = fs::read_dir(&dir_path).map_err(|e| e.to_string())?;

    for entry in read_dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files
        if name.starts_with('.') {
            continue;
        }

        let is_dir = path.is_dir();
        let is_markdown = path.extension().map_or(false, |ext| ext == "md");

        if is_dir || is_markdown {
            entries.push(FileEntry {
                name,
                path: path.to_string_lossy().to_string(),
                is_dir,
            });
        }
    }

    // Sort: directories first, then files
    entries.sort_by(|a, b| {
        if a.is_dir == b.is_dir {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        } else if a.is_dir {
            std::cmp::Ordering::Less
        } else {
            std::cmp::Ordering::Greater
        }
    });

    Ok(entries)
}

/// Read file content
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

/// Write file content
#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

/// Create a new markdown file
#[tauri::command]
fn create_file(path: String) -> Result<(), String> {
    fs::write(&path, "").map_err(|e| e.to_string())
}

/// Delete a file
#[tauri::command]
fn delete_file(path: String) -> Result<(), String> {
    fs::remove_file(&path).map_err(|e| e.to_string())
}

/// Rename a file
#[tauri::command]
fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};

            // macOS App menu (appears under app name)
            #[cfg(target_os = "macos")]
            let app_menu = SubmenuBuilder::new(app, "Vertebra")
                .item(&PredefinedMenuItem::about(
                    app,
                    Some("Vertebraについて"),
                    None,
                )?)
                .separator()
                .item(&PredefinedMenuItem::hide(app, Some("Vertebraを隠す"))?)
                .item(&PredefinedMenuItem::hide_others(app, Some("ほかを隠す"))?)
                .item(&PredefinedMenuItem::show_all(app, Some("すべてを表示"))?)
                .separator()
                .item(&PredefinedMenuItem::quit(app, Some("Vertebraを終了"))?)
                .build()?;

            // File menu
            let file_menu = SubmenuBuilder::new(app, "ファイル")
                .item(
                    &MenuItemBuilder::with_id("new_file", "新規ファイル")
                        .accelerator("CmdOrCtrl+N")
                        .build(app)?,
                )
                .item(
                    &MenuItemBuilder::with_id("open_folder", "フォルダを開く...")
                        .accelerator("CmdOrCtrl+O")
                        .build(app)?,
                )
                .separator()
                .item(
                    &MenuItemBuilder::with_id("save", "保存")
                        .accelerator("CmdOrCtrl+S")
                        .build(app)?,
                )
                .separator()
                .item(
                    &MenuItemBuilder::with_id("close_file", "ファイルを閉じる")
                        .accelerator("CmdOrCtrl+W")
                        .build(app)?,
                )
                .item(&PredefinedMenuItem::close_window(
                    app,
                    Some("ウィンドウを閉じる"),
                )?)
                .build()?;

            // Edit menu
            let edit_menu = SubmenuBuilder::new(app, "編集")
                .item(&PredefinedMenuItem::undo(app, Some("取り消し"))?)
                .item(&PredefinedMenuItem::redo(app, Some("やり直し"))?)
                .separator()
                .item(&PredefinedMenuItem::cut(app, Some("カット"))?)
                .item(&PredefinedMenuItem::copy(app, Some("コピー"))?)
                .item(&PredefinedMenuItem::paste(app, Some("ペースト"))?)
                .item(&PredefinedMenuItem::select_all(app, Some("すべて選択"))?)
                .build()?;

            // View menu
            let view_menu = SubmenuBuilder::new(app, "表示")
                .item(
                    &MenuItemBuilder::with_id("zoom_in", "拡大")
                        .accelerator("CmdOrCtrl+=")
                        .build(app)?,
                )
                .item(
                    &MenuItemBuilder::with_id("zoom_out", "縮小")
                        .accelerator("CmdOrCtrl+-")
                        .build(app)?,
                )
                .item(
                    &MenuItemBuilder::with_id("zoom_reset", "サイズをリセット")
                        .accelerator("CmdOrCtrl+0")
                        .build(app)?,
                )
                .separator()
                .item(&PredefinedMenuItem::fullscreen(
                    app,
                    Some("フルスクリーン"),
                )?)
                .build()?;

            // Window menu
            let window_menu = SubmenuBuilder::new(app, "ウィンドウ")
                .item(&PredefinedMenuItem::minimize(app, Some("最小化"))?)
                .item(&PredefinedMenuItem::maximize(app, Some("最大化"))?)
                .build()?;

            #[cfg(target_os = "macos")]
            let menu = MenuBuilder::new(app)
                .items(&[&app_menu, &file_menu, &edit_menu, &view_menu, &window_menu])
                .build()?;

            #[cfg(not(target_os = "macos"))]
            let menu = MenuBuilder::new(app)
                .items(&[&file_menu, &edit_menu, &view_menu, &window_menu])
                .build()?;

            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| {
            use tauri::Emitter;

            let id = event.id().as_ref();
            match id {
                "new_file" => {
                    let _ = app.emit("menu-new-file", ());
                }
                "open_folder" => {
                    let _ = app.emit("menu-open-folder", ());
                }
                "save" => {
                    let _ = app.emit("menu-save", ());
                }
                "close_file" => {
                    let _ = app.emit("menu-close-file", ());
                }
                "zoom_in" => {
                    let _ = app.emit("menu-zoom-in", ());
                }
                "zoom_out" => {
                    let _ = app.emit("menu-zoom-out", ());
                }
                "zoom_reset" => {
                    let _ = app.emit("menu-zoom-reset", ());
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            read_directory,
            read_file,
            write_file,
            create_file,
            delete_file,
            rename_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
