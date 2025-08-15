package com.fileflow.utils;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.io.Console;
import java.security.Principal;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@AllArgsConstructor
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    private final Map<String, String> sessionIdToUsername = new ConcurrentHashMap<>();
    private final SimpMessageSendingOperations messagingTemplate;
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();
        if (user != null) {
            String username = user.getName();
            String sessionId = accessor.getSessionId();
            sessionIdToUsername.put(sessionId, username);

            logger.debug("🔌 User connected: {} (session: {})", username, sessionId);
            messagingTemplate.convertAndSend("/topic/public",username);
        }

    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String username = sessionIdToUsername.remove(sessionId);
        if (username != null) {
            log.debug("User disconnected: {}", username);
        }
    }

    public Set<String> getConnectedUsers() {
        return new HashSet<>(sessionIdToUsername.values());
    }
}
