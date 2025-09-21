'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { updateEventAction } from '@/actions/updateAction';
import { createClient } from "@/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface Detail {
  title: string;
  description: string;
}

interface Link {
  linkName: string;
  link: string;
}

interface EventData {
  id: string;
  name: string;
  venue: string;
  date: string | null;
  time: string | null;
  description: string;
  image: string | null;
  newImage: File | null;
  details: Detail[];
  links: Link[];
}

interface EditEventDialogProps {
  event: EventData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEventDialog({ event, onClose, onSuccess }: EditEventDialogProps) {
  const [eventData, setEventData] = useState<EventData>({
    id: event.id,
    name: event.name || '',
    venue: event.venue || '',
    date: event.date || '',
    time: event.time || '',
    description: event.description || '',
    image: event.image || null,
    newImage: null,
    details: event.details || [{ title: '', description: '' }],
    links: event.links || [{ linkName: '', link: '' }]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleDetailChange = (index: number, field: keyof Detail, value: string) => {
    const updatedDetails = [...eventData.details];
    updatedDetails[index][field] = value;
    setEventData({ ...eventData, details: updatedDetails });
  };

  const handleLinkChange = (index: number, field: keyof Link, value: string) => {
    const updatedLinks = [...eventData.links];
    updatedLinks[index][field] = value;
    setEventData({ ...eventData, links: updatedLinks });
  };

  const addDetail = () => {
    setEventData({ ...eventData, details: [...eventData.details, { title: '', description: '' }] });
  };

  const addLink = () => {
    setEventData({ ...eventData, links: [...eventData.links, { linkName: '', link: '' }] });
  };

  const removeDetail = (index: number) => {
    const updatedDetails = eventData.details.filter((_, i) => i !== index);
    setEventData({ ...eventData, details: updatedDetails });
  };

  const removeLink = (index: number) => {
    const updatedLinks = eventData.links.filter((_, i) => i !== index);
    setEventData({ ...eventData, links: updatedLinks });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setEventData({ ...eventData, newImage: acceptedFiles[0] });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = createClient();
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uniqueImageName = `${uuidv4()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('storage')
        .upload(`images/${uniqueImageName}`, arrayBuffer, {
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(`Image upload error: ${uploadError.message}`);
      }

      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/images/${uniqueImageName}`;
    } catch (error: any) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = eventData.image;

      if (eventData.newImage) {
        imageUrl = await uploadImage(eventData.newImage);
      }

      await updateEventAction(event.id, {
        name: eventData.name,
        venue: eventData.venue,
        date: eventData.date || '',
        time: eventData.time || '',
        description: eventData.description,
        image: imageUrl
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const removeImage = () => {
    setEventData({ ...eventData, newImage: null, image: null });
  };

  return (
    <AlertDialog.Root open={true} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto">
          <AlertDialog.Title className="text-lg font-bold dark:text-white">Edit Event</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Fill in the details for the event.
          </AlertDialog.Description>
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
              placeholder="Venue"
              className="w-full p-2 border rounded-md"
              value={eventData.venue}
              onChange={handleChange}
              required
            />
            <input
              name="date"
              type="date"
              className="w-full p-2 border rounded-md"
              value={eventData.date ?? ''}
              onChange={handleChange}
              
            />
            <input
              name="time"
              type="time"
              className="w-full p-2 border rounded-md"
              value={eventData.time ?? ''}
              onChange={handleChange}
              
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full p-2 border rounded-md"
              value={eventData.description}
              onChange={handleChange}
              required
            />

            <div {...getRootProps()} className="border-dashed border-2 p-4 text-center rounded-md">
              <input {...getInputProps()} name="image" />
              <p>Drag & drop an image here, or click to select one</p>
            </div>

            {(eventData.newImage || eventData.image) && (
              <div className="relative mt-3">
                <img
                  src={
                    eventData.newImage
                      ? URL.createObjectURL(eventData.newImage)
                      : eventData.image ?? undefined
                  }
                  className="w-full"
                  alt="Event"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                >
                  <AiOutlineClose />
                </button>
              </div>
            )}

            <Button type="submit" className="w-full mt-4">
              Save Changes
            </Button>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
