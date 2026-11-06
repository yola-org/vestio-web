'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

type NotificationType = 'success' | 'error' | 'info';

type Notification = {
  id: number;
  message: string;
  type: NotificationType;
};

type NotificationContextValue = {
  notify: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const push = useCallback((type: NotificationType, message: string) => {
    const id = Date.now() + Math.random();
    setNotifications((current) => {
      // Last write wins - keep only the most recent notification
      return [{ id, message, type }];
    });
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const notify = useMemo(() => ({
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
  }), [push]);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const detail = (event as CustomEvent<{ type: NotificationType; message: string }>).detail;
      if (detail?.message && ['success', 'error', 'info'].includes(detail.type)) {
        push(detail.type, detail.message);
      }
    };

    window.addEventListener('vestio:notification', handleNotification);
    return () => window.removeEventListener('vestio:notification', handleNotification);
  }, [push]);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 end-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            role={notification.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start justify-between gap-4 rounded-xl border bg-white p-4 shadow-xl ${
              notification.type === 'error'
                ? 'border-red-200 text-red-800'
                : notification.type === 'success'
                  ? 'border-green-200 text-green-800'
                  : 'border-blue-200 text-blue-800'
            }`}
          >
            <p className="text-sm font-medium">{notification.type == 'error' ? t('errors.genericMessage') : notification.message}</p>
            <button
              type="button"
              className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
              aria-label={t('notifications.close')}
              onClick={() => dismiss(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}