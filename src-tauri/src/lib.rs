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

#[tauri::command]
fn update_menu_language(app: tauri::AppHandle, lang: String) -> Result<(), String> {
    let menu = build_menu(&app, &lang).map_err(|e| e.to_string())?;
    app.set_menu(menu).map_err(|e| e.to_string())?;
    Ok(())
}

fn build_menu(app: &tauri::AppHandle, lang: &str) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};

    let is_ja = lang == "ja";

    // Text resources
    let t_app_name = "Vertebra";
    let t_about = if is_ja {
        "Vertebraについて"
    } else {
        "About Vertebra"
    };
    let t_hide = if is_ja {
        "Vertebraを隠す"
    } else {
        "Hide Vertebra"
    };
    let t_hide_others = if is_ja {
        "ほかを隠す"
    } else {
        "Hide Others"
    };
    let t_show_all = if is_ja {
        "すべてを表示"
    } else {
        "Show All"
    };
    let t_quit = if is_ja {
        "Vertebraを終了"
    } else {
        "Quit Vertebra"
    };

    let t_file = if is_ja { "ファイル" } else { "File" };
    let t_new_file = if is_ja {
        "新規ファイル"
    } else {
        "New File"
    };
    let t_open_folder = if is_ja {
        "フォルダを開く..."
    } else {
        "Open Folder..."
    };
    let t_save = if is_ja { "保存" } else { "Save" };
    let t_close_file = if is_ja {
        "ファイルを閉じる"
    } else {
        "Close File"
    };
    let t_close_window = if is_ja {
        "ウィンドウを閉じる"
    } else {
        "Close Window"
    };

    let t_edit = if is_ja { "編集" } else { "Edit" };
    let t_undo = if is_ja { "取り消し" } else { "Undo" };
    let t_redo = if is_ja { "やり直し" } else { "Redo" };
    let t_cut = if is_ja { "カット" } else { "Cut" };
    let t_copy = if is_ja { "コピー" } else { "Copy" };
    let t_paste = if is_ja { "ペースト" } else { "Paste" };
    let t_select_all = if is_ja {
        "すべて選択"
    } else {
        "Select All"
    };

    let t_view = if is_ja { "表示" } else { "View" };
    let t_zoom_in = if is_ja { "拡大" } else { "Zoom In" };
    let t_zoom_out = if is_ja { "縮小" } else { "Zoom Out" };
    let t_zoom_reset = if is_ja {
        "サイズをリセット"
    } else {
        "Reset Zoom"
    };
    let t_fullscreen = if is_ja {
        "フルスクリーン"
    } else {
        "Toggle Fullscreen"
    };
    let t_lang = if is_ja {
        "言語 (Language)"
    } else {
        "Language"
    };
    let t_lang_en = "English";
    let t_lang_ja = "日本語";

    let t_window = if is_ja { "ウィンドウ" } else { "Window" };
    let t_minimize = if is_ja { "最小化" } else { "Minimize" };
    let t_maximize = if is_ja { "最大化" } else { "Maximize" };

    // macOS App menu
    #[cfg(target_os = "macos")]
    let app_menu = SubmenuBuilder::new(app, t_app_name)
        .item(&PredefinedMenuItem::about(app, Some(t_about), None)?)
        .separator()
        .item(
            &MenuItemBuilder::with_id("settings", if is_ja { "設定..." } else { "Settings..." })
                .accelerator("CmdOrCtrl+,")
                .build(app)?,
        )
        .separator()
        .item(&PredefinedMenuItem::hide(app, Some(t_hide))?)
        .item(&PredefinedMenuItem::hide_others(app, Some(t_hide_others))?)
        .item(&PredefinedMenuItem::show_all(app, Some(t_show_all))?)
        .separator()
        .item(&PredefinedMenuItem::quit(app, Some(t_quit))?)
        .build()?;

    // File menu
    let mut file_menu_builder = SubmenuBuilder::new(app, t_file)
        .item(
            &MenuItemBuilder::with_id("new_file", t_new_file)
                .accelerator("CmdOrCtrl+N")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("open_folder", t_open_folder)
                .accelerator("CmdOrCtrl+O")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("save", t_save)
                .accelerator("CmdOrCtrl+S")
                .build(app)?,
        )
        .separator()
        .item(
            &MenuItemBuilder::with_id("close_file", t_close_file)
                .accelerator("CmdOrCtrl+W")
                .build(app)?,
        )
        .item(&PredefinedMenuItem::close_window(
            app,
            Some(t_close_window),
        )?);

    #[cfg(not(target_os = "macos"))]
    {
        file_menu_builder = file_menu_builder
            .separator()
            .item(
                &MenuItemBuilder::with_id(
                    "settings",
                    if is_ja { "設定..." } else { "Settings..." },
                )
                .accelerator("CmdOrCtrl+,")
                .build(app)?,
            )
            .separator()
            .item(&PredefinedMenuItem::quit(app, Some(t_quit))?);
    }

    let file_menu = file_menu_builder.build()?;

    // Edit menu
    let edit_menu = SubmenuBuilder::new(app, t_edit)
        .item(
            &MenuItemBuilder::with_id("undo", t_undo)
                .accelerator("CmdOrCtrl+Z")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("redo", t_redo)
                .accelerator("CmdOrCtrl+Shift+Z")
                .build(app)?,
        )
        .separator()
        .item(&PredefinedMenuItem::cut(app, Some(t_cut))?)
        .item(&PredefinedMenuItem::copy(app, Some(t_copy))?)
        .item(&PredefinedMenuItem::paste(app, Some(t_paste))?)
        .item(&PredefinedMenuItem::select_all(app, Some(t_select_all))?)
        .build()?;

    // View menu
    let lang_menu = SubmenuBuilder::new(app, t_lang)
        .item(&MenuItemBuilder::with_id("change_lang_en", t_lang_en).build(app)?)
        .item(&MenuItemBuilder::with_id("change_lang_ja", t_lang_ja).build(app)?)
        .build()?;

    let view_menu = SubmenuBuilder::new(app, t_view)
        .item(
            &MenuItemBuilder::with_id("zoom_in", t_zoom_in)
                .accelerator("CmdOrCtrl+=")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("zoom_out", t_zoom_out)
                .accelerator("CmdOrCtrl+-")
                .build(app)?,
        )
        .item(
            &MenuItemBuilder::with_id("zoom_reset", t_zoom_reset)
                .accelerator("CmdOrCtrl+0")
                .build(app)?,
        )
        .separator()
        .item(&PredefinedMenuItem::fullscreen(app, Some(t_fullscreen))?)
        .separator()
        .item(&lang_menu)
        .build()?;

    // Window menu
    let window_menu = SubmenuBuilder::new(app, t_window)
        .item(&PredefinedMenuItem::minimize(app, Some(t_minimize))?)
        .item(&PredefinedMenuItem::maximize(app, Some(t_maximize))?)
        .build()?;

    #[cfg(target_os = "macos")]
    let menu = MenuBuilder::new(app)
        .items(&[&app_menu, &file_menu, &edit_menu, &view_menu, &window_menu])
        .build()?;

    #[cfg(not(target_os = "macos"))]
    let menu = MenuBuilder::new(app)
        .items(&[&file_menu, &edit_menu, &view_menu, &window_menu])
        .build()?;

    Ok(menu)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .setup(|app| {
            // Default to English initially
            let menu = build_menu(app.handle(), "en")?;
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
                "change_lang_en" => {
                    let _ = app.emit("menu-change-lang-en", ());
                }
                "change_lang_ja" => {
                    let _ = app.emit("menu-change-lang-ja", ());
                }
                "undo" => {
                    let _ = app.emit("menu-undo", ());
                }
                "redo" => {
                    let _ = app.emit("menu-redo", ());
                }
                "settings" => {
                    let _ = app.emit("menu-settings", ());
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
            rename_file,
            update_menu_language,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
