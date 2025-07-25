# FileFlow Backend API

A secure RESTful API built with Spring Boot for the FileFlow file management application.

## Features

- **Authentication & Security**: JWT-based authentication with Spring Security
- **File Management**: Upload, download, rename, delete files with metadata storage
- **User Management**: User profiles and storage quota management
- **Favorites**: Mark files as favorites for quick access
- **Storage Management**: Track storage usage and enforce quotas
- **CORS Support**: Configured for frontend integration
- **API Documentation**: Swagger UI integration

## Tech Stack

- **Framework**: Spring Boot 3.2.0
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL with Spring Data JPA
- **File Storage**: Local filesystem with metadata in database
- **Documentation**: Springdoc OpenAPI (Swagger)
- **Build Tool**: Maven

## Prerequisites

- Java 17 or higher
- PostgreSQL database
- Maven 3.6+

## Setup

1. **Database Setup**
   ```sql
   CREATE DATABASE fileflow;
   CREATE USER fileflow_user WITH PASSWORD 'fileflow_password';
   GRANT ALL PRIVILEGES ON DATABASE fileflow TO fileflow_user;
   ```

2. **Configuration**
   Update `src/main/resources/application.yml` with your database credentials if needed.

3. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```

   The API will be available at `http://localhost:8088`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### File Management
- `POST /api/files/upload` - Upload file
- `GET /api/files` - List user files (with pagination and search)
- `GET /api/files/{id}` - Get file details
- `GET /api/files/{id}/download` - Download file
- `PUT /api/files/{id}/rename` - Rename file
- `DELETE /api/files/{id}` - Delete file

### Favorites
- `GET /api/favourites` - Get favorite files
- `POST /api/favourites/{id}` - Toggle file favorite status

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/storage` - Get storage information

## API Documentation

Once the application is running, visit:
- Swagger UI: `http://localhost:8088/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8088/api-docs`

## File Storage

Files are stored in the local filesystem under `./uploads/{user_id}/` directory. Only metadata is stored in the database for efficient querying and management.

## Security

- JWT tokens for stateless authentication
- BCrypt password encoding
- User-based file access control
- CORS configured for frontend integration

## Configuration

Key configuration properties in `application.yml`:

```yaml
# Server
server.port: 8088

# Database
spring.datasource.url: jdbc:postgresql://localhost:5432/fileflow

# JWT
jwt.secret: your-secret-key
jwt.expiration: 86400000 # 24 hours

# File Upload
file.upload-dir: ./uploads
file.max-size: 104857600 # 100MB

# CORS
cors.allowed-origins: http://localhost:3000
```

## Development

### Running Tests
```bash
mvn test
```

### Building for Production
```bash
mvn clean package
java -jar target/backend-fileflow-0.0.1-SNAPSHOT.jar
```

## Frontend Integration

This backend is designed to work with the Next.js frontend. Make sure to:
1. Set the API base URL to `http://localhost:8088/api`
2. Include JWT token in Authorization header: `Bearer {token}`
3. Handle multipart/form-data for file uploads

## Storage Limits

- Default user storage limit: 5GB
- Maximum file size: 100MB
- Storage usage is tracked and enforced

## Error Handling

All API responses follow a consistent format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {...},
  "timestamp": "2024-01-01T12:00:00"
}
```
