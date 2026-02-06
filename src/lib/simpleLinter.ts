/**
 * Vertebra Linter - シンプルな正規表現ベースの文章校正ツール
 * ブラウザ環境で動作する軽量なLinter
 */

export interface LintError {
    line: number;
    column: number;
    message: string;
    type: 'warning' | 'error';
    ruleId: string;
}

export interface LintRule {
    id: string;
    check: (text: string, lineNumber: number) => LintError[];
}

/**
 * ルール1: 助詞「の」の連続チェック
 * 「の」が3回以上連続していたら警告
 */
const noConsecutiveParticle: LintRule = {
    id: 'no-consecutive-no',
    check: (text: string, lineNumber: number): LintError[] => {
        const errors: LintError[] = [];
        // 「の」が3回以上連続するパターンを検出
        const pattern = /([^\s]*の[^\s]*の[^\s]*の[^\s]*)/g;
        let match;

        while ((match = pattern.exec(text)) !== null) {
            errors.push({
                line: lineNumber,
                column: match.index + 1,
                message: '助詞「の」が3回以上連続しています。文を分割するか、言い換えを検討してください。',
                type: 'warning',
                ruleId: 'no-consecutive-no',
            });
        }

        return errors;
    },
};

/**
 * ルール2: 一文の長さチェック
 * 100文字を超えたら警告
 */
const sentenceLength: LintRule = {
    id: 'sentence-length',
    check: (text: string, lineNumber: number): LintError[] => {
        const errors: LintError[] = [];
        // 句点で文を分割
        const sentences = text.split(/[。.!?]/);

        let currentPos = 0;
        sentences.forEach((sentence) => {
            if (sentence.length > 100) {
                errors.push({
                    line: lineNumber,
                    column: currentPos + 1,
                    message: `一文が100文字を超えています（${sentence.length}文字）。文を分割することを検討してください。`,
                    type: 'warning',
                    ruleId: 'sentence-length',
                });
            }
            currentPos += sentence.length + 1; // +1 for the delimiter
        });

        return errors;
    },
};

/**
 * ルール3: 逆接の「が」のチェック
 * 一文の中に「が」が2回以上出てきたら警告
 */
const consecutiveConjunction: LintRule = {
    id: 'consecutive-ga',
    check: (text: string, lineNumber: number): LintError[] => {
        const errors: LintError[] = [];
        // 句点で文を分割
        const sentences = text.split(/[。.!?]/);

        let currentPos = 0;
        sentences.forEach((sentence) => {
            const gaCount = (sentence.match(/が/g) || []).length;
            if (gaCount >= 2) {
                errors.push({
                    line: lineNumber,
                    column: currentPos + 1,
                    message: `一文に「が」が${gaCount}回使われています。文を分割するか、接続詞を見直してください。`,
                    type: 'warning',
                    ruleId: 'consecutive-ga',
                });
            }
            currentPos += sentence.length + 1;
        });

        return errors;
    },
};

/**
 * ルール4: 表記ゆれチェック
 * 「サーバ」「ユーザ」を見つけたら「サーバー」「ユーザー」を推奨
 */
const notationConsistency: LintRule = {
    id: 'notation-consistency',
    check: (text: string, lineNumber: number): LintError[] => {
        const errors: LintError[] = [];

        const notations = [
            { pattern: /サーバ(?!ー)/g, suggestion: 'サーバー' },
            { pattern: /ユーザ(?!ー)/g, suggestion: 'ユーザー' },
        ];

        notations.forEach(({ pattern, suggestion }) => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                errors.push({
                    line: lineNumber,
                    column: match.index + 1,
                    message: `表記ゆれ: 「${match[0]}」は「${suggestion}」を推奨します。`,
                    type: 'warning',
                    ruleId: 'notation-consistency',
                });
            }
        });

        return errors;
    },
};

// 全ルールのリスト
const rules: LintRule[] = [
    noConsecutiveParticle,
    sentenceLength,
    consecutiveConjunction,
    notationConsistency,
];

/**
 * テキスト全体をlintする
 * @param text - チェック対象のテキスト
 * @returns エラーの配列
 */
export function lintText(text: string): LintError[] {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const errors: LintError[] = [];
    const lines = text.split('\n');

    lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // 各ルールを適用
        rules.forEach((rule) => {
            const lineErrors = rule.check(line, lineNumber);
            errors.push(...lineErrors);
        });
    });

    return errors;
}

/**
 * エラー数の集計
 */
export function getErrorCount(errors: LintError[]): {
    warnings: number;
    errors: number;
    total: number;
} {
    const warnings = errors.filter((e) => e.type === 'warning').length;
    const errorCount = errors.filter((e) => e.type === 'error').length;

    return {
        warnings,
        errors: errorCount,
        total: errors.length,
    };
}
