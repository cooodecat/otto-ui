'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  X, Settings, Palette, Bell, Keyboard, Zap, 
  Download, Upload, RotateCcw, Check, Moon, Sun, Monitor
} from 'lucide-react';
import { useUserPreferences } from '@/hooks/logs/useUserPreferences';
import { cn } from '@/lib/utils';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, userId }) => {
  const { 
    preferences, 
    updatePreferences, 
    updateNestedPreference,
    resetPreferences, 
    exportPreferences, 
    importPreferences 
  } = useUserPreferences(userId);
  
  const [activeTab, setActiveTab] = useState<'view' | 'notifications' | 'display' | 'performance' | 'keyboard'>('view');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importPreferences(file);
    }
  };

  const tabs = [
    { id: 'view', label: 'View', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'keyboard', label: 'Shortcuts', icon: Keyboard },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Preferences
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer",
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'view' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Default View</h3>
                  <div className="flex gap-2">
                    {(['cards', 'table', 'timeline'] as const).map(view => (
                      <button
                        key={view}
                        onClick={() => updatePreferences({ defaultView: view })}
                        className={cn(
                          "px-4 py-2 rounded-lg border transition-colors capitalize cursor-pointer",
                          preferences.defaultView === view
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Auto-scroll to new logs</span>
                    <input
                      type="checkbox"
                      checked={preferences.autoScroll}
                      onChange={(e) => updatePreferences({ autoScroll: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Show analytics by default</span>
                    <input
                      type="checkbox"
                      checked={preferences.showAnalytics}
                      onChange={(e) => updatePreferences({ showAnalytics: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Expand timeline groups</span>
                    <input
                      type="checkbox"
                      checked={preferences.expandedGroups}
                      onChange={(e) => updatePreferences({ expandedGroups: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Notification sound</span>
                    <input
                      type="checkbox"
                      checked={preferences.notificationSound}
                      onChange={(e) => updatePreferences({ notificationSound: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Show success toasts</span>
                    <input
                      type="checkbox"
                      checked={preferences.showSuccessToasts}
                      onChange={(e) => updatePreferences({ showSuccessToasts: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Show failure toasts</span>
                    <input
                      type="checkbox"
                      checked={preferences.showFailureToasts}
                      onChange={(e) => updatePreferences({ showFailureToasts: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Show info toasts</span>
                    <input
                      type="checkbox"
                      checked={preferences.showInfoToasts}
                      onChange={(e) => updatePreferences({ showInfoToasts: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">
                    Toast duration (ms)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="10000"
                    step="1000"
                    value={preferences.toastDuration}
                    onChange={(e) => updatePreferences({ toastDuration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Color Theme</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updatePreferences({ colorTheme: 'light' })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer",
                        preferences.colorTheme === 'light'
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => updatePreferences({ colorTheme: 'dark' })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer",
                        preferences.colorTheme === 'dark'
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                    <button
                      onClick={() => updatePreferences({ colorTheme: 'auto' })}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors cursor-pointer",
                        preferences.colorTheme === 'auto'
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Monitor className="w-4 h-4" />
                      Auto
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Compact mode</span>
                    <input
                      type="checkbox"
                      checked={preferences.compactMode}
                      onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Show relative time</span>
                    <input
                      type="checkbox"
                      checked={preferences.showRelativeTime}
                      onChange={(e) => updatePreferences({ showRelativeTime: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Show build numbers</span>
                    <input
                      type="checkbox"
                      checked={preferences.showBuildNumbers}
                      onChange={(e) => updatePreferences({ showBuildNumbers: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Default Log Filters</h3>
                  <div className="space-y-2">
                    {(['Errors', 'Warnings', 'Info', 'Debug'] as const).map((level) => {
                      const key = `show${level}` as keyof typeof preferences.defaultFilters;
                      return (
                        <label key={level} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Show {level}</span>
                          <input
                            type="checkbox"
                            checked={preferences.defaultFilters[key]}
                            onChange={(e) => updateNestedPreference('defaultFilters', { [key]: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">
                    Log retention
                  </label>
                  <select
                    value={preferences.logRetention}
                    onChange={(e) => updatePreferences({ logRetention: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1h">1 hour</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 block mb-2">
                    Max logs in view
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={preferences.maxLogsInView}
                    onChange={(e) => updatePreferences({ maxLogsInView: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Enable virtual scrolling</span>
                  <input
                    type="checkbox"
                    checked={preferences.enableVirtualScrolling}
                    onChange={(e) => updatePreferences({ enableVirtualScrolling: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            )}

            {activeTab === 'keyboard' && (
              <div className="space-y-6">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Enable keyboard shortcuts</span>
                  <input
                    type="checkbox"
                    checked={preferences.keyboardShortcutsEnabled}
                    onChange={(e) => updatePreferences({ keyboardShortcutsEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                {preferences.keyboardShortcutsEnabled && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">Custom Shortcuts</h3>
                    {Object.entries(preferences.customShortcuts).map(([action, key]) => (
                      <div key={action} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 capitalize">{action.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => updateNestedPreference('customShortcuts', { [action]: e.target.value })}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={exportPreferences}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              ) : (
                <button
                  onClick={() => {
                    resetPreferences();
                    setShowResetConfirm(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Confirm Reset
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PreferencesModal;