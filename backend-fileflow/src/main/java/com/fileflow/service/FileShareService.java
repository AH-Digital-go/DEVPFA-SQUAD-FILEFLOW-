package com.fileflow.service;

import com.fileflow.dto.FileDTO;
import com.fileflow.dto.ShareNotificationDTO;
import com.fileflow.entity.File;
import com.fileflow.entity.FileShare;
import com.fileflow.exception.ShareFileException;
import com.fileflow.exception.UserNotFoundException;
import com.fileflow.repository.FileRepository;
import com.fileflow.repository.FileShareRepository;
import lombok.AllArgsConstructor;
import com.fileflow.entity.User;
import com.fileflow.repository.UserRepository;




import org.springframework.stereotype.Service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class FileShareService implements IFileShareServices {
    private final FileService fileService;
    //    private final MapperDto mapperDto;
    private UserRepository userRepository;
    private FileRepository fileRepository;
    private FileShareRepository fileShareRepository;
    @Override
    public ShareNotificationDTO shareFileWithUser(Long fileId, String userEmail) throws UserNotFoundException, FileNotFoundException, IOException {
        User user = userRepository.findByEmail(userEmail).orElseThrow(()->new UserNotFoundException("this email does not exist"));
        File fileToShare = fileRepository.findById(fileId).orElseThrow(()->new FileNotFoundException("file not found"));

        FileShare fileShare = FileShare.builder()
                .file(fileToShare)
                .targetUser(user)
                .response(false)
                .build();
        fileShareRepository.save(fileShare);
        return ConvertToDTO(fileShare);
    }

    @Override
    public void unshareFile(Long fileId, String userEmail) throws UserNotFoundException, FileNotFoundException {
        User user = userRepository.findByEmail(userEmail).orElseThrow(()-> new UserNotFoundException("email does not exist"));
        File file = fileRepository.findByUserIdAndOriginalFileId(user.getId(),fileId);

        FileShare fileShare = fileShareRepository.findByFileIdAndTargetUserId(fileId, user.getId())
            .orElseThrow(() -> new RuntimeException("Share not found"));

        fileShareRepository.delete(fileShare);
        if(file!=null) {
            fileRepository.delete(file);
        }

    }

    @Override
    public FileDTO shareResponse(Long sharefileId, boolean response)throws ShareFileException {
        FileShare fileShare = fileShareRepository.findById(sharefileId).orElseThrow(()->new ShareFileException(""));
        if(response){
            fileShare.setResponse(true);
            File originaleFile = fileShare.getFile();
            File file = originaleFile.toBuilder()
                    .id(null)
                    .isShared(true)
                    .originalFile(originaleFile)
                    .FileCopies(null)
                    .fileShares(null)
                    .isFavorite(false)
                    .folder(null)
                    .user(fileShare.getTargetUser())
                    .build();
            fileShareRepository.save(fileShare);
            File fileToReturn = fileRepository.save(file);
            return fileService.convertToDTO(fileToReturn);
        }
        else{
            fileShareRepository.delete(fileShare);
        }
        return null;
    }

    public List<ShareNotificationDTO> getShareRequests(Long userId){
        List<FileShare> fileShares = fileShareRepository.findFileSharesByTargetUserId(userId);
        List<ShareNotificationDTO> shareNotifications = fileShares.stream()
                .map(this::ConvertToDTO)
                .toList();
        return shareNotifications;
    }

    @Override
    public List<FileDTO> getSharedFilesWithMe(Long userId) {
        List<File> files = fileRepository.getFileSharedWithMe();
        List<FileDTO> fileDtos=new ArrayList<>();
        for(File file:files){
            fileDtos.add(fileService.convertToDTO(file));
        }
        return fileDtos;
    }

    @Override
    public List<FileDTO> getSharedFilesByMe(Long userId) {
        List<File> files = fileShareRepository.findSharedFilesByMe(userId);
        List<FileDTO> fileDtos=new ArrayList<>();
        for(File file:files){
            fileDtos.add(fileService.convertToDTO(file));
        }
        return fileDtos;
    }

    @Override
    public List<String> getUsersEmailWhoShareMyFile(Long fileId) {
        return fileShareRepository.getSharedUsersEmailsByFileId(fileId);
    }

    public ShareNotificationDTO ConvertToDTO(FileShare fileShare){
        File file=fileShare.getFile();
        ShareNotificationDTO shareNotificationDTO= new ShareNotificationDTO();
        shareNotificationDTO.setId(fileShare.getId());
        shareNotificationDTO.setOwner(file.getUser().getFirstName()+" "+file.getUser().getLastName());
        shareNotificationDTO.setFileName(file.getOriginalFileName());
        shareNotificationDTO.setUserId(fileShare.getTargetUser().getId());
        return shareNotificationDTO;
    }
}
