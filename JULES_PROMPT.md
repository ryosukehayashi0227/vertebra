<instruction>You are an expert software engineer. You are working on a WIP branch. Please run `git status` and `git diff` to understand the changes and the current state of the code. Analyze the workspace context and complete the mission brief.</instruction>
<workspace_context>
<artifacts>
--- CURRENT TASK CHECKLIST ---
# Tasks

## PDF/DOCX エクスポート機能 ✅ 完了

### Phase 1: バックエンド (Rust) ✅
- [x] 依存関係追加 (`docx-rs`, `pulldown-cmark`)
- [x] `export_document` コマンド実装
  - [x] `export_to_docx()` 実装
  - [x] PDF は browser print で対応
- [x] Export メニュー追加 (Cmd+Shift+E)
- [x] `main.rs` にコマンド登録

### Phase 2: フロントエンド (React) ✅
- [x] `ExportModal.tsx` 作成
- [x] i18n 対応 (en.ts, ja.ts, types.ts)
- [x] App.tsx にイベントハンドラー追加

### Phase 3: テスト
- [x] 既存テスト: 142件すべてパス
- [ ] E2E テスト (オプション)

--- IMPLEMENTATION PLAN ---
# Vertebra 改善計画

## 実施済み

### Phase 1: テストカバレッジ向上 ✅ 完了
- [x] useUndoRedo テスト追加 (15件) → カバレッジ 100%
- [x] useSplitView テスト追加 (18件) → カバレッジ 100%
- [x] Sidebar テスト強化 (+8件)

### Phase 2: コンポーネント分割 ✅ 完了
- [x] FileList.tsx 抽出 (87行)
- [x] ContextMenu.tsx 抽出 (135行)
- [x] SidebarFooter.tsx 抽出 (44行)
- [x] Sidebar.tsx リファクタリング (494行 → 433行)

### Phase 3: コードクリーンアップ ✅ 完了
- [x] 未使用コード確認 (Rich Text 機能用として保持)
- [x] fileSystem.ts テスト追加 (10件) → カバレッジ 100%

### Phase 4: Export 機能実装 ✅ 完了
- [x] DOCX エクスポート機能実装
  - [x] Rust バックエンド (`export_document` コマンド)
  - [x] `ExportModal.tsx` 作成
  - [x] メニュー統合 (Cmd+Shift+E)
  - [x] i18n 対応 (日英)
- [x] PDF 機能は削除 (DOCX → PDF 変換はユーザー側で実施)

---

## 成果サマリー

| 指標 | 開始時 | 最終 | 改善 |
|------|--------|------|------|
| テスト数 | 91件 | **142件** | +51件 |
| 全体カバレッジ | 57.2% | **62.5%** | +5.3% |
| フックカバレッジ | 55.6% | **83.9%** | +28.3% |
| libカバレッジ | 82.9% | **86.5%** | +3.6% |

---

## 未実施 (将来の作業)

### Phase 5: 追加機能 🟢 低優先度

| 機能 | 説明 | 推定工数 |
|------|---------|---------|
| Focus Mode | 選択ノードとその子ノードのみを表示 | 4時間 |
| Global Search | 開いているフォルダ内の全ファイルを検索 | 6時間 |

---

## 作成ファイル一覧

### テストファイル
- `src/hooks/useUndoRedo.test.ts`
- `src/hooks/useSplitView.test.ts`
- `src/lib/fileSystem.test.ts`

### リファクタリング
- `src/components/Sidebar/FileList.tsx`
- `src/components/Sidebar/ContextMenu.tsx`
- `src/components/Sidebar/SidebarFooter.tsx`
- `src/components/Sidebar/index.ts`

### 新機能
- `src/components/ExportModal.tsx`
- `src-tauri/src/lib.rs` (export_document コマンド追加)
</artifacts>
</workspace_context>
<mission_brief>[Describe your task here...]</mission_brief>