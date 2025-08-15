import { Button } from "./ui/button"; // Or your button component
import { Check, X } from "lucide-react";

interface NotificationItemProps {
  fileName:string;
  onAccept: () => void;
  onDecline: () => void;
  owner:string;
}

export function NotificationItem({
  fileName,
  onAccept,
  onDecline,
  owner
}: NotificationItemProps) {
  return (
    <div className="p-3 border-b border-gray-200 last:border-b-0">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm text-gray-800"><span className="font-bold">{owner}</span>  shared </p>
        
      </div>
      <p className="text-xs text-gray-500 pb-2">{fileName}</p>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onAccept}
          className="h-8 px-3 hover:bg-green-400 text-white bg-green-600 border-0 hover:text-white"
        >
          <Check className="h-4 w-4 mr-1" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDecline}
          className="h-8 px-3 hover:bg-red-500 border-0 text-white bg-red-600 hover:text-white"
        >
          <X className="h-4 w-4 mr-1 " />
          Decline
        </Button>
      </div>
    </div>
  );
}