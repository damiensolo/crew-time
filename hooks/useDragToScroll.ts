import { useRef, useEffect, useState, RefObject } from 'react';

export const useDragToScroll = (ref: RefObject<HTMLElement>) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const scrollTop = useRef(0);

  const handleMouseDown = (e: MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    startY.current = e.pageY - ref.current.offsetTop;
    scrollTop.current = ref.current.scrollTop;
    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (ref.current) {
      ref.current.style.cursor = 'grab';
      ref.current.style.userSelect = 'auto';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
     if (ref.current) {
      ref.current.style.cursor = 'grab';
      ref.current.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const y = e.pageY - ref.current.offsetTop;
    const walk = (y - startY.current) * 2; // scroll-fast
    ref.current.scrollTop = scrollTop.current - walk;
  };
  
  useEffect(() => {
    const element = ref.current;
    if (element) {
        element.style.cursor = 'grab';
        
        const currentHandleMouseDown = (e: Event) => handleMouseDown(e as unknown as MouseEvent);
        const currentHandleMouseLeave = () => handleMouseLeave();
        const currentHandleMouseUp = () => handleMouseUp();
        const currentHandleMouseMove = (e: Event) => handleMouseMove(e as unknown as MouseEvent);

        element.addEventListener('mousedown', currentHandleMouseDown);
        element.addEventListener('mouseleave', currentHandleMouseLeave);
        element.addEventListener('mouseup', currentHandleMouseUp);
        element.addEventListener('mousemove', currentHandleMouseMove);

        return () => {
            element.removeEventListener('mousedown', currentHandleMouseDown);
            element.removeEventListener('mouseleave', currentHandleMouseLeave);
            element.removeEventListener('mouseup', currentHandleMouseUp);
            element.removeEventListener('mousemove', currentHandleMouseMove);
        };
    }
  }, [ref, isDragging]);
};
