# 📂 FileFlow  

**FileFlow** is a collaborative file management web application, similar to Google Drive.  
It allows users to securely **store, organize, and share files**, with advanced features like **user authentication, email notifications**.  
The project is built with **Spring Boot (backend)** and **Next.js (frontend)**, following a modern and scalable architecture.  

---

## ✨ Features  

- 🔐 **Secure Authentication & Authorization** (JWT & Refresh Tokens)  
- 📁 **File & Folder Management** (upload, download, organize)  
- 🤝 **File Sharing** (controlled access & permissions)  
- 📧 **Email Notifications** (via Gmail API)  
- 📊 **Dashboard** with file statistics    

---

## 🛠️ Tech Stack  

**Backend:**  
- Java 17+, Spring Boot  
- Spring Security (JWT)  
- JPA/Hibernate  
- PostgreSQL

**Frontend:**  
- Next.js (React)  
- Zustand for state management  
- TailwindCSS & Framer Motion  

**Tools**   
- Postman for API testing  

---

## ⚙️ Prerequisites  

- Java 17 or higher  
- Maven 3 or higher  
- PostgreSQL server (local or via Docker)  
- Google Cloud account for Gmail API  
- Node.js & npm  
- Postman or any REST client  

---

## 🚀 Installation & Configuration  

# Setup PostgreSQL database
psql -U postgres -f setup-database.sql

Update `src/main/resources/application.yml`:  

```properties
datasource:
    url: jdbc:postgresql://localhost:5432/fileflow
    username: fileflow_user
    password: fileflow_password
    driver-class-name: org.postgresql.Driver
```

---

### 2️⃣ JWT & Email Configuration  

Edit `application.yml`:  

```yaml
jwt:
  secret: mySecretKey123456789012345678901234567890
```

---

### 3️⃣ Gmail API Setup  

1. Go to **Google Cloud Console**  
2. Create/select a project  
3. Enable **Gmail API** 
4. Configure the OAuth Consent Screen
5. Create **OAuth 2.0 credentials** (Web Application)  
   - Add redirect URI: `http://localhost:8080/Callback`  
6. Download `credentials.json`  
7. Place it under: `src/main/resources/credentials`  
8. On first email send, an authorization link will be displayed  
9. Authorize → tokens are saved for future use  
don't forget to set the test email in tests users (Audience).
and also in the “Access to data” section, add gmail.send and gmail.compose

---

## ▶️ Run the Project  

### Backend  

```bash
mvn clean install
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Djava.awt.headless=false"
```

➡ Runs on: `http://localhost:8080`  

### Frontend  

```bash
npm install
npm run dev
```

➡ Runs on: `http://localhost:3000`  

--- 
# FileFlow API Documentation

Base URL: `/api`

All endpoints require authentication unless specified.

---

## **1. User APIs**

### Get Current User
- **GET** `/user/me`  
- **POST** `/user/me/user`  
- **Description:** Retrieve the currently logged-in user.

### Update Profile
- **PATCH** `/user/update`  
- **Body:** `UserUpdateRequest` (JSON)  
- **Description:** Update user's profile information.

### Get Storage Info
- **GET** `/user/storage`  
- **Description:** Get current user's storage usage.

### Delete Account
- **DELETE** `/user/me/delete`  
- **Description:** Delete the current user's account.

---

## **2. File Management APIs**

### Upload File
- **POST** `/files/upload`  
- **Params:** `file` (MultipartFile), optional `folderId`  
- **Description:** Upload a file to a folder.

### Get User Files
- **GET** `/files`  
- **Params:** optional `page`, `size`, `search`  
- **Description:** Retrieve user's files with optional pagination or search.

### File Details
- **GET** `/files/{id}`  
- **Description:** Get metadata and details of a file.

### Download File
- **GET** `/files/{id}/download`  
- **Description:** Download a file by ID.

### Rename File
- **PUT** `/files/{id}/rename`  
- **Body:** `{ "fileName": "newName" }`  
- **Description:** Rename a file.

### Delete File
- **DELETE** `/files/{id}`  
- **Description:** Delete a file.

### File Statistics
- **GET** `/files/statistics`  
- **Description:** Retrieve detailed file statistics.

### Files by Folder
- **GET** `/files/folder/{folderId}`  
- **Description:** Get files inside a folder.

### Bulk File Operations
- **PUT** `/files/bulk/move`  
- **POST** `/files/bulk/copy`  
- **Body:** `{ "fileIds": [], "destinationFolderId": X }`  
- **Description:** Move or copy multiple files at once.

---

## **3. Favourites APIs**

### Get Favourite Files
- **GET** `/favourites`  
- **Description:** Retrieve all favourite files for the user.

### Toggle Favourite File
- **POST** `/favourites/{id}`  
- **Description:** Add or remove a file from favourites.

---

## **4. File Sharing APIs**

### Share File
- **POST** `/file/share/{fileId}?userEmail=example@example.com`  
- **Description:** Share a file with another user.

### Share Requests
- **GET** `/file/share/requests?userId={userId}`  
- **Description:** Get pending share requests.

### Respond to Share
- **POST** `/file/share/response/{shareFileId}?response=true/false`  
- **Description:** Accept or reject a file share request.

### Shared Files
- **GET** `/file/shared?userId={userId}`  
- **GET** `/file/shared/by-me?userId={userId}`  
- **Description:** Retrieve files shared with the user or shared by the user.

### Unshare File
- **DELETE** `/file/{fileId}/share?userEmail=example@example.com`  
- **Description:** Remove a shared file from a user.

### Users Sharing a File
- **GET** `/file/shared/{fileId}/with`  
- **Description:** List emails of users sharing a specific file.

---

## **5. Folder Management APIs**

### Create Folder
- **POST** `/folders`  
- **Body:** `{ "name": "FolderName", "description": "...", "color": "...", "parentId": X }`  
- **Description:** Create a new folder.

### Get Folders
- **GET** `/folders`  
- **Description:** Get root folders.

### Folder Details
- **GET** `/folders/{id}`  
- **Description:** Get folder details.

### Subfolders
- **GET** `/folders/{id}/subfolders`  
- **Description:** Retrieve subfolders.

### Update Folder
- **PUT** `/folders/{id}`  
- **Body:** `{ "name": "...", "description": "...", "color": "..." }`  
- **Description:** Update folder info.

### Delete Folder
- **DELETE** `/folders/{id}`  
- **Description:** Delete folder.

### Favourite Folder
- **POST** `/folders/{id}/favorite`  
- **Description:** Toggle favourite status.

### Search Folders
- **GET** `/folders/search?query=keyword`  
- **Description:** Search folders by name.

### Move / Copy Folder
- **PUT** `/folders/{id}/move`  
- **POST** `/folders/{id}/copy`  
- **Body:** `{ "newParentId": X, "newName": "..." }`  
- **Description:** Move or copy folder and contents.

### Bulk Folder Operations
- **POST** `/folders/bulk/move`  
- **POST** `/folders/bulk/copy`  
- **DELETE** `/folders/bulk/delete`  
- **Body:** `{ "folderIds": [], "newParentId": X }`  
- **Description:** Perform bulk move, copy, or delete operations.

---

## **6. Folder Sharing APIs**

### Share Folder
- **POST** `/folders/{id}/share`  
- **Body:** `FolderShareRequest`  
- **Description:** Share folder with another user.

### Folder Shares
- **GET** `/folders/{id}/shares`  
- **Description:** Get all shares of a folder.

### Respond to Share
- **POST** `/folders/shares/{shareId}/respond`  
- **Body:** `{ "accept": true/false }`  
- **Description:** Accept or reject folder share.

### Revoke Share
- **DELETE** `/folders/shares/{shareId}`  
- **Description:** Revoke a folder share.

### Shared Folders
- **GET** `/folders/shared/with-me`  
- **GET** `/folders/shared/by-me`  
- **Description:** List folders shared with/by the user.

### Pending Share Requests
- **GET** `/folders/share-requests`  
- **Description:** Get pending folder share requests.

### Remove User from Folder Share
- **DELETE** `/folders/{id}/shares/user?userEmail=example@example.com`  
- **Description:** Remove a specific user from a shared folder.

### Share Notifications
- **GET** `/folders/share-notifications`  
- **Description:** Get formatted pending folder share notifications for the user.

---

## **7. Notification APIs**

### Test Message
- **POST** `/test`  
- **Description:** Send a test message to `/topic/public` (WebSocket).



