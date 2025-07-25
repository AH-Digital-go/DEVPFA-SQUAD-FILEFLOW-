# FileFlow Frontend-Backend Integration Guide

## 🔗 Architecture Overview

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   Next.js       │ ◄─────────────────► │   Spring Boot   │
│   Frontend      │      (Port 8088)    │   Backend       │
│   (Port 3000)   │                     │                 │
└─────────────────┘                     └─────────────────┘
        │                                        │
        ▼                                        ▼
┌─────────────────┐                     ┌─────────────────┐
│   localStorage  │                     │   PostgreSQL    │
│   (JWT Token)   │                     │   Database      │
└─────────────────┘                     └─────────────────┘
```

## 🚀 Quick Start Integration

### 1. **Backend Setup** (Port 8088)
```bash
cd backend-fileflow

# Setup PostgreSQL database
psql -U postgres -f setup-database.sql

# Start the Spring Boot backend
mvn spring-boot:run
```

### 2. **Frontend Setup** (Port 3000)
```bash
cd frontend-fileflow

# Install dependencies
npm install

# Start the Next.js frontend
npm run dev
```

### 3. **Environment Configuration**
Create `.env.local` in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8088/api
```

## 🔐 Authentication Flow

### JWT Token Management
```typescript
// Login Flow
const { token, user } = await authService.login({ email, password });
// Token automatically stored in localStorage as 'fileflow-token'
// User data stored as 'fileflow-user'

// Authenticated Requests
// All API calls automatically include: Authorization: Bearer {token}
```

### Frontend Auth Integration
```typescript
// Check authentication status
const isAuthenticated = authService.isAuthenticated();

// Get current user
const user = authService.getUser();

// Logout
authService.logout(); // Clears localStorage
```

## 📁 File Operations Integration

### Upload Files
```typescript
const handleFileUpload = async (file: File) => {
  try {
    const uploadedFile = await fileService.uploadFile(file, (progress) => {
      console.log(`Upload progress: ${progress}%`);
    });
    
    // Refresh file list after upload
    const updatedFiles = await fileService.getFiles();
    setFiles(updatedFiles);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### File List with Pagination & Search
```typescript
const loadFiles = async (page = 0, size = 20, search = '') => {
  try {
    const files = await fileService.getFiles(page, size, search);
    setFiles(files);
  } catch (error) {
    console.error('Failed to load files:', error.message);
  }
};
```

### File Actions
```typescript
// Download file
const downloadFile = async (fileId: number, fileName: string) => {
  await fileService.downloadFile(fileId, fileName);
};

// Rename file
const renameFile = async (fileId: number, newName: string) => {
  const updatedFile = await fileService.renameFile(fileId, newName);
  // Update local state
  updateFileInList(updatedFile);
};

// Toggle favorite
const toggleFavorite = async (fileId: number) => {
  const updatedFile = await fileService.toggleFavorite(fileId);
  updateFileInList(updatedFile);
};

// Delete file
const deleteFile = async (fileId: number) => {
  await fileService.deleteFile(fileId);
  // Remove from local state
  removeFileFromList(fileId);
};
```

## 📊 User Storage Integration

### Storage Information
```typescript
const loadStorageInfo = async () => {
  try {
    const storageInfo = await fileService.getUserStorageInfo();
    /*
    storageInfo = {
      fileCount: 25,
      storageUsed: 1048576, // bytes
      maxStorage: 5368709120, // 5GB
      storageUsedPercentage: 0.02,
      availableStorage: 5367660544
    }
    */
    setStorageInfo(storageInfo);
  } catch (error) {
    console.error('Failed to load storage info:', error.message);
  }
};
```

## 🎯 State Management Integration

### React State Synchronization
```typescript
// Example React component with backend integration
const FileManager = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load files on component mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const fileList = await fileService.getFiles();
      setFiles(fileList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileAction = async (action: () => Promise<void>) => {
    try {
      await action();
      await loadFiles(); // Refresh list after action
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {/* File list UI */}
    </div>
  );
};
```

## 🔒 Security Implementation

### JWT Token Handling
- **Storage**: JWT stored in `localStorage` as `fileflow-token`
- **Automatic Inclusion**: All API requests automatically include `Authorization: Bearer {token}`
- **Expiration**: Backend validates token on each request (24-hour expiration)
- **Logout**: Frontend clears localStorage, backend is stateless

### CORS Configuration
Backend is configured to accept requests from `http://localhost:3000`:
```yaml
cors:
  allowed-origins: http://localhost:3000
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

## 📡 API Endpoints Mapping

### Authentication
| Frontend Method | Backend Endpoint | Description |
|----------------|------------------|-------------|
| `authService.register()` | `POST /api/auth/register` | User registration |
| `authService.login()` | `POST /api/auth/login` | User login |
| `authService.getCurrentUser()` | `GET /api/auth/me` | Get current user info |

### File Management
| Frontend Method | Backend Endpoint | Description |
|----------------|------------------|-------------|
| `fileService.getFiles()` | `GET /api/files` | List user files |
| `fileService.uploadFile()` | `POST /api/files/upload` | Upload file |
| `fileService.getFile()` | `GET /api/files/{id}` | Get file details |
| `fileService.downloadFile()` | `GET /api/files/{id}/download` | Download file |
| `fileService.renameFile()` | `PUT /api/files/{id}/rename` | Rename file |
| `fileService.deleteFile()` | `DELETE /api/files/{id}` | Delete file |

### Favorites
| Frontend Method | Backend Endpoint | Description |
|----------------|------------------|-------------|
| `fileService.getFavorites()` | `GET /api/favourites` | Get favorite files |
| `fileService.toggleFavorite()` | `POST /api/favourites/{id}` | Toggle favorite status |

### User Profile
| Frontend Method | Backend Endpoint | Description |
|----------------|------------------|-------------|
| `fileService.getUserProfile()` | `GET /api/user/profile` | Get user profile |
| `fileService.updateUserProfile()` | `PUT /api/user/profile` | Update profile |
| `fileService.getUserStorageInfo()` | `GET /api/user/storage` | Get storage info |

## 🔄 Error Handling

### Consistent Error Format
All backend responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "timestamp": string
}
```

### Frontend Error Handling
```typescript
try {
  const result = await fileService.uploadFile(file);
  // Handle success
} catch (error) {
  // error.message contains the backend error message
  showErrorToast(error.message);
}
```

## 🧪 Testing the Integration

### 1. **Authentication Test**
```bash
# Register a new user
curl -X POST http://localhost:8088/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:8088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. **File Upload Test**
```bash
# Upload a file (replace {token} with actual JWT)
curl -X POST http://localhost:8088/api/files/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/your/file.txt"
```

### 3. **Frontend Integration Test**
1. Start both backend (8088) and frontend (3000)
2. Navigate to `http://localhost:3000`
3. Register/Login through the UI
4. Upload, view, and manage files
5. Check browser DevTools for API calls

## 🚨 Common Issues & Solutions

### 1. **CORS Errors**
- Ensure backend is running on port 8088
- Check CORS configuration in `application.yml`
- Verify frontend is making requests to correct URL

### 2. **Authentication Issues**
- Check JWT token in localStorage
- Verify token format: `Bearer {token}`
- Ensure backend JWT secret matches

### 3. **File Upload Issues**
- Check file size limits (100MB max)
- Verify storage quota not exceeded
- Ensure proper multipart/form-data headers

### 4. **Database Connection**
- Verify PostgreSQL is running
- Check database credentials in `application.yml`
- Run database setup script

## 📈 Performance Optimization

### Frontend Optimizations
- Implement file list pagination
- Add loading states for better UX
- Cache user profile data
- Debounce search queries

### Backend Optimizations
- File metadata caching
- Pagination for large file lists
- Async file processing
- Database query optimization

## 🔮 Future Enhancements

### Planned Features
- Real-time file sync with WebSockets
- File sharing between users
- Cloud storage integration (AWS S3)
- File versioning
- Advanced search filters
- Bulk file operations

This integration guide ensures seamless communication between your Next.js frontend and Spring Boot backend with proper JWT authentication, error handling, and state synchronization.
