"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/supabase/client";
import { addNewEventAction } from "@/actions";

const supabase = createClient();

interface EventData {
  name: string;
  venue: string;
  date: string | null;
  time: string | null;
  description: string;
  image: File | null;
}

export default function AddEventDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [eventData, setEventData] = useState<EventData>({
    name: "",
    venue: "",
    date: "",
    time: "",
    description: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setEventData({ ...eventData, image: file });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    let imageUrl = "";

    if (eventData.image) {
      try {
        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Current session:", session); // Debug log

        const uniqueImageName = `${uuidv4()}_${eventData.image.name}`;

        const { data: storageData, error: uploadError } = await supabase.storage
          .from("storage")
          .upload("events/" + uniqueImageName, eventData.image);

        if (uploadError) {
          throw uploadError;
        }

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/events/${uniqueImageName}`;
      } catch (error) {
        console.error("Error uploading image:", error);
        setErrorMessage("Failed to upload image. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("name", eventData.name);
      formData.append("venue", eventData.venue);
      if (eventData.date) {
        formData.append("date", eventData.date);
      }
      if (eventData.time) {
        formData.append("time", eventData.time);
      }
      formData.append("description", eventData.description);
      if (imageUrl) {
        formData.append("image", imageUrl);
      }

      await addNewEventAction(formData);
      onSuccess();

      setEventData({
        name: "",
        venue: "",
        date: "",
        time: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error("Error adding event:", error);
      setErrorMessage("Failed to add event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <Button className="bg-blue-500 text-white">Add New Event</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
          <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto">
            <AlertDialog.Title className="text-lg font-bold dark:text-white">
              Add New Event
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Fill in the details for the new event.
            </AlertDialog.Description>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Event Name"
                className="w-full p-2 border rounded-md"
                value={eventData.name}
                onChange={handleChange}
                required
              />
              <input
                name="venue"
                placeholder="Event Venue"
                className="w-full p-2 border rounded-md"
                value={eventData.venue}
                onChange={handleChange}
                required
              />
              <input
                name="date"
                type="date"
                placeholder="Event Date"
                className="w-full p-2 border rounded-md"
                value={eventData.date ?? ""}
                onChange={handleChange}
              />
              <input
                name="time"
                type="time"
                placeholder="Event Time"
                className="w-full p-2 border rounded-md"
                value={eventData.time ?? ""}
                onChange={handleChange}
              />
              <textarea
                name="description"
                placeholder="Event Description"
                className="w-full p-2 border rounded-md"
                value={eventData.description}
                onChange={handleChange}
                required
              />

              <div
                {...getRootProps()}
                className="border-dashed border-2 border-gray-400 p-4 text-center rounded-md"
              >
                <input {...getInputProps()} name="image" />
                <p>Drag & drop an image here, or click to select one</p>
              </div>
              {eventData.image && (
                <div className="relative mt-3">
                  <img
                    src={URL.createObjectURL(eventData.image)}
                    className="w-full"
                    alt="Event"
                  />
                  <button
                    type="button"
                    onClick={() => setEventData({ ...eventData, image: null })}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <AlertDialog.Cancel asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <Button
                  type="submit"
                  className="bg-green-500 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Event"}
                </Button>
              </div>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
