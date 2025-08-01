import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useThemeStore } from '../store/useThemeStore.js';
import {
  Bell,
  Lock,
  Moon,
  Palette,
  Shield,
  Sun,
  Users,
  Volume2,
  ChevronDown,
} from 'lucide-react';

const SettingsPage = () => {
  const { logout } = useAuthStore();
  const { theme, setTheme, initializeTheme } = useThemeStore();
  const [settings, setSettings] = useState({
    theme: 'light', // Default value
    notifications: true,
    soundEnabled: true,
    language: 'en',
    privacy: 'friends',
    showOnlineStatus: true,
  });

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Initialize settings with current theme when theme is available
  useEffect(() => {
    if (theme) {
      setSettings((prev) => ({ ...prev, theme }));
    }
  }, [theme]);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !dropdownRefs.current[openDropdown]?.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Optimized theme change handler
  const handleThemeChange = useCallback((newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
    setOpenDropdown(null);
  }, [setTheme]);

  const handleSettingChange = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      setTheme(value);
    }
    setOpenDropdown(null);
  }, [setTheme]);

  const toggleDropdown = useCallback((dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  }, [openDropdown]);

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

  // Optimized Custom Dropdown Component
  const CustomDropdown = ({ 
    value, 
    onChange, 
    options, 
    dropdownName, 
    placeholder = "Select option" 
  }) => {
    const isOpen = openDropdown === dropdownName;
    const selectedOption = options.find(opt => opt.value === value);

    const handleOptionClick = useCallback((optionValue) => {
      onChange(optionValue);
    }, [onChange]);

    return (
      <div className="relative" ref={el => dropdownRefs.current[dropdownName] = el}>
        <button
          type="button"
          onClick={() => toggleDropdown(dropdownName)}
          className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 min-w-[120px] transition-colors"
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                  option.value === value 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

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
              <CustomDropdown
                value={settings.theme}
                onChange={handleThemeChange}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System' }
                ]}
                dropdownName="theme"
                placeholder="Select theme"
              />
            </SettingItem>

            <SettingItem
              icon={Palette}
              title="Language"
              description="Select your preferred language"
            >
              <CustomDropdown
                value={settings.language}
                onChange={(value) => handleSettingChange('language', value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' }
                ]}
                dropdownName="language"
                placeholder="Select language"
              />
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
              <CustomDropdown
                value={settings.privacy}
                onChange={(value) => handleSettingChange('privacy', value)}
                options={[
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'friends', label: 'Friends Only' },
                  { value: 'nobody', label: 'Nobody' }
                ]}
                dropdownName="privacy"
                placeholder="Select privacy"
              />
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
            
            {/* Theme Test Section */}
            <SettingItem
              icon={Sun}
              title="Theme Test"
              description="Test theme switching functionality"
            >
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  System
                </button>
              </div>
            </SettingItem>
            
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