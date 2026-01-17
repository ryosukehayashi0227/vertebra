import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import CommandsList from './CommandsList';

export default {
    items: ({ query }: { query: string }) => {
        return [
            {
                title: '見出し 1',
                description: '大見出し',
                icon: 'H1',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
                },
            },
            {
                title: '見出し 2',
                description: '中見出し',
                icon: 'H2',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
                },
            },
            {
                title: '見出し 3',
                description: '小見出し',
                icon: 'H3',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
                },
            },
            {
                title: '箇条書き',
                description: 'リストを作成',
                icon: '•',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                },
            },
            {
                title: '番号付きリスト',
                description: '順序付きリスト',
                icon: '1.',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                },
            },
            {
                title: 'タスクリスト',
                description: 'チェックボックス付き',
                icon: '☑',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleTaskList().run();
                },
            },
            {
                title: '引用',
                description: '引用ブロック',
                icon: '"',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleBlockquote().run();
                },
            },
            {
                title: 'コードブロック',
                description: 'プログラムコード',
                icon: '</>',
                command: ({ editor, range }: any) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                },
            },
        ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
    },

    render: () => {
        let component: any;
        let popup: any;

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(CommandsList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                });
            },

            onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect || !popup || !popup[0]) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    if (popup && popup[0]) {
                        popup[0].hide();
                    }
                    return true;
                }

                return component?.ref?.onKeyDown(props);
            },

            onExit() {
                if (popup && popup[0]) {
                    popup[0].destroy();
                }
                if (component) {
                    component.destroy();
                }
            },
        };
    },
};
