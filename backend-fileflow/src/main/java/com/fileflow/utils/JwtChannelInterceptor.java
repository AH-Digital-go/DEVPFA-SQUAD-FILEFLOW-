package com.fileflow.utils;

import com.fileflow.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtils;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            if (authHeaders != null && !authHeaders.isEmpty()) {
                String jwt = authHeaders.get(0).substring(7);
                if (jwtUtils.validateToken(jwt)) {
                    String username = jwtUtils.extractUsername(jwt);
                    accessor.setUser(new UsernamePasswordAuthenticationToken(username, null, List.of()));
                }
            }
        }

        return message;
    }
}
