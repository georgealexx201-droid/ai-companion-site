"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0f2a] p-6 text-center shadow-2xl">
        <h2 className="mb-2 text-2xl font-bold text-white">
          🚀 Free Limit Reached
        </h2>

        <p className="mb-6 text-white/70">
          You have used all your free messages for today.
        </p>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="mb-2 font-semibold text-white">
            Upgrade to Premium for:
          </div>
          <div>✨ Unlimited messages</div>
          <div>🔓 Premium characters</div>
          <div>👑 Premium access</div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-white transition hover:bg-white/10"
          >
            Maybe Later
          </button>

          <a
            href="/premium"
            className="flex-1 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 font-semibold text-black"
          >
            Upgrade
          </a>
        </div>
      </div>
    </div>
  );
}