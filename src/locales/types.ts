export type Language = 'en' | 'ja';

export interface TranslationDictionary {
    // App
    'app.title': string;
    'app.about': string;
    'app.hide': string;
    'app.hideOthers': string;
    'app.showAll': string;
    'app.quit': string;

    // File Menu
    'menu.file': string;
    'menu.file.new': string;
    'menu.file.openFolder': string;
    'menu.file.save': string;
    'menu.file.closeFile': string;
    'menu.window.close': string;

    // Edit Menu
    'menu.edit': string;
    'menu.edit.undo': string;
    'menu.edit.redo': string;
    'menu.edit.cut': string;
    'menu.edit.copy': string;
    'menu.edit.paste': string;
    'menu.edit.selectAll': string;

    // View Menu
    'menu.view': string;
    'menu.view.zoomIn': string;
    'menu.view.zoomOut': string;
    'menu.view.zoomReset': string;
    'menu.view.fullscreen': string;
    'menu.view.language': string;

    // Window Menu
    'menu.window': string;
    'menu.window.minimize': string;
    'menu.window.maximize': string;

    // Sidebar
    'sidebar.outline': string;
    'sidebar.files': string;
    'sidebar.openFolder': string;
    'sidebar.newSection': string;
    'sidebar.copyAsText': string;
    'sidebar.newFile': string;
    'sidebar.fileNamePlaceholder': string;
    'sidebar.searchPlaceholder': string;

    // Welcome Screen
    'welcome.title': string;
    'welcome.message': string;
    'welcome.openFolder': string;
    'welcome.createFile': string;
    'welcome.recent': string;
    'welcome.subtitle': string;
    'welcome.step1': string;
    'welcome.step2': string;
    'welcome.step3': string;
    'welcome.createFileBtn': string;
    'welcome.startBtn': string;
    'welcome.hint': string;

    // Editor
    'editor.save': string;
    'editor.selectNode': string;
    'editor.sectionNamePlaceholder': string;
    'editor.contentPlaceholder': string;

    // Loading
    'loading': string;
}
