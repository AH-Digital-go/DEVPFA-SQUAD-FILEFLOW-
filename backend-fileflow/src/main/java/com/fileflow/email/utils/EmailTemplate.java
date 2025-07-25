package com.fileflow.email.utils;

import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class EmailTemplate {
    public static String loadEmailTemplate(String templateName, Map<String, String> variables) throws IOException {
        ClassPathResource resource = new ClassPathResource("email/" + templateName);
        String body = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        for (Map.Entry<String, String> entry : variables.entrySet()) {
            body = body.replace(entry.getKey(), entry.getValue());
        }

        return body;
    }
}
