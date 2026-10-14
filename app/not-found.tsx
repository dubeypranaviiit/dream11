import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center shadow-xl">
        <h2 className="text-4xl font-black text-rose-500 mb-2">404</h2>
        <h3 className="text-lg font-bold text-white mb-2">Page Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">
          The requested page does not exist in Match Pulse. Return to the live match center.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Match Pulse
        </Link>
      </div>
    </div>
  );
}
