import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@/supabase/client";
import { addNewSponsoredEventAction } from '@/actions/addSponsoredAction';

const supabase = createClient(); 

interface SponsoredEventData {
  name: string;
  status: string;
  image: File | null;
  details: { title: string; description: string }[];
  links: { linkName: string; url: string }[];
}

export default function AddSponsoredEventDialog({ onSuccess }: { onSuccess: () => void }) {
  const [eventData, setEventData] = useState<SponsoredEventData>({
    name: '',
    status: 'Inactive', 
    image: null,
    details: [{ title: '', description: '' }],
    links: [{ linkName: '', url: '' }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleDetailChange = (index: number, field: 'title' | 'description', value: string) => {
    const newDetails = [...eventData.details];
    newDetails[index][field] = value;
    setEventData({ ...eventData, details: newDetails });
  };

  const handleLinkChange = (index: number, field: 'linkName' | 'url', value: string) => {
    const newLinks = [...eventData.links];
    newLinks[index][field] = value;
    setEventData({ ...eventData, links: newLinks });
  };

  const addDetail = () => {
    setEventData({ ...eventData, details: [...eventData.details, { title: '', description: '' }] });
  };

  const removeDetail = (index: number) => {
    const newDetails = eventData.details.filter((_, i) => i !== index);
    setEventData({ ...eventData, details: newDetails });
  };

  const addLink = () => {
    setEventData({ ...eventData, links: [...eventData.links, { linkName: '', url: '' }] });
  };

  const removeLink = (index: number) => {
    const newLinks = eventData.links.filter((_, i) => i !== index);
    setEventData({ ...eventData, links: newLinks });
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

    let imageUrl = '';

    if (eventData.image) {
      try {
        const uniqueImageName = `${uuidv4()}_${eventData.image.name}`;
        
        const { data: storageData, error: uploadError } = await supabase.storage
          .from('storage')
          .upload('images/' + uniqueImageName, eventData.image);
        
        if (uploadError) {
          throw uploadError;
        }

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/images/${uniqueImageName}`;
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrorMessage('Failed to upload image. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('name', eventData.name);
      formData.append('status', eventData.status);
      formData.append('details', JSON.stringify(eventData.details));
      formData.append('links', JSON.stringify(eventData.links));
      if (imageUrl) {
        formData.append('image', imageUrl);
      }

      await addNewSponsoredEventAction(formData); 
      onSuccess();

     
      setEventData({
        name: '',
        status: 'Inactive',
        image: null,
        details: [{ title: '', description: '' }],
        links: [{ linkName: '', url: '' }],
      });
    } catch (error) {
      console.error('Error adding sponsored event:', error);
      setErrorMessage('Failed to add sponsored event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setEventData({ ...eventData, image: null });
  };

  return (
    <div>
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <Button className="bg-blue-500 text-white">Add Sponsored Event</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
          <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto">
            <AlertDialog.Title className="text-lg font-bold dark:text-white">
              Add New Sponsored Event
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Fill in the details for the new sponsored event.
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
              <select
                name="status"
                value={eventData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="Inactive">Inactive</option>
                <option value="Active">Active</option>
              </select>
              
             
              <div
                {...getRootProps()}
                className="border-dashed border-2 border-white p-4 text-center rounded-md"
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
                    placeholder="Detail Title"
                    value={detail.title}
                    onChange={(e) => handleDetailChange(index, 'title', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  <textarea
                    placeholder="Detail Description"
                    value={detail.description}
                    onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  {eventData.details.length > 1 && (
                    <button type="button" onClick={() => removeDetail(index)} className="text-red-500">
                      Remove Detail
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDetail} className="text-blue-500">
                Add Detail
              </button>

            
              {eventData.links.map((link, index) => (
                <div key={index} className="space-y-2">
                  <input
                    placeholder="Link Name"
                    value={link.linkName}
                    onChange={(e) => handleLinkChange(index, 'linkName', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  <input
                    placeholder="Link URL"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  {eventData.links.length > 1 && (
                    <button type="button" onClick={() => removeLink(index)} className="text-red-500">
                      Remove Link
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addLink} className="text-blue-500">
                Add Link
              </button>

              <div className="flex justify-end space-x-2">
                <AlertDialog.Cancel asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <Button type="submit" className="bg-green-500 text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Sponsored Event'}
                </Button>
              </div>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
