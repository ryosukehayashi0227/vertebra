import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSidebarResize } from './useSidebarResize';

describe('useSidebarResize', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('initialization', () => {
        it('should initialize with default width (240px)', () => {
            const { result } = renderHook(() => useSidebarResize());
            expect(result.current.sidebarWidth).toBe(240);
        });

        it('should restore width from localStorage', () => {
            localStorage.setItem('sidebarWidth', '300');
            const { result } = renderHook(() => useSidebarResize());
            expect(result.current.sidebarWidth).toBe(300);
        });

        it('should use default if localStorage has invalid value', () => {
            localStorage.setItem('sidebarWidth', 'invalid');
            const { result } = renderHook(() => useSidebarResize());
            expect(result.current.sidebarWidth).toBe(240);
        });

        it('should initialize with isResizing as false', () => {
            const { result } = renderHook(() => useSidebarResize());
            expect(result.current.isResizing).toBe(false);
        });

        it('should persist initial width to localStorage', () => {
            renderHook(() => useSidebarResize());
            expect(localStorage.getItem('sidebarWidth')).toBe('240');
        });
    });

    describe('startResizing', () => {
        it('should set isResizing to true', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            expect(result.current.isResizing).toBe(true);
        });

        it('should add event listeners when resizing starts', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

            addEventListenerSpy.mockRestore();
        });
    });

    describe('resize behavior', () => {
        it('should update width on mousemove when resizing', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 350 });
                window.dispatchEvent(mouseMoveEvent);
            });

            expect(result.current.sidebarWidth).toBe(350);
        });

        it('should enforce minimum width (150px)', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 100 });
                window.dispatchEvent(mouseMoveEvent);
            });

            expect(result.current.sidebarWidth).toBe(150);
        });

        it('should enforce maximum width (600px)', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 700 });
                window.dispatchEvent(mouseMoveEvent);
            });

            expect(result.current.sidebarWidth).toBe(600);
        });

        it('should not update width when not resizing', () => {
            const { result } = renderHook(() => useSidebarResize());
            const initialWidth = result.current.sidebarWidth;

            act(() => {
                const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 350 });
                window.dispatchEvent(mouseMoveEvent);
            });

            expect(result.current.sidebarWidth).toBe(initialWidth);
        });

        it('should persist width changes to localStorage', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 350 });
                window.dispatchEvent(mouseMoveEvent);
            });

            expect(localStorage.getItem('sidebarWidth')).toBe('350');
        });
    });

    describe('stopResizing', () => {
        it('should set isResizing to false on mouseup', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                const mouseUpEvent = new MouseEvent('mouseup');
                window.dispatchEvent(mouseUpEvent);
            });

            expect(result.current.isResizing).toBe(false);
        });

        it('should remove event listeners when resizing stops', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                const mouseUpEvent = new MouseEvent('mouseup');
                window.dispatchEvent(mouseUpEvent);
            });

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });
    });

    describe('cleanup', () => {
        it('should remove event listeners on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            const { result, unmount } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });
    });

    describe('edge cases', () => {
        it('should handle rapid resize operations', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300 }));
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: 350 }));
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }));
            });

            expect(result.current.sidebarWidth).toBe(400);
        });

        it('should handle resize at exact minimum boundary', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));
            });

            expect(result.current.sidebarWidth).toBe(150);
        });

        it('should handle resize at exact maximum boundary', () => {
            const { result } = renderHook(() => useSidebarResize());

            act(() => {
                result.current.startResizing();
            });

            act(() => {
                window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));
            });

            expect(result.current.sidebarWidth).toBe(600);
        });
    });
});
