import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, Check, X } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useEffect, useState } from "react";
import { fileService } from "@/services/fileService";
import { toast } from "react-toastify";
import { FileDTO, shareNotification } from "@/types/types";
import { connectWebSocket, stompClient } from "@/utils/WebSocket";
import { FileItem, useFileStore } from "@/store/fileStore";

export function NotificationsDropdown({
    userId,
}: {
    userId: number;
}) {
    // Sample notifications data
    const [newNotification, setnewNotification] = useState(true);
    const [notesNumber, setNotesNumber] = useState(0);
    const [notifications, setNotifications] = useState<shareNotification[]>([]);
    const { files,setFiles } = useFileStore();
    useEffect(() => {
        if (!stompClient.active) {
            connectWebSocket(setNotifications, setNotesNumber);
            
        }
    })


    const handleResponse = async (id: number, response: boolean) => {
        try {
            const file = await fileService.shareResponse(id, response) as FileDTO;
            console.log(file);
            const fileItem = {
                id: file.id.toString(), // Convertir number en string si nécessaire
                name: file.originalFileName,
                originalName: file.originalFileName,
                type: file.contentType,
                size: file.fileSize,
                uuid: file.fileUuid,
                isFavorite: file.isFavorite,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt,
                extension: file.fileExtension,
                formattedSize: file.formattedFileSize,
            } as unknown as FileItem;
            setFiles([...files,fileItem]);
            setNotifications(notifications.filter((n) => n.id !== id));
            if (response) {
                toast.info("you have access to the file now")
            }
            else {
                toast.info("you have declined the file")
            }
        } catch (error) {
            console.log(error)
        }

        // Add your logic here

    };


    const onOpenChange = async (open: boolean) => {
        if (open) {

            const response = await fileService.getShareNotfications(userId);
            setNotifications(response);
            setNotesNumber(0);
        }


    }

    return (
        <DropdownMenu.Root onOpenChange={onOpenChange}>
            <DropdownMenu.Trigger asChild>
                <button className="relative p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors duration-300">
                    <Bell className="w-5 h-5 text-slate-600" />
                    {newNotification && (
                        <span className={`absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs ${notesNumber == 0 ? "hidden" : ""} `}>{notesNumber}</span>
                    )}
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={10}
                    className="w-80 rounded-lg bg-white shadow-lg border border-gray-200 z-50 animate-in fade-in zoom-in-95"
                >
                    <div className="p-2 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <DropdownMenu.Item
                                    key={notification.id}
                                    className="outline-none"
                                >
                                    <NotificationItem
                                        fileName={notification.fileName}
                                        owner={notification.owner}
                                        onAccept={() => handleResponse(notification.id, true)}
                                        onDecline={() => handleResponse(notification.id, false)}
                                    />
                                </DropdownMenu.Item>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No new notifications
                            </div>
                        )}
                    </div>

                    {/* {notifications.length > 0 && (
                        <div className="p-2 border-t border-gray-200 text-center">
                            <button className="text-sm text-blue-600 hover:text-blue-800">
                                Mark all as read
                            </button>
                        </div>
                    )} */}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}