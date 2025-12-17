// File handling and compression utilities

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
}

/**
 * Validate file type and size
 */
export const validateFile = (file, allowedTypes = ALLOWED_TYPES) => {
  const errors = []

  // Check file type
  if (!allowedTypes[file.type]) {
    errors.push(`File type not allowed: ${file.type}`)
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds 5MB limit: ${(file.size / (1024 * 1024)).toFixed(2)}MB`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Get file extension
 */
export const getFileExtension = (fileName) => {
  return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Compress image using Canvas API (no external libs)
 * Returns compressed image as Blob
 */
export const compressImage = async (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Resize if image is too large
        const maxDimension = 1920
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas compression failed'))
            }
          },
          file.type || 'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Image loading failed'))
      img.src = event.target.result
    }

    reader.onerror = () => reject(new Error('File reading failed'))
    reader.readAsDataURL(file)
  })
}

/**
 * Process file for upload (compress if image, validate)
 */
export const processFileForUpload = async (file) => {
  const validation = validateFile(file)
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      file: null,
    }
  }

  try {
    let processedFile = file

    // Compress if it's an image
    if (file.type.startsWith('image/')) {
      const compressedBlob = await compressImage(file, 0.8)
      processedFile = new File(
        [compressedBlob],
        file.name,
        { type: file.type }
      )
    }

    return {
      success: true,
      errors: [],
      file: processedFile,
    }
  } catch (error) {
    return {
      success: false,
      errors: [error.message],
      file: null,
    }
  }
}
