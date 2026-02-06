import { TextlintKernel } from '@textlint/kernel';
// @ts-ignore - No type definitions available
import preset from 'textlint-rule-preset-ja-technical-writing';

let kernel: TextlintKernel | null = null;

async function initializeKernel() {
    if (kernel) return kernel;

    try {
        kernel = new TextlintKernel();
        return kernel;
    } catch (error) {
        console.error('Failed to initialize textlint kernel:', error);
        throw error;
    }
}

// Workerメッセージハンドラ
self.addEventListener('message', async (event) => {
    const { type, text, filePath } = event.data;

    if (type === 'lint') {
        try {
            const lintKernel = await initializeKernel();

            // ルール設定
            const lintOptions = {
                filePath: filePath || 'untitled.md',
                ext: '.md',
                plugins: [],
                rules: [
                    {
                        ruleId: 'preset-ja-technical-writing',
                        rule: preset,
                        options: {
                            'sentence-length': { max: 150 },
                            'no-exclamation-question-mark': false,
                            'ja-no-weak-phrase': false,
                        },
                    },
                ],
            };

            const result = await lintKernel.lintText(text, lintOptions);

            // エラー形式に変換
            const errors = result.messages.map((msg: any) => ({
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId || 'unknown',
                severity: msg.severity,
            }));

            self.postMessage({
                type: 'lint-result',
                errors,
            });
        } catch (error) {
            console.error('Lint error in worker:', error);
            self.postMessage({
                type: 'lint-error',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
});
