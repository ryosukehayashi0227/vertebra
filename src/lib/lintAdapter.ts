export interface LintError {
    line: number;
    column: number;
    message: string;
    ruleId: string;
    severity: number; // 1: warning, 2: error
}

/**
 * テキストをlintして結果を返す
 * Web Workerを使用して非同期で実行
 */
export async function lintText(
    text: string,
    filePath: string = 'untitled.md'
): Promise<LintError[]> {
    // Web Workerの初期化（遅延ロード）
    const worker = await getLintWorker();

    return new Promise((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
            if (event.data.type === 'lint-result') {
                worker.removeEventListener('message', messageHandler);
                resolve(event.data.errors);
            } else if (event.data.type === 'lint-error') {
                worker.removeEventListener('message', messageHandler);
                reject(new Error(event.data.error));
            }
        };

        worker.addEventListener('message', messageHandler);
        worker.postMessage({
            type: 'lint',
            text,
            filePath,
        });
    });
}

// Worker インスタンスのキャッシュ
let workerInstance: Worker | null = null;

async function getLintWorker(): Promise<Worker> {
    if (!workerInstance) {
        // Viteの?worker suffixを使用してWeb Workerをインポート
        // Vite 5/6では new Worker(new URL(...), { type: 'module' }) 形式も使用可能
        workerInstance = new Worker(
            new URL('./textlint.worker.ts', import.meta.url),
            { type: 'module' }
        );
    }
    return workerInstance;
}

/**
 * Workerを破棄（必要に応じて）
 */
export function terminateLintWorker(): void {
    if (workerInstance) {
        workerInstance.terminate();
        workerInstance = null;
    }
}
