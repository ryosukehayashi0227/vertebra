import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const CommandsList = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        if (!props.items) return;
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        if (!props.items || props.items.length === 0) return;
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        if (!props.items || props.items.length === 0) return;
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: any) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <div className="slash-commands-menu">
            {props.items && props.items.length > 0 ? (
                props.items.map((item: any, index: number) => (
                    <button
                        className={`slash-command-item ${index === selectedIndex ? 'is-selected' : ''}`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        <span className="command-icon">{item.icon}</span>
                        <div className="command-info">
                            <span className="command-title">{item.title}</span>
                            <span className="command-description">{item.description}</span>
                        </div>
                    </button>
                ))
            ) : (
                <div className="slash-command-item no-result">結果が見つかりません</div>
            )}
        </div>
    );
});

export default CommandsList;
