import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Edit3,
  Download,
  Share2,
  Heart,
  Trash2,
  MoreVertical
} from 'lucide-react';

export function FileDropdownMenu({
  onRename,
  onDownload,
  onShare,
  onToggleFavorite,
  onDelete,
  isFavorite,
  onOpenChange
}: {
  onRename: () => void;
  onDownload: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  isFavorite: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <div className="absolute top-4 right-4">
      <DropdownMenu.Root onOpenChange={onOpenChange}>
        <DropdownMenu.Trigger asChild>
          <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors opacity-20 group-hover:opacity-100 hover:opacity-100" >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-in fade-in zoom-in-95"
          >
            <DropdownMenu.Item
              onClick={onRename}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
            >
              <Edit3 className="w-4 h-4 mr-3" />
              Renommer
            </DropdownMenu.Item>
            
            <DropdownMenu.Item
              onClick={onDownload}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
            >
              <Download className="w-4 h-4 mr-3" />
              Télécharger
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={onShare}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
            >
              <Share2 className="w-4 h-4 mr-3" />
              Partager
            </DropdownMenu.Item>
            
            <DropdownMenu.Item
              onClick={onToggleFavorite}
              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
            >
              <Heart className={`w-4 h-4 mr-3 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </DropdownMenu.Item>
            
            <DropdownMenu.Separator className="h-px bg-slate-200 my-1" />
            
            <DropdownMenu.Item
              onClick={onDelete}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 outline-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              Supprimer
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}