import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface FileEntry {
    name: string;
    path: string;
    is_dir: boolean;
}

/**
 * Open a folder picker dialog and return the selected path
 */
export async function openFolderDialog(): Promise<string | null> {
    const selected = await open({
        directory: true,
        multiple: false,
        title: "Select a folder to open",
    });
    return selected as string | null;
}

/**
 * Read directory contents (markdown files and subdirectories)
 */
export async function readDirectory(path: string): Promise<FileEntry[]> {
    return invoke<FileEntry[]>("read_directory", { path });
}

/**
 * Read file content
 */
export async function readFile(path: string): Promise<string> {
    return invoke<string>("read_file", { path });
}

/**
 * Write content to a file
 */
export async function writeFile(path: string, content: string): Promise<void> {
    return invoke<void>("write_file", { path, content });
}

/**
 * Create a new empty markdown file
 */
export async function createFile(path: string): Promise<void> {
    return invoke<void>("create_file", { path });
}

/**
 * Delete a file
 */
export async function deleteFile(path: string): Promise<void> {
    return invoke<void>("delete_file", { path });
}

/**
 * Rename a file
 */
export async function renameFile(oldPath: string, newPath: string): Promise<void> {
    return invoke<void>("rename_file", { oldPath, newPath });
}
