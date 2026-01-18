import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFontSize } from './useFontSize';

describe('useFontSize', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.style.removeProperty('--user-font-size');
    });

    describe('initialization', () => {
        it('should initialize with default font size (14px)', () => {
            const { result } = renderHook(() => useFontSize());
            expect(result.current.fontSize).toBe(14);
        });

        it('should restore font size from localStorage', () => {
            localStorage.setItem('userFontSize', '18');
            const { result } = renderHook(() => useFontSize());
            expect(result.current.fontSize).toBe(18);
        });

        it('should use default if localStorage has invalid value', () => {
            localStorage.setItem('userFontSize', 'invalid');
            const { result } = renderHook(() => useFontSize());
            expect(result.current.fontSize).toBe(14);
        });

        it('should apply initial font size to CSS variable', () => {
            const { result } = renderHook(() => useFontSize());
            expect(document.documentElement.style.getPropertyValue('--user-font-size')).toBe('14px');
        });
    });

    describe('zoomIn', () => {
        it('should increase font size by 1', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomIn();
            });

            expect(result.current.fontSize).toBe(15);
        });

        it('should not exceed maximum font size (24px)', () => {
            localStorage.setItem('userFontSize', '24');
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomIn();
            });

            expect(result.current.fontSize).toBe(24);
        });

        it('should update CSS variable after zoom in', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomIn();
            });

            expect(document.documentElement.style.getPropertyValue('--user-font-size')).toBe('15px');
        });

        it('should persist to localStorage after zoom in', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomIn();
            });

            expect(localStorage.getItem('userFontSize')).toBe('15');
        });
    });

    describe('zoomOut', () => {
        it('should decrease font size by 1', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomOut();
            });

            expect(result.current.fontSize).toBe(13);
        });

        it('should not go below minimum font size (10px)', () => {
            localStorage.setItem('userFontSize', '10');
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomOut();
            });

            expect(result.current.fontSize).toBe(10);
        });

        it('should update CSS variable after zoom out', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomOut();
            });

            expect(document.documentElement.style.getPropertyValue('--user-font-size')).toBe('13px');
        });

        it('should persist to localStorage after zoom out', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomOut();
            });

            expect(localStorage.getItem('userFontSize')).toBe('13');
        });
    });

    describe('resetZoom', () => {
        it('should reset font size to default (14px)', () => {
            localStorage.setItem('userFontSize', '20');
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.resetZoom();
            });

            expect(result.current.fontSize).toBe(14);
        });

        it('should update CSS variable after reset', () => {
            localStorage.setItem('userFontSize', '20');
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.resetZoom();
            });

            expect(document.documentElement.style.getPropertyValue('--user-font-size')).toBe('14px');
        });

        it('should persist to localStorage after reset', () => {
            localStorage.setItem('userFontSize', '20');
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.resetZoom();
            });

            expect(localStorage.getItem('userFontSize')).toBe('14');
        });
    });

    describe('edge cases', () => {
        it('should handle multiple zoom in operations', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomIn();
                result.current.zoomIn();
                result.current.zoomIn();
            });

            expect(result.current.fontSize).toBe(17);
        });

        it('should handle multiple zoom out operations', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomOut();
                result.current.zoomOut();
                result.current.zoomOut();
            });

            expect(result.current.fontSize).toBe(11);
        });

        it('should handle zoom in and out combinations', () => {
            const { result } = renderHook(() => useFontSize());

            act(() => {
                result.current.zoomIn();
                result.current.zoomIn();
                result.current.zoomOut();
            });

            expect(result.current.fontSize).toBe(15);
        });
    });
});
