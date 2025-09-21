"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { updateTeamAction } from "@/actions";
import { createClient } from "@/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface TeamMemberData {
  id: string;
  name: string;
  designation: string;
  quote: string;
  status: string;
  order_index: number | null;
  image: string | null;
  newImage: File | null;
}

interface EditTeamDialogProps {
  member: TeamMemberData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTeamDialog({
  member,
  onClose,
  onSuccess,
}: EditTeamDialogProps) {
  const [memberData, setMemberData] = useState<TeamMemberData>({
    id: member.id,
    name: member.name || "",
    designation: member.designation || "",
    quote: member.quote || "",
    status: member.status || "active",
    order_index: member.order_index || null,
    image: member.image || null,
    newImage: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setMemberData({
      ...memberData,
      [name]: name === "order_index" ? (value ? parseInt(value) : null) : value,
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setMemberData({ ...memberData, newImage: acceptedFiles[0] });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = createClient();
    try {
      const uniqueImageName = `${uuidv4()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("storage")
        .upload(`team/${uniqueImageName}`, file);

      if (uploadError) {
        throw new Error(`Image upload error: ${uploadError.message}`);
      }

      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/team/${uniqueImageName}`;
    } catch (error: any) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", memberData.name);
      formData.append("designation", memberData.designation);
      formData.append("quote", memberData.quote);
      formData.append("status", memberData.status);

      if (memberData.order_index !== null) {
        formData.append("order_index", memberData.order_index.toString());
      }

      // Handle image upload if a new image is selected
      if (memberData.newImage) {
        const imageUrl = await uploadImage(memberData.newImage);
        formData.append("image", imageUrl);
      } else if (memberData.image) {
        // Keep existing image
        formData.append("image", memberData.image);
      }

      await updateTeamAction(memberData.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating team member:", error);
      setErrorMessage("Failed to update team member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog.Root open={true} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto font-sans">
          <div className="flex justify-between items-center mb-4">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900 dark:text-white font-sans">
              Edit Team Member
            </AlertDialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <AiOutlineClose size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={memberData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Designation */}
            <div>
              <label
                htmlFor="designation"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Designation *
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={memberData.designation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Quote */}
            <div>
              <label
                htmlFor="quote"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Quote
              </label>
              <textarea
                id="quote"
                name="quote"
                value={memberData.quote}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={memberData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Order Index */}
            <div>
              <label
                htmlFor="order_index"
                className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
              >
                Display Order
              </label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                value={memberData.order_index || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Current Image */}
            {memberData.image && !memberData.newImage && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Current Image
                </label>
                <img
                  src={memberData.image}
                  alt={memberData.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {memberData.image ? "Change Profile Image" : "Profile Image"}
              </label>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-400"
              >
                <input {...getInputProps()} />
                {memberData.newImage ? (
                  <p className="text-sm text-gray-600">
                    New image selected: {memberData.newImage.name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Drag & drop a new image here, or click to select
                  </p>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-500 text-sm">{errorMessage}</div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white"
              >
                {isSubmitting ? "Updating..." : "Update Team Member"}
              </Button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
