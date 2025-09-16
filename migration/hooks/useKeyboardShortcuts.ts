import { useEffect, useCallback } from 'react';
import { KeyboardShortcut, ViewMode } from '../types';

interface UseKeyboardShortcutsProps {
  isOpen: boolean;
  viewMode?: ViewMode;
  onClose: () => void;
  onToggleViewMode?: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onFocusSearch?: () => void;
  onOpenInNewWindow?: () => void;
  // 추가 커스텀 단축키
  customShortcuts?: KeyboardShortcut[];
}

export const useKeyboardShortcuts = ({
  isOpen,
  viewMode,
  onClose,
  onToggleViewMode,
  onNavigate,
  onFocusSearch,
  onOpenInNewWindow,
  customShortcuts = []
}: UseKeyboardShortcutsProps) => {
  
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'Escape',
      action: () => {
        if (viewMode === 'expanded' && onToggleViewMode) {
          onToggleViewMode();
        } else {
          onClose();
        }
      },
      description: 'Close modal or collapse view'
    },
    ...(onToggleViewMode ? [{
      key: ' ',
      action: onToggleViewMode,
      description: 'Toggle summary/expanded view'
    }] : []),
    ...(onNavigate ? [
      {
        key: 'ArrowUp',
        action: () => onNavigate('prev'),
        description: 'Navigate to previous log'
      },
      {
        key: 'ArrowDown',
        action: () => onNavigate('next'),
        description: 'Navigate to next log'
      }
    ] : []),
    ...(onFocusSearch ? [{
      key: 'f',
      ctrlKey: true,
      action: onFocusSearch,
      description: 'Focus search input'
    }] : []),
    ...(onOpenInNewWindow ? [{
      key: 'n',
      ctrlKey: true,
      action: onOpenInNewWindow,
      description: 'Open in new window'
    }] : [])
  ];

  // 기본 단축키와 커스텀 단축키 결합
  const allShortcuts = [...defaultShortcuts, ...customShortcuts];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    // 입력 필드에서는 단축키 비활성화 (Ctrl+F 제외)
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Ctrl+F는 입력 필드에서도 허용
      if (event.key === 'f' && event.ctrlKey && onFocusSearch) {
        event.preventDefault();
        onFocusSearch();
      }
      return;
    }

    // 단축키 매칭
    const shortcut = allShortcuts.find(s => {
      const keyMatch = s.key === event.key;
      const ctrlMatch = (s.ctrlKey || false) === event.ctrlKey;
      const altMatch = (s.altKey || false) === event.altKey;
      const metaMatch = (s.metaKey || false) === event.metaKey;
      
      return keyMatch && ctrlMatch && altMatch && metaMatch;
    });

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }, [
    isOpen,
    allShortcuts,
    onFocusSearch
  ]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return allShortcuts;
};