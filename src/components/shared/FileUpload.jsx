/**
 * FileUpload Component
 * 
 * Reusable file upload component with:
 * - Drag & drop support
 * - File type validation
 * - File size validation
 * - Preview for images
 * - Delete/replace functionality
 * - Error handling
 */

import React, { useState, useRef } from 'react';

const FileUpload = ({ 
  label, 
  name, 
  required = false,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxSize = 5, // MB
  preview = false,
  onChange,
  error,
  helpText
}) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Convert MB to bytes
  const maxSizeBytes = maxSize * 1024 * 1024;

  const validateFile = (selectedFile) => {
    setUploadError('');

    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const fileMimeType = selectedFile.type;

    const isValidExtension = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      return fileMimeType.startsWith(type.replace('*', ''));
    });

    if (!isValidExtension) {
      setUploadError(`Please upload ${acceptedTypes.join(', ')} files only`);
      return false;
    }

    return true;
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      
      // Create preview for images
      if (preview && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }

      // Call parent onChange
      if (onChange) {
        onChange(selectedFile);
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      {/* Label */}
      <label className="block text-sm font-semibold text-neutral-black mb-2 font-body">
        {label}
        {required && <span className="text-accent-orange ml-1">*</span>}
      </label>

      {/* Help Text */}
      {helpText && (
        <p className="text-xs text-neutral-gray-500 mb-2">{helpText}</p>
      )}

      {/* Upload Area */}
      {!file ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${dragging 
              ? 'border-accent-orange bg-bg-tertiary scale-[1.02]' 
              : 'border-neutral-gray-600 hover:border-accent-orange hover:bg-bg-secondary'
            }
            ${error || uploadError ? 'border-red-500 bg-red-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            required={required}
          />

          {/* Upload Icon */}
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-neutral-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <div>
              <p className="text-sm font-semibold text-neutral-black">
                {dragging ? 'Drop file here' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-neutral-gray-500 mt-1">
                {accept.toUpperCase().replace(/\./g, '').replace(/,/g, ', ')} (Max {maxSize}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-neutral-gray-600 rounded-lg p-4 bg-bg-secondary">
          <div className="flex items-start gap-4">
            {/* Preview or Icon */}
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded-lg border border-neutral-gray-600"
              />
            ) : (
              <div className="w-16 h-16 bg-neutral-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-neutral-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-black truncate">
                {file.name}
              </p>
              <p className="text-xs text-neutral-gray-500 mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-neutral-gray-500 hover:text-red-600 transition-colors"
              title="Remove file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {(error || uploadError) && (
        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error || uploadError}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
