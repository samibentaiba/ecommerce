import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useAdminProfile() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("/api/admin/profile");
        if (response.ok) {
          const userData = await response.json();
          setName(userData.name || "");
          setEmail(userData.email || "");
          setImagePreview(userData.image || null);
        }
      } catch (error) {
        // Optionally handle error
      }
    };
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (currentPassword) formData.append("currentPassword", currentPassword);
      if (newPassword) formData.append("newPassword", newPassword);
      if (profileImage) formData.append("profileImage", profileImage);
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setError("");
        setSuccess("Profile updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setProfileImage(null);
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
          },
        });
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("An error occurred while updating your profile");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    profileImage,
    setProfileImage,
    imagePreview,
    setImagePreview,
    error,
    setError,
    success,
    setSuccess,
    loading,
    setLoading,
    fileInputRef,
    user,
    handleImageChange,
    handleSubmit,
  };
}
