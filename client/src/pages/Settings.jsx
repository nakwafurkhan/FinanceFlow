import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Palette, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi, exportApi } from '../api/endpoints';
import GlassCard from '../components/GlassCard';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#6366F1');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ name, avatarColor });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const download = async (type) => {
    setDownloading(type);
    try {
      await exportApi[type]();
      toast.success(`${type.toUpperCase()} downloaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">Settings</h2>

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <User size={16} className="text-indigo-500" />
          <h3 className="font-semibold">Profile</h3>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-3xl text-2xl font-bold text-white shadow-glow"
              style={{ background: avatarColor }}
            >
              {name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <label className="label mb-1.5 block">Display name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label mb-1.5 block">Avatar color</label>
            <div className="flex flex-wrap gap-2">
              {['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#0EA5E9', '#F97066', '#8B5CF6'].map(
                (c) => {
                  const selected = avatarColor === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      aria-label={c}
                      className="h-9 w-9 rounded-full transition-transform"
                      style={{
                        background: c,
                        // boxShadow is the trick: outer ring + inner offset
                        boxShadow: selected
                          ? `0 0 0 2px var(--tw-ring-offset, white), 0 0 0 4px ${c}`
                          : 'none',
                        transform: selected ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  );
                }
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Palette size={16} className="text-indigo-500" />
          <h3 className="font-semibold">Appearance</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-xs text-ink-500">Switch between light and dark mode</div>
          </div>
          <button onClick={toggleTheme} className="btn-ghost">
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Download size={16} className="text-indigo-500" />
          <h3 className="font-semibold">Export your data</h3>
        </div>
        <p className="mb-4 text-sm text-ink-500">
          Download all your expenses as a CSV (for Excel) or PDF (for printing).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => download('csv')}
            disabled={downloading === 'csv'}
            className="btn-ghost"
          >
            {downloading === 'csv' ? 'Preparing…' : 'Download CSV'}
          </button>
          <button
            type="button"
            onClick={() => download('pdf')}
            disabled={downloading === 'pdf'}
            className="btn-ghost"
          >
            {downloading === 'pdf' ? 'Preparing…' : 'Download PDF'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
