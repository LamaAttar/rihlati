import React, { useState } from 'react';

// ============================================================
// ضغط وتحسين الصورة قبل رفعها إلى Cloudinary
// ============================================================

const MAX_DIMENSION = 1920;
const MIN_DIMENSION = 1000;
const JPEG_QUALITY = 0.85;

const TEXT = {
  ar: {
    button: '📸 أضف صورة',
    uploading: '⏳ جاري رفع الصورة...',
    notImage: 'الملف المختار يجب أن يكون صورة',
    lowRes: (w, h) => `دقة الصورة منخفضة (${w}×${h}px). يرجى اختيار صورة أوضح.`,
    genericError: 'حدث خطأ أثناء رفع الصورة',
    readError: 'تعذر قراءة الصورة',
    processError: 'فشلت معالجة الصورة',
    loadError: 'تعذر تحميل الصورة',
  },
  en: {
    button: '📸 Add Photo',
    uploading: '⏳ Uploading photo...',
    notImage: 'The selected file must be an image',
    lowRes: (w, h) => `Image resolution is too low (${w}×${h}px). Please choose a clearer photo.`,
    genericError: 'An error occurred while uploading the photo',
    readError: 'Could not read the image',
    processError: 'Image processing failed',
    loadError: 'Could not load the image',
  },
};

function getImageDimensions(file, t) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(t.readError));
    };

    img.src = url;
  });
}

function resizeAndCompress(file, t, maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error(t.processError));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(t.loadError));
    };

    img.src = url;
  });
}

function ImageUpload({ placeKey, onUpload, lang = 'ar' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const t = TEXT[lang] || TEXT.ar;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(t.notImage);
      }

      const { width, height } = await getImageDimensions(file, t);

      if (width < MIN_DIMENSION && height < MIN_DIMENSION) {
        throw new Error(t.lowRes(width, height));
      }

      const processedBlob = await resizeAndCompress(file, t);

      const formData = new FormData();
      formData.append("file", processedBlob, "upload.jpg");
      formData.append("upload_preset", "rihlati_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dohsowqbg/image/upload",
        { method: "POST", body: formData }
      );

      const data = await res.json();
      onUpload(placeKey, data.secure_url);
    } catch (err) {
      console.error(err);
      setError(err.message || t.genericError);
    }

    setUploading(false);
  };

  return (
    <div className="upload-container">
      <label className="upload-btn">
        {t.button}
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {uploading && <p>{t.uploading}</p>}
      {error && <p style={{ color: "#B5652B" }}>{error}</p>}
    </div>
  );
}

export default ImageUpload;