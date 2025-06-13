import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onUploadComplete: (presentation: any) => void;
  userId: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, userId }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setSelectedFile(pdfFile);
      if (!title) {
        setTitle(pdfFile.name.replace('.pdf', ''));
      }
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace('.pdf', ''));
      }
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a title.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to storage
      console.log('Uploading file:', selectedFile.name);
      const { data: fileId, error: uploadError } = await window.ezsite.apis.upload({
        filename: selectedFile.name,
        file: selectedFile
      });

      if (uploadError) throw uploadError;

      setUploadProgress(100);
      clearInterval(progressInterval);

      // Create presentation record
      const presentationData = {
        user_id: userId,
        title: title.trim(),
        filename: selectedFile.name,
        file_id: fileId,
        total_pages: 0, // Will be updated after PDF processing
        description: description.trim(),
        tags: tags.trim(),
        is_active: true
      };

      console.log('Creating presentation record:', presentationData);
      const { error: createError } = await window.ezsite.apis.tableCreate('16721', presentationData);

      if (createError) throw createError;

      // Get the created presentation
      const { data: presentations, error: fetchError } = await window.ezsite.apis.tablePage('16721', {
        PageNo: 1,
        PageSize: 1,
        OrderByField: "ID",
        IsAsc: false,
        Filters: [
          { name: "user_id", op: "Equal", value: userId },
          { name: "file_id", op: "Equal", value: fileId }
        ]
      });

      if (fetchError) throw fetchError;

      const newPresentation = presentations.List[0];
      console.log('Presentation created successfully:', newPresentation);

      toast({
        title: "Upload Successful",
        description: `Presentation "${title}" uploaded successfully!`,
      });

      onUploadComplete(newPresentation);
      
      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setTags('');
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: typeof error === 'string' ? error : "Failed to upload presentation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : selectedFile
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <div className="flex items-center justify-center space-x-2">
                  <File className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={removeFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Badge variant="secondary">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your PDF here</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter presentation title"
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter presentation description"
                rows={3}
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? 'Uploading...' : 'Upload Presentation'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;