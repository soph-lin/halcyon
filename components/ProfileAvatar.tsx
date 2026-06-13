"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUser } from "lucide-react";

import { uploadProfileImage } from "@/app/actions/profile";

type ProfileAvatarProps = {
  imageUrl: string | null;
  isAdmin: boolean;
};

export function ProfileAvatar({ imageUrl, isAdmin }: ProfileAvatarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const openFilePicker = () => {
    if (!isAdmin || isUploading) {
      return;
    }

    setError(null);
    inputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("image", file);

    const result = await uploadProfileImage(formData);

    setIsUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.refresh();
  };

  return (
    <div className="profile-avatar-root">
      <button
        type="button"
        onClick={openFilePicker}
        disabled={!isAdmin || isUploading}
        className="profile-avatar-button"
        aria-label={
          imageUrl
            ? isAdmin
              ? "Change profile photo"
              : "Profile photo"
            : isAdmin
              ? "Upload profile photo"
              : "Guest profile"
        }
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URLs from admin upload
          <img src={imageUrl} alt="" className="profile-avatar-image" />
        ) : (
          <CircleUser
            className="profile-avatar-icon"
            size={52}
            strokeWidth={1.5}
            aria-hidden
          />
        )}
      </button>

      {isAdmin && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
      )}

      {error && (
        <p className="profile-avatar-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
