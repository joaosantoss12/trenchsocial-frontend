import React, { useState, type ChangeEvent } from 'react';
import '../styles/postinput.css';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageURL: string;
  createdAt: string;

  followers: User[];
  following: User[];
  verified: boolean;
};

type PostInputProps = {
  onPost: (name: string, username: string, imageURL: string, text: string, timestamp: Date, images?: string[] ) => void;
  currentUser?: User | null;
};

export default function PostInput({ onPost, currentUser }: PostInputProps) {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  const name = currentUser!.name || '';
  const username = currentUser!.username || '';
  const imageURL = currentUser!.imageURL || '';


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).slice(0, 5 - images.length); // Limit to 5 images max
    const readers = files.map((file) => {
      return new Promise<string | null>((resolve) => {
        if (!file.type.startsWith('image/')) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newImages) => {
      setImages((prev) => [...prev, ...(newImages.filter(Boolean) as string[])]);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '' && images.length === 0) return;

    const timestamp = new Date();
    onPost(name, username, imageURL, text, timestamp, images);
    setText('');
    setImages([]);
  };

  return (
    <form className="post-input" onSubmit={handleSubmit}>
      <div className="textarea-wrapper">
        <textarea
          placeholder="What's on your mind, degen?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={750}
        />

        <div className="footer-inside">
          <div className="footer-left">
            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              disabled={images.length === 3}
              onChange={handleImageChange}
              multiple
              style={{ display: 'none' }}
            />
            <label htmlFor="imageUpload" className="upload-btn">
              <svg width="20" height="20" fill="#fff" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {images.length > 0 ? `Add more (${images.length}/3)` : 'Upload Image'}
            </label>
          </div>

          <div className="footer-right">
            <span className="char-counter">{text.length} / 750</span>

            <button type="submit" disabled={text.trim() === '' && images.length === 0}>
              <svg width="18" height="18" fill="#fff" stroke="currentColor" viewBox="0 0 512 512">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/>
              </svg>
              Post
            </button>
          </div>
        </div>
      </div>


      <div className="image-upload-section">
        {images.map((img, idx) => (
          <div className="image-preview" key={idx}>
            <img src={img} alt={`preview-${idx}`} />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => handleRemoveImage(idx)}
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </form>
  );
}
