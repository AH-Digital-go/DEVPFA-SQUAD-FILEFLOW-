package com.fileflow.controller;

import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@AllArgsConstructor
public class NotificationController {

    private final SimpMessageSendingOperations messagingTemplate;

    @PostMapping("/test")
    public void testMessage() {
        messagingTemplate.convertAndSend("/topic/public", "Hello from server!");
    }

}
