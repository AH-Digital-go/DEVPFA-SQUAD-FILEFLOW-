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
    const [newNotification, setnewNotification] = useState(true);
    const [notesNumber, setNotesNumber] = useState(0);
    const [notifications, setNotifications] = useState<shareNotification[]>([]);
    const { files, setFiles } = useFileStore();

    // Load initial notifications and count on mount
    useEffect(() => {
        const loadInitialNotifications = async () => {
            try {
                const initialNotifications = await fileService.getAllShareNotifications(userId);
                setNotifications(initialNotifications);
                setNotesNumber(initialNotifications.length);
            } catch (error) {
                console.error("Error loading initial notifications:", error);
            }
        };

        loadInitialNotifications();

        // Setup WebSocket connection
        if (!stompClient.active) {
            connectWebSocket(setNotifications, setNotesNumber);
        }
    }, [userId]);

    const handleResponse = async (notification: shareNotification, response: boolean) => {
        try {
            if (notification.type === 'file') {
                const file = await fileService.shareResponse(notification.id, response) as FileDTO;
                console.log(file);
                const fileItem = {
                    id: file.id.toString(),
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
                setFiles([...files, fileItem]);
                if (response) {
                    toast.info("Vous avez maintenant accès au fichier");
                } else {
                    toast.info("Vous avez refusé le fichier");
                }
            } else if (notification.type === 'folder') {
                await fileService.respondToFolderShare(notification.id, response);
                if (response) {
                    toast.info("Vous avez maintenant accès au dossier");
                } else {
                    toast.info("Vous avez refusé le dossier");
                }
            }
            
            // Remove notification from list and decrease count
            const updatedNotifications = notifications.filter((n) => n.id !== notification.id);
            setNotifications(updatedNotifications);
            setNotesNumber(Math.max(0, notesNumber - 1));
        } catch (error) {
            console.log(error);
            toast.error("Erreur lors de la réponse à la notification");
        }
    };

    const onOpenChange = async (open: boolean) => {
        if (open) {
            // Refresh notifications when dropdown opens but don't reset count
            try {
                const response = await fileService.getAllShareNotifications(userId);
                setNotifications(response);
                // Only update count if we have fewer notifications than the badge shows
                if (response.length !== notesNumber) {
                    setNotesNumber(response.length);
                }
            } catch (error) {
                console.error("Error refreshing notifications:", error);
            }
        }
    };

    return (
        <DropdownMenu.Root onOpenChange={onOpenChange}>
                            <DropdownMenu.Trigger className="relative hover:bg-gray-200 p-2 rounded-full">
                    <Bell className="h-6 w-6" />
                    <div
                        className={`absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center ${
                            notesNumber > 0 ? "" : "hidden"
                        }`}
                    >
                        {notesNumber}
                    </div>
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
                                        folderName={notification.folderName}
                                        type={notification.type}
                                        owner={notification.owner}
                                        message={notification.message}
                                        permissions={notification.permissions}
                                        onAccept={() => handleResponse(notification, true)}
                                        onDecline={() => handleResponse(notification, false)}
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