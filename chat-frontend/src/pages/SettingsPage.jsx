import { useState, useEffect } from 'react';
import { useAuthStore } from '../Store/useAuthStore';
import { useThemeStore } from '../Store/useThemeStore';
import {
  Bell,
  Globe,
  Lock,
  Moon,
  Palette,
  Shield,
  Sun,
  Users,
  Volume2,
} from 'lucide-react';

const SettingsPage = () => {
  const { authUser, logout } = useAuthStore();
  const { theme, setTheme, initializeTheme } = useThemeStore();
  const [settings, setSettings] = useState({
    theme: theme,
    notifications: true,
    soundEnabled: true,
    language: 'en',
    privacy: 'friends',
    showOnlineStatus: true,
  });

  useEffect(() => {
    setSettings((prev) => ({ ...prev, theme }));
  }, [theme]);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const SettingItem = ({ icon: Icon, title, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="card p-8 space-y-8 bg-white dark:bg-gray-800 dark:text-gray-100">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your app preferences</p>
          </div>

          {/* Appearance */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>

            <SettingItem
              icon={settings.theme === 'light' ? Sun : Moon}
              title="Theme"
              description="Choose your preferred theme"
            >
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="input w-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={Palette}
              title="Language"
              description="Select your preferred language"
            >
              <select
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="input w-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </SettingItem>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>

            <SettingItem
              icon={Bell}
              title="Push Notifications"
              description="Receive notifications for new messages"
            >
              <Toggle
                checked={settings.notifications}
                onChange={(value) => handleSettingChange('notifications', value)}
              />
            </SettingItem>

            <SettingItem
              icon={Volume2}
              title="Sound Effects"
              description="Play sound effects for notifications"
            >
              <Toggle
                checked={settings.soundEnabled}
                onChange={(value) => handleSettingChange('soundEnabled', value)}
              />
            </SettingItem>
          </div>

          {/* Privacy */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Privacy</h2>

            <SettingItem
              icon={Shield}
              title="Privacy Settings"
              description="Who can see your profile"
            >
              <select
                value={settings.privacy}
                onChange={(e) => handleSettingChange('privacy', e.target.value)}
                className="input w-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              >
                <option value="everyone">Everyone</option>
                <option value="friends">Friends Only</option>
                <option value="nobody">Nobody</option>
              </select>
            </SettingItem>

            <SettingItem
              icon={Users}
              title="Online Status"
              description="Show when you're online"
            >
              <Toggle
                checked={settings.showOnlineStatus}
                onChange={(value) => handleSettingChange('showOnlineStatus', value)}
              />
            </SettingItem>
          </div>

          {/* Account Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account</h2>
            <SettingItem
              icon={Lock}
              title="Sign Out"
              description="Sign out from your account"
            >
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
            </SettingItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

/* Add this to your global CSS (e.g., index.css or App.css):
.force-light, .force-light * {
  background-color: #f9fafb !important;
  color: #111827 !important;
}
*/