package com.fileflow.controller;


import com.fileflow.dto.FileDTO;
import com.fileflow.dto.FileShareDTO;
import com.fileflow.dto.ShareNotificationDTO;
import com.fileflow.entity.FileShare;
import com.fileflow.exception.ShareFileException;
import com.fileflow.exception.UserNotFoundException;
import com.fileflow.service.FileShareService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("api/file")
@AllArgsConstructor
public class FileShareController {
    private FileShareService fileShareService;
    private final SimpMessagingTemplate messagingTemplate;
    @PostMapping("/share/{fileId}")
    public ResponseEntity<String> shareFile(@PathVariable Long fileId, @RequestParam String userEmail) throws UserNotFoundException, FileNotFoundException, IOException {

        ShareNotificationDTO fileShare;
        try {
            fileShare = fileShareService.shareFileWithUser(fileId, userEmail);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (FileNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }

        messagingTemplate.convertAndSendToUser(
                userEmail,
                "/queue/notify",
                fileShare
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/share/requests")
    public ResponseEntity<List<ShareNotificationDTO>> shareRequests(@RequestParam Long userId) {
        List<ShareNotificationDTO> shareNotificationDTOList;
        try {
            shareNotificationDTOList = fileShareService.getShareRequests(userId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok().body(shareNotificationDTOList);
    }

    @PostMapping("/share/response/{shareFileId}")
    public ResponseEntity<?> shareResponse(@PathVariable Long shareFileId,@RequestParam boolean response){
            FileDTO fileDTO;
        try {
           fileDTO = fileShareService.shareResponse(shareFileId,response);
        } catch (ShareFileException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("this file was not found");
        }

        return ResponseEntity.ok().body(fileDTO);
    }

    @GetMapping("/shared/{fileId}/with")
    public ResponseEntity<List<String>> getFileUsersEmails(@PathVariable Long fileId){
        return ResponseEntity.ok().body(fileShareService.getUsersEmailWhoShareMyFile(fileId));
    }

    @GetMapping("/shared")
    public ResponseEntity<List<FileDTO>> getSharedFilesWithMe(@RequestParam Long userId){
        return ResponseEntity.ok().body(fileShareService.getSharedFilesWithMe(userId));
    }
    @GetMapping("/shared/by-me")
    public ResponseEntity<List<FileDTO>> SharedFilesByMe(@RequestParam Long userId){
        return ResponseEntity.ok().body(fileShareService.getSharedFilesByMe(userId));
    }

    @DeleteMapping("/{fileId}/share")
    public ResponseEntity<?> unshareFile(@PathVariable Long fileId,@RequestParam String userEmail){
        try {
            fileShareService.unshareFile(fileId,userEmail);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("user not found");
        } catch (FileNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("file not found");
        }
        return ResponseEntity.ok().build();
    }


}
