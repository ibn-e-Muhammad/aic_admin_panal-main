'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { updateSponsoredAction } from '@/actions/updateSponsoredAction';
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
  status: 'Active' | 'Inactive';
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
    status: event.status || 'Active',
    image: event.image || null,
    newImage: null,
    details: event.details || [{ title: '', description: '' }],
    links: event.links || [{ linkName: '', link: '' }]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      
      await updateSponsoredAction(event.id, {
        name: eventData.name,
        status: eventData.status,
        image: imageUrl,
        details: eventData.details,
        links: eventData.links,
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
          <AlertDialog.Title className="text-lg font-bold dark:text-white">Edit Sponsored Event</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Fill in the details for the edit event.
            </AlertDialog.Description>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Sponsored Name"
             className="w-full p-2 border rounded-md"
              value={eventData.name}
              onChange={handleChange}
              required
            />
            <select
              name="status"
              className="w-full p-2 border rounded-md"
              value={eventData.status}
              onChange={handleChange}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div {...getRootProps()} className="border-dashed border-2 border-white p-4 text-center rounded-md">
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
                  <AiOutlineClose className="w-5 h-5" />
                </button>
              </div>
            )}

           
            {eventData.details.map((detail, index) => (
              <div key={index} className="space-y-2">
                <input
                  value={detail.title}
                  onChange={(e) => handleDetailChange(index, 'title', e.target.value)}
                  placeholder={`Detail Title ${index + 1}`}
                  className="w-full p-2 border rounded-md"
                />
                <input
                  value={detail.description}
                  onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                  placeholder={`Detail Description ${index + 1}`}
                  className="w-full p-2 border rounded-md"
                />
                <button type="button" onClick={() => removeDetail(index)}  className="text-red-500">
                  Remove Detail
                </button>
              </div>
            ))}
            <button type="button" onClick={addDetail} className="text-blue-500">
              Add Detail
            </button>

            {/* Links section */}
            {eventData.links.map((link, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  value={link.linkName}
                  onChange={(e) => handleLinkChange(index, 'linkName', e.target.value)}
                  placeholder={`Link Name ${index + 1}`}
                  className="w-full p-2 border rounded-md"
                />
                <input
                  value={link.link}
                  onChange={(e) => handleLinkChange(index, 'link', e.target.value)}
                  placeholder={`Link URL ${index + 1}`}
                  className="w-full p-2 border rounded-md"
                />
                <button type="button" onClick={() => removeLink(index)} className="text-red-500">
                  Remove Link
                </button>
              </div>
            ))}
            <button type="button" onClick={addLink} className="text-blue-500">
              Add Link
            </button>

            <div className="flex justify-end mt-4">
              <Button type="submit" className="bg-blue-500 text-white">
                Save Changes
              </Button>
              <Button type="button" onClick={onClose} className="ml-2 bg-gray-500 text-white">
                Cancel
              </Button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
