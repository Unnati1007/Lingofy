import { useState, useEffect, useCallback } from 'react';

const MIN_WIDTH = 88;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 280;
const COLLAPSE_THRESHOLD = 140;

export function useResizableSidebar() {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('lingofy_sidebar_width');
    const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    return isNaN(parsed) ? DEFAULT_WIDTH : Math.min(Math.max(parsed, 180), MAX_WIDTH);
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('lingofy_sidebar_collapsed');
    return saved === 'true';
  });

  const [isResizing, setIsResizing] = useState<boolean>(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('lingofy_sidebar_collapsed', next.toString());
      if (!next && sidebarWidth < 180) {
        setSidebarWidth(DEFAULT_WIDTH);
        localStorage.setItem('lingofy_sidebar_width', DEFAULT_WIDTH.toString());
      }
      return next;
    });
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const clientX = e.clientX;
      if (clientX < COLLAPSE_THRESHOLD) {
        setIsSidebarCollapsed(true);
        localStorage.setItem('lingofy_sidebar_collapsed', 'true');
      } else {
        setIsSidebarCollapsed(false);
        localStorage.setItem('lingofy_sidebar_collapsed', 'false');
        const clampedWidth = Math.min(Math.max(clientX, 180), MAX_WIDTH);
        setSidebarWidth(clampedWidth);
        localStorage.setItem('lingofy_sidebar_width', clampedWidth.toString());
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const effectiveWidth = isSidebarCollapsed ? MIN_WIDTH : sidebarWidth;
  const isCompact = isSidebarCollapsed || effectiveWidth < 180;

  return {
    sidebarWidth,
    effectiveWidth,
    isSidebarCollapsed,
    isCompact,
    isResizing,
    startResizing,
    toggleSidebar,
    setIsSidebarCollapsed,
  };
}
