# Bulk Folder Operations Testing Guide

## Overview
The bulk folder operations feature has been successfully implemented with both backend APIs and frontend UI. This guide explains how to test the new functionality.

## ✅ Implemented Features

### Backend (Spring Boot)
- **Bulk Move Folders**: `POST /api/folders/bulk/move`
- **Bulk Copy Folders**: `POST /api/folders/bulk/copy`
- **Bulk Delete Folders**: `DELETE /api/folders/bulk/delete`

### Frontend (React/Next.js)
- **Multi-select functionality** with checkboxes on folder cards
- **Selection mode toggle** button in the toolbar
- **Bulk actions toolbar** that appears when folders are selected
- **Destination selection modal** for move/copy operations
- **Progress indicators** during bulk operations

## 🔧 How to Test

### 1. Start the Application
```bash
# Start backend (Spring Boot)
cd backend-fileflow
mvn spring-boot:run

# Start frontend (Next.js) - in a new terminal
cd frontend-fileflow
npm run dev
```

### 2. Access the Folder Management
1. Navigate to `http://localhost:3000`
2. Login with your account
3. Go to the **Dashboard** page
4. Look for the folder management section

### 3. Test Bulk Selection
1. **Enable Selection Mode**:
   - Click the "Sélectionner" button in the toolbar
   - Notice that folder cards now show checkboxes
   - Regular folder actions (upload, create folder) are disabled

2. **Select Multiple Folders**:
   - Click on folder checkboxes to select them
   - Selected folders will have a blue border and checked box
   - A bulk actions toolbar will appear showing the count

3. **Use Bulk Selection Controls**:
   - **Select All**: Click "Tout sélectionner" to select all visible folders
   - **Clear Selection**: Click "Tout désélectionner" to clear all selections
   - **Cancel Mode**: Click "Annuler" to exit selection mode

### 4. Test Bulk Operations

#### Bulk Delete
1. Select multiple folders
2. Click the **"Supprimer"** button in the bulk actions toolbar
3. Confirm the deletion in the dialog
4. Watch for success/error messages
5. Verify folders are removed from the UI

#### Bulk Move
1. Select multiple folders
2. Click the **"Déplacer"** button
3. Choose a destination folder from the modal (or select "Racine" for root)
4. Confirm the operation
5. Verify folders moved to the selected destination

#### Bulk Copy
1. Select multiple folders
2. Click the **"Copier"** button
3. Choose a destination folder from the modal
4. Confirm the operation
5. Verify folders are copied to the destination with "(Copie)" suffix

### 5. Test API Endpoints Directly (Optional)

#### Bulk Delete
```bash
curl -X DELETE "http://localhost:8080/api/folders/bulk/delete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"folderIds": [1, 2, 3]}'
```

#### Bulk Move
```bash
curl -X POST "http://localhost:8080/api/folders/bulk/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "folderIds": [1, 2, 3],
    "destinationFolderId": 5
  }'
```

#### Bulk Copy
```bash
curl -X POST "http://localhost:8080/api/folders/bulk/copy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "folderIds": [1, 2, 3],
    "destinationFolderId": 5
  }'
```

## 🎯 Test Scenarios

### Validation Testing
1. **Empty Selection**: Try bulk operations with no folders selected
2. **Invalid Destination**: Try moving folders to a non-existent destination
3. **Circular Reference**: Try moving a parent folder into its child
4. **Permission Check**: Test with folders belonging to different users

### UI/UX Testing
1. **Selection State**: Verify selection state persists during navigation
2. **Loading States**: Check loading indicators during operations
3. **Error Handling**: Test error messages for failed operations
4. **Responsive Design**: Test on different screen sizes

### Performance Testing
1. **Large Selection**: Test with 10+ folders selected
2. **Nested Folders**: Test operations on folders with many subfolders
3. **Concurrent Operations**: Test multiple users performing bulk operations

## 🔍 Key Components Modified

### Backend Files
- `FolderService.java` - Added bulk operation methods
- `FolderController.java` - Added bulk operation endpoints
- `BulkOperationRequest.java` - DTO for bulk operations
- `BulkDeleteResponse.java` - Response DTO for bulk delete

### Frontend Files
- `FolderManager.tsx` - Main component with bulk UI
- `fileService.ts` - Service methods for bulk operations
- Added bulk selection state management
- Added bulk actions toolbar and destination modal

## 📝 Expected Behavior

### Success Cases
- ✅ Selected folders are processed correctly
- ✅ UI updates to reflect changes
- ✅ Success messages are displayed
- ✅ Selection state is cleared after operations

### Error Cases
- ❌ Invalid folder IDs are handled gracefully
- ❌ Permission errors show appropriate messages
- ❌ Network errors are caught and displayed
- ❌ Validation errors prevent invalid operations

## 🚨 Known Limitations

1. **Destination Selection**: Currently shows only root-level folders
2. **Progress Tracking**: Basic loading states (could be enhanced with progress bars)
3. **Undo Functionality**: No undo option for bulk operations
4. **Batch Size**: No limit on number of folders per operation

## 🔄 Future Enhancements

1. **Hierarchical Destination Picker**: Allow selecting nested folders as destinations
2. **Progress Indicators**: Show detailed progress for large operations
3. **Undo/Redo**: Add undo functionality for bulk operations
4. **Keyboard Shortcuts**: Add keyboard shortcuts for bulk selection
5. **Drag & Drop**: Implement drag-and-drop for bulk operations

---

**Status**: ✅ Fully Functional - Ready for Testing
**Last Updated**: Current Session
