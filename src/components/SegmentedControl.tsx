import { useEffect, useRef, useState } from 'react';
import './Modal.css';

interface SegmentedControlOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface SegmentedControlProps {
    options: SegmentedControlOption[];
    value: string;
    onChange: (value: string) => void;
}

export default function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
    const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        const activeIndex = options.findIndex(opt => opt.value === value);
        const activeButton = optionRefs.current[activeIndex];

        if (activeButton && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();

            setIndicatorStyle({
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width,
            });
        }
    }, [value, options]);

    return (
        <div ref={containerRef} className="segmented-control">
            <div
                className="segmented-control-indicator"
                style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`
                }}
            />
            {options.map((option, index) => (
                <button
                    key={option.value}
                    ref={el => { optionRefs.current[index] = el; }}
                    className={`segmented-control-option ${value === option.value ? 'active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.icon && <span className="segmented-control-icon">{option.icon}</span>}
                    {option.label}
                </button>
            ))}
        </div>
    );
}
