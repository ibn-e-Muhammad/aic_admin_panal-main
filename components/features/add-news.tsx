import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from "@/supabase/client"; 
import { addNewNewsAction } from '@/actions/addNewsAction';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface NewsData {
  name: string;
  content: string;
  image: File | null;
  link: string;
  type: string;
}

export default function AddNewsDialog({ onSuccess }: { onSuccess: () => void }) {
  const [newsData, setNewsData] = useState<NewsData>({
    name: '',
    content: '',
    image: null,
    link: '',
    type: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewsData({ ...newsData, [name]: value });
  };

  const handleEditorChange = (value: string) => {
    setNewsData({ ...newsData, content: value });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setNewsData({ ...newsData, image: file });
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

    if (newsData.image) {
      try {
        const uniqueImageName = `${uuidv4()}_${newsData.image.name}`;
        const supabase = createClient();
        
        const { data: storageData, error: uploadError } = await supabase.storage
          .from('storage')
          .upload('news/' + uniqueImageName, newsData.image);
        
        if (uploadError) {
          throw uploadError;
        }

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/news/${uniqueImageName}`;
      } catch (error) {
        console.error('Error uploading image:', error);
        setErrorMessage('Failed to upload image. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('name', newsData.name);
      formData.append('content', newsData.content);
      formData.append('link', newsData.link);
      formData.append('type', newsData.type);
      if (imageUrl) {
        formData.append('image', imageUrl);
      }

      await addNewNewsAction(formData);
      onSuccess();

     
      setNewsData({ name: '', content: '', image: null, link: '', type: '' });
    } catch (error) {
      console.error('Error adding news:', error);
      setErrorMessage('Failed to add news. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setNewsData({ ...newsData, image: null });
  };

  return (
    <div>
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <Button className="bg-blue-500 text-white">Add News</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
          <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto">
            <AlertDialog.Title className="text-lg font-bold dark:text-white">
              Add New News
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Fill in the details for the new news.
            </AlertDialog.Description>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
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
                <option value="" disabled>Select News Type</option>
                <option value="normal">Normal</option>
                <option value="special">Special</option>
              </select>
              <ReactQuill
                value={newsData.content}
                onChange={handleEditorChange}
                placeholder="Write your news content here..."
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
              <div
                {...getRootProps()}
                style={{ marginTop: '96px' }}
                className="border-dashed border-2 border-white p-4 text-center rounded-md"
              >
                <input {...getInputProps()} name="image" />
                <p>Drag & drop an image here, or click to select one</p>
              </div>
              {newsData.image && (
                <div className="relative mt-3">
                  <img
                    src={URL.createObjectURL(newsData.image)}
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
                  <Button
                    className="bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <Button
                  type="submit"
                  className="bg-blue-500 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add News'}
                </Button>
              </div>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
