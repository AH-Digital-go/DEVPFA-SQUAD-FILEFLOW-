package com.fileflow.service;



import com.fileflow.dto.FileDTO;
import com.fileflow.exception.UserNotFoundException;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

public interface IFileShareServices {

    void shareFileWithUser(Long fileId, String userEmail) throws UserNotFoundException, FileNotFoundException, IOException;

    void unshareFile(Long fileId,String userEmail) throws UserNotFoundException, FileNotFoundException, IOException;
    void shareResponse(Long fileShareId,boolean response) ;

    List<FileDTO> getSharedFilesWithMe(Long userId);

    List<FileDTO> getSharedFilesByMe(Long userId);

    List<String> getUsersEmailWhoShareMyFile(Long fileId);
}
