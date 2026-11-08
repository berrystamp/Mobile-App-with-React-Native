import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export function useShareAfterDismiss(visible: boolean) {
  const pendingShare = useRef<(() => void) | null>(null);
  const onDismiss = useCallback(() => {
    const action = pendingShare.current;
    pendingShare.current = null;
    action?.();
  }, []);

  useEffect(() => {
    if (visible || Platform.OS === 'ios') return;
    const timer = setTimeout(onDismiss, 350);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  const share = (action: () => void, close: () => void) => {
    if (Platform.OS === 'web') {
      close();
      action();
      return;
    }
    pendingShare.current = action;
    close();
  };
  return { share, onDismiss };
}
