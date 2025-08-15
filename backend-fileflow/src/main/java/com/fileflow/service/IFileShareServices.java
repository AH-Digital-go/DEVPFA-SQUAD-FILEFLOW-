package com.fileflow.service;



import com.fileflow.dto.FileDTO;
import com.fileflow.dto.ShareNotificationDTO;
import com.fileflow.exception.UserNotFoundException;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

public interface IFileShareServices {

    ShareNotificationDTO shareFileWithUser(Long fileId, String userEmail) throws UserNotFoundException, FileNotFoundException, IOException;

    void unshareFile(Long fileId,String userEmail) throws UserNotFoundException, FileNotFoundException, IOException;
    FileDTO shareResponse(Long fileShareId, boolean response) ;

    List<FileDTO> getSharedFilesWithMe(Long userId);

    List<FileDTO> getSharedFilesByMe(Long userId);

    List<String> getUsersEmailWhoShareMyFile(Long fileId);
}
