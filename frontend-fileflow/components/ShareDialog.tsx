import * as Dialog from '@radix-ui/react-dialog';
import { X, Trash2, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareDialogProps {
  sharedWith: string[];
  onShare: (email: string) => void;
  onUnshare: (email: string) => void;
  //children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareDialog({ sharedWith, onShare, onUnshare, open, onOpenChange }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  //const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onShare(email.trim());
      setEmail('');
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {/* <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger> */}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50 focus:outline-none">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium text-slate-800">
              Share File
            </Dialog.Title>
            <Dialog.Close className="text-slate-500 hover:text-slate-700 rounded-lg p-1">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </form>

          {sharedWith!=null && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-2">Shared with</h3>
              <ul className="space-y-2">
                {sharedWith.map((sharedEmail) => (
                  <li key={sharedEmail} className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">{sharedEmail}</span>
                    <button
                      onClick={() => onUnshare(sharedEmail)}
                      className="text-slate-500 hover:text-red-500 p-1 rounded-full hover:bg-slate-200 transition-colors"
                      aria-label={`Unshare with ${sharedEmail}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}