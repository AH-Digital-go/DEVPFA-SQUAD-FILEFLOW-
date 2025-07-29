package com.fileflow.utils;

import java.io.File;

public class FileUtils {
    public static void deleteFile(String path) {
        try {
            File file = new File(path);
            if (file.exists()) {
                file.delete();
            }
        } catch (Exception e) {
            System.err.println("Error deleting file: " + path + " → " + e.getMessage());
        }
    }
}
