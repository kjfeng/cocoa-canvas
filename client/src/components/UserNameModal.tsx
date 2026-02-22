import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { User } from 'lucide-react';

export default function UserNameModal() {
  const [name, setName] = useState('');
  const setUserName = useUserStore((s) => s.setUserName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setUserName(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
            <User size={16} className="text-stone-500" />
          </div>
          <h2 className="text-base font-semibold text-stone-800">Join canvas</h2>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          Enter your name to start collaborating.
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoFocus
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 placeholder:text-stone-300"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-4 w-full px-4 py-2 text-sm font-medium bg-stone-800 hover:bg-stone-900 text-white rounded-lg transition-colors disabled:opacity-40"
        >
          Join
        </button>
      </form>
    </div>
  );
}
