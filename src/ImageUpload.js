import React, { useState } from 'react';

// ============================================================
// ضغط وتحسين الصورة قبل رفعها إلى Cloudinary
// ============================================================

const MAX_DIMENSION = 1920;
const MIN_DIMENSION = 1000;
const JPEG_QUALITY = 0.85;

// الحصول على أبعاد الصورة
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("تعذر قراءة الصورة"));
    };

    img.src = url;
  });
}

// تصغير وضغط الصورة
function resizeAndCompress(file, maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY) {
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
            reject(new Error("فشلت معالجة الصورة"));
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
      reject(new Error("تعذر تحميل الصورة"));
    };

    img.src = url;
  });
}

function ImageUpload({ placeKey, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("الملف المختار يجب أن يكون صورة");
      }

      const { width, height } = await getImageDimensions(file);

      if (width < MIN_DIMENSION && height < MIN_DIMENSION) {
        throw new Error(
          `دقة الصورة منخفضة (${width}×${height}px). يرجى اختيار صورة أوضح.`
        );
      }

      const processedBlob = await resizeAndCompress(file);

      const formData = new FormData();
      formData.append("file", processedBlob, "upload.jpg");
      formData.append("upload_preset", "rihlati_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dohsowqbg/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      onUpload(placeKey, data.secure_url);
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء رفع الصورة");
    }

    setUploading(false);
  };

 return (
  <div className="upload-container">

    <label className="upload-btn">
      📸 أضف صورة

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ display: "none" }}
      />
    </label>

    {uploading && (
      <p>⏳ جاري رفع الصورة...</p>
    )}

    {error && (
      <p style={{ color: "#B5652B" }}>
        {error}
      </p>
    )}

  </div>
);
}

export default ImageUpload;