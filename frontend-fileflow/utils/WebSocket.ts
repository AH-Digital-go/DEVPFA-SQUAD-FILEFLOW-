import { useAuthStore } from "@/store/authStore";
import { shareNotification } from "@/types/types";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const SOCKET_URL = 'http://localhost:8088/ws';
const socket = new SockJS(SOCKET_URL);
// let stompClient: Client | null = null;
export const stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
        Authorization: `Bearer ${useAuthStore.getState().accessToken}` || "Bearer ",
    },
    reconnectDelay: 5000,
});



export const connectWebSocket = (setNewNotification: (newNotification: shareNotification[]) => void, setNotesNumber: (noteNumber: number) => void): void => {

    stompClient.onConnect = () => {
        console.log("[WEBSOCKET] Connected");

        stompClient?.subscribe("/user/queue/notify", (message: IMessage) => {
            console.log("notification received: ", message);
            const body = JSON.parse(message.body);
            setNewNotification(prev => {
                const exists = prev.some((item: { id: any; }) => item.id === body.id); // or any unique field
                if (!exists) {
                    return [...prev, body];
                }
            });
            setNotesNumber((prev: number) => prev + 1)
            console.log(body);
        });
        stompClient?.subscribe("/topic/public", (message: IMessage) => {
            console.log("received soemthing: ", message.body);


        });
    };

    stompClient.onWebSocketError = (error) => {
        console.error('Error with websocket', error);
    };

    stompClient.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
    };
    stompClient.onDisconnect = () => {
        console.log("[WEBSOCKET] Disconnected");
    }

    stompClient.activate();

};


export const disconnectWebSocket = (): void => {
    if (stompClient && stompClient.connected) {
        stompClient.deactivate();
        console.log("[WEBSOCKET] Disconnected");
    }
}