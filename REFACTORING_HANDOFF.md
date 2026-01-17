# App.tsx リファクタリング引き継ぎドキュメント

## 概要
`App.tsx` (830行 → 765行) を複数のカスタムフックに分割し、保守性を向上させるリファクタリング作業。

## 完了済み ✅

### 1. `useSidebarResize` フック (統合済み)
- **ファイル**: `src/hooks/useSidebarResize.ts`
- **機能**: サイドバーのドラッグリサイズ、localStorage永続化
- **App.tsx での使用**:
```tsx
const { sidebarWidth, startResizing } = useSidebarResize();
```

### 2. `useFontSize` フック (統合済み)
- **ファイル**: `src/hooks/useFontSize.ts`
- **機能**: フォントサイズ管理、ズームイン/アウト、localStorage + CSS変数永続化
- **App.tsx での使用**:
```tsx
const { fontSize, zoomIn, zoomOut, resetZoom } = useFontSize();
```

---

## 未完了 ⏳

### 3. `useUndoRedo` フック (作成済み、未統合)
- **ファイル**: `src/hooks/useUndoRedo.ts`
- **統合難易度**: 高
- **理由**: `currentDocument.outline` への依存が多く、`handleOutlineChange` コールバックと連携が必要

**App.tsx で削除すべきコード** (統合時):
- `undoStack`, `redoStack` (useRef)
- `MAX_HISTORY`, `DEBOUNCE_DELAY` (定数)
- `debounceTimer` (useRef)
- `pushHistory`, `handleUndo`, `handleRedo` (関数)
- `handleOutlineChangeWithHistory` (関数)

**統合の手順**:
1. `handleOutlineChange` を先に取得
2. `useUndoRedo({ outline: currentDocument?.outline, onOutlineChange: handleOutlineChange })` を呼び出し
3. 既存のロジックを削除

---

### 4. `useSplitView` フック (作成済み、未統合)
- **ファイル**: `src/hooks/useSplitView.ts`
- **統合難易度**: 中
- **理由**: セッション復元ロジック (`isSessionRestore`) と絡む

**App.tsx で削除すべきコード** (統合時):
- `isSplitView`, `setIsSplitView` (useState)
- `secondaryNodeId`, `setSecondaryNodeId` (useState)
- `activePane`, `setActivePane` (useState)
- 関連する `useEffect` (localStorage永続化)

---

## テスト

統合後は必ず以下のテストを実行:

```bash
# ユニットテスト (91件)
npm test

# E2Eテスト (22件)
npx playwright test
```

---

## 注意点

1. **段階的に統合**: 1つのフックを統合するたびにテストを実行
2. **依存関係**: `useUndoRedo` は `handleOutlineChange` が先に定義されている必要あり
3. **インポートは追加済み**: 4つのフックのインポートは `App.tsx` に既に存在

---

## 参考ファイル

- 実装計画: `.gemini/antigravity/brain/.../implementation_plan.md`
- タスク一覧: `.gemini/antigravity/brain/.../task.md`
