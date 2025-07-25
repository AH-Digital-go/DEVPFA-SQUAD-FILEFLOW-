import React, { useState, useEffect } from 'react';
import { fileService, FileStatistics } from '../services/fileService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { BarChart3, FileText, Heart, Clock, HardDrive } from 'lucide-react';

const FileStatisticsComponent: React.FC = () => {
  const [statistics, setStatistics] = useState<FileStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await fileService.getFileStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (extension: string): string => {
    const colors: Record<string, string> = {
      'pdf': 'bg-red-100 text-red-800',
      'doc': 'bg-blue-100 text-blue-800',
      'docx': 'bg-blue-100 text-blue-800',
      'jpg': 'bg-green-100 text-green-800',
      'jpeg': 'bg-green-100 text-green-800',
      'png': 'bg-green-100 text-green-800',
      'mp4': 'bg-purple-100 text-purple-800',
      'mp3': 'bg-yellow-100 text-yellow-800',
      'zip': 'bg-gray-100 text-gray-800',
      'unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[extension.toLowerCase()] || colors['unknown'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadStatistics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fichiers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalFiles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espace Utilisé</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(statistics.totalSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoris</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.favoriteFiles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Récents (7j)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.recentFiles}</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution par type de fichier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribution par Type de Fichier
          </CardTitle>
          <CardDescription>
            Répartition de vos fichiers par extension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(statistics.fileTypeDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([extension, count]) => {
                const percentage = (count / statistics.totalFiles) * 100;
                return (
                  <div key={extension} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getFileTypeColor(extension)}>
                        {extension.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{count} fichiers</span>
                    </div>
                    <div className="flex items-center gap-2 w-32">
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-xs text-gray-500 w-10">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Distribution par taille */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution par Taille</CardTitle>
          <CardDescription>
            Répartition de vos fichiers par taille
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(statistics.fileSizeDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([sizeRange, count]) => {
                const percentage = (count / statistics.totalFiles) * 100;
                return (
                  <div key={sizeRange} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{sizeRange}</span>
                      <span className="text-sm text-gray-600">{count} fichiers</span>
                    </div>
                    <div className="flex items-center gap-2 w-32">
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-xs text-gray-500 w-10">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Plus gros fichiers */}
      <Card>
        <CardHeader>
          <CardTitle>Plus Gros Fichiers</CardTitle>
          <CardDescription>
            Top 5 de vos fichiers les plus volumineux
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statistics.largestFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.extension ? `.${file.extension}` : 'Sans extension'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {formatFileSize(file.size)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileStatisticsComponent;
