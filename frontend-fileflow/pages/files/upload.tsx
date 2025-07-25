'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  ArrowLeft,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

const UploadPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const router = useRouter();
  const { uploadFiles, uploadProgress, isUploading } = useUpload();
  const dropzoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dropzoneRef.current) {
      gsap.fromTo(
        dropzoneRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    
    // Animate drop zone
    if (dropzoneRef.current) {
      gsap.to(dropzoneRef.current, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleUpload = async () => {
    if (uploadedFiles.length > 0) {
      await uploadFiles(uploadedFiles);
      setUploadedFiles([]);
      router.push('/files');
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Téléverser des fichiers</h1>
          <p className="text-slate-600 mt-1">Glissez-déposez ou cliquez pour sélectionner vos fichiers</p>
        </div>
      </div>

      {/* Drop Zone */}
      <motion.div
        ref={dropzoneRef}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? isDragAccept
                ? 'border-green-400 bg-green-50'
                : 'border-red-400 bg-red-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={{ 
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0 
            }}
            className="mb-6"
          >
            <Upload className={`w-20 h-20 mx-auto ${
              isDragActive 
                ? isDragAccept 
                  ? 'text-green-500' 
                  : 'text-red-500'
                : 'text-slate-400'
            }`} />
          </motion.div>
          
          {isDragActive ? (
            <div>
              <h3 className={`text-2xl font-bold mb-2 ${
                isDragAccept ? 'text-green-600' : 'text-red-600'
              }`}>
                {isDragAccept ? 'Déposez les fichiers ici !' : 'Fichier non supporté'}
              </h3>
              <p className={`text-lg ${
                isDragAccept ? 'text-green-500' : 'text-red-500'
              }`}>
                {isDragAccept ? 'Relâchez pour téléverser' : 'Ce type de fichier n\'est pas supporté'}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                Glissez-déposez vos fichiers ici
              </h3>
              <p className="text-lg text-slate-500 mb-4">
                ou <span className="text-blue-600 font-medium">cliquez pour parcourir</span>
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
                <span>Images (JPG, PNG, GIF)</span>
                <span>•</span>
                <span>Documents (PDF, DOC, TXT)</span>
                <span>•</span>
                <span>Vidéos (MP4, AVI, MOV)</span>
                <span>•</span>
                <span>Archives (ZIP, RAR)</span>
              </div>
              <p className="text-sm text-slate-400 mt-4">
                Taille maximale: 100MB par fichier
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Selected Files */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Fichiers sélectionnés ({uploadedFiles.length})
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Téléversement...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Téléverser tout</span>
                  </>
                )}
              </motion.button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <File className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFile(index)}
                    className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {isUploading && Object.keys(uploadProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6">
              Progression du téléversement
            </h3>
            
            <div className="space-y-4">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {fileId.split('-')[0]}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-600">
                        {progress}%
                      </span>
                      {progress === 100 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadPage;