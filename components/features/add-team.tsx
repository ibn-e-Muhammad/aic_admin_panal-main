"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/supabase/client";
import { addNewTeamAction } from "@/actions";

const supabase = createClient();

interface TeamData {
  name: string;
  designation: string;
  quote: string;
  status: string;
  order_index: number | null;
  image: File | null;
}

export default function AddTeamDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [teamData, setTeamData] = useState<TeamData>({
    name: "",
    designation: "",
    quote: "",
    status: "active",
    order_index: null,
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTeamData({
      ...teamData,
      [name]: name === "order_index" ? (value ? parseInt(value) : null) : value,
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setTeamData({ ...teamData, image: file });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    let imageUrl = "";

    if (teamData.image) {
      try {
        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Current session:", session); // Debug log

        const uniqueImageName = `${uuidv4()}_${teamData.image.name}`;

        const { data: storageData, error: uploadError } = await supabase.storage
          .from("storage")
          .upload("team/" + uniqueImageName, teamData.image);

        if (uploadError) {
          throw uploadError;
        }

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/team/${uniqueImageName}`;
      } catch (error) {
        console.error("Error uploading image:", error);
        setErrorMessage("Failed to upload image. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("name", teamData.name);
      formData.append("designation", teamData.designation);
      formData.append("quote", teamData.quote);
      formData.append("status", teamData.status);
      if (teamData.order_index !== null) {
        formData.append("order_index", teamData.order_index.toString());
      }
      if (imageUrl) {
        formData.append("image", imageUrl);
      }

      await addNewTeamAction(formData);
      onSuccess();

      // Reset form
      setTeamData({
        name: "",
        designation: "",
        quote: "",
        status: "active",
        order_index: null,
        image: null,
      });
    } catch (error) {
      console.error("Error adding team member:", error);
      setErrorMessage("Failed to add team member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <Button className="bg-blue-500 text-white">
            Add New Team Member
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto font-sans">
            <AlertDialog.Title className="text-lg font-semibold mb-4 text-gray-900 dark:text-white font-sans">
              Add New Team Member
            </AlertDialog.Title>

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
                  value={teamData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter team member name"
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
                  value={teamData.designation}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., CEO, Developer, Designer"
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
                  value={teamData.quote}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter a motivational quote or personal motto"
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
                  value={teamData.status}
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
                  value={teamData.order_index || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Order for displaying (optional)"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Profile Image
                </label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-600"
                >
                  <input {...getInputProps()} />
                  {teamData.image ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Selected: {teamData.image.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Drag & drop an image here, or click to select
                    </p>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900 p-2 rounded-md">
                  {errorMessage}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4">
                <AlertDialog.Cancel asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? "Adding..." : "Add Team Member"}
                </Button>
              </div>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
