import { useState } from 'react';

function ImageUpload({ placeKey, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'rihlati_upload');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dohsowqbg/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      onUpload(placeKey, data.secure_url);
    } catch (e) {
      console.error('خطأ برفع الصورة:', e);
    }
    setUploading(false);
  };

  return (
    <div className="upload-container">
      <label className="upload-btn">
        📸 أضف صورة
        <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
      </label>
      {uploading && <p>⏳ جاري رفع الصورة...</p>}
    </div>
  );
}

export default ImageUpload;