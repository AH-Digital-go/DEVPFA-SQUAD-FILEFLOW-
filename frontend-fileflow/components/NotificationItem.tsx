import { Button } from "./ui/button"; // Or your button component
import { Check, X, File, Folder } from "lucide-react";

interface NotificationItemProps {
  fileName?: string;
  folderName?: string;
  type: 'file' | 'folder';
  onAccept: () => void;
  onDecline: () => void;
  owner: string;
  message?: string;
  permissions?: string;
}

export function NotificationItem({
  fileName,
  folderName,
  type,
  onAccept,
  onDecline,
  owner,
  message,
  permissions
}: NotificationItemProps) {
  const itemName = type === 'file' ? fileName : folderName;
  const itemType = type === 'file' ? 'fichier' : 'dossier';
  const Icon = type === 'file' ? File : Folder;
  
  const getPermissionLabel = (permission?: string) => {
    if (!permission) return '';
    switch (permission.toLowerCase()) {
      case 'read': return 'lecture seule';
      case 'write': return 'lecture et écriture';
      case 'admin': return 'administration';
      default: return permission;
    }
  };

  return (
    <div className="p-3 border-b border-gray-200 last:border-b-0">
      <div className="flex items-start gap-3 mb-2">
        <div className={`p-2 rounded-lg ${type === 'file' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            <span className="font-bold">{owner}</span> souhaite partager un {itemType}
          </p>
          <p className="text-xs text-gray-900 font-medium truncate">{itemName}</p>
          {permissions && (
            <p className="text-xs text-gray-500">
              Permissions: {getPermissionLabel(permissions)}
            </p>
          )}
          {message && (
            <p className="text-xs text-gray-500 italic mt-1">"{message}"</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onAccept}
          className="h-8 px-3 hover:bg-green-400 text-white bg-green-600 border-0 hover:text-white"
        >
          <Check className="h-4 w-4 mr-1" />
          Accepter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDecline}
          className="h-8 px-3 hover:bg-red-500 border-0 text-white bg-red-600 hover:text-white"
        >
          <X className="h-4 w-4 mr-1 " />
          Refuser
        </Button>
      </div>
    </div>
  );
}