'use client';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { updateNewsAction } from '@/actions/updateNewsAction';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export interface EditNewsDialogProps {
  news: any;   
  onClose: () => void;   
  onSuccess: () => void; 
}

export default function EditNewsDialog({ news, onClose, onSuccess }: EditNewsDialogProps) {
  const defaultNews = news || { name: '', content: '', image: null, link: '', type: '' };

  const [newsData, setNewsData] = useState({
    name: defaultNews.name,
    content: defaultNews.content,
    image: defaultNews.image,
    newImage: null as File | null,
    link: defaultNews.link, 
    type: defaultNews.type || 'normal', 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewsData({ ...newsData, [name]: value });
  };

  const handleContentChange = (value: string) => {
    setNewsData({ ...newsData, content: value });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setNewsData({ ...newsData, newImage: acceptedFiles[0] });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newsData.name);
    formData.append('content', newsData.content);
    formData.append('link', newsData.link);
    formData.append('type', newsData.type);

    if (newsData.image) {
      formData.append('existingImage', newsData.image);
    }
    if (newsData.newImage) {
      formData.append('image', newsData.newImage);
    }

    try {
      await updateNewsAction(news.id, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  const removeImage = () => {
    setNewsData({ ...newsData, newImage: null, image: null });
  };

  return (
    <AlertDialog.Root open={true} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto">
          <AlertDialog.Title className="text-lg font-bold dark:text-white">
            Edit News
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Update the details for the news.
          </AlertDialog.Description>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="News Title"
              className="w-full p-2 border rounded-md"
              value={newsData.name}
              onChange={handleChange}
              required
            />
            <input
              name="link"
              placeholder="News Link"
              className="w-full p-2 border rounded-md"
              value={newsData.link}
              onChange={handleChange}
              required
            />
            <select
              name="type"
              className="w-full p-2 border rounded-md"
              value={newsData.type}
              onChange={handleChange}
              required
            >
              <option value="normal">Normal</option>
              <option value="special">Special</option>
            </select>
            <div className="w-full">
              <ReactQuill
                theme="snow"
                value={newsData.content}
                onChange={handleContentChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ color: [] }, { background: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image', 'video'],
                  ],
                }}
                style={{ height: '300px' }}
              />
            </div>
            <div
              {...getRootProps()}
              className="border-dashed border-2 p-4 text-center rounded-md"
              style={{ marginTop: '96px' }}
            >
              <input {...getInputProps()} name="image" />
              <p>Drag & drop an image here, or click to select one</p>
            </div>
            {(newsData.newImage || newsData.image) && (
              <div className="relative mt-3">
                <img
                  src={
                    newsData.newImage
                      ? URL.createObjectURL(newsData.newImage)
                      : newsData.image
                  }
                  className="w-full"
                  alt="News"
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
            <div className="mt-4 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button className="bg-gray-200 dark:bg-gray-700 dark:text-gray-300" onClick={onClose}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <Button type="submit" className="bg-blue-500 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
