import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for unique image names
import { createClient } from "@/supabase/client";
import { addNewBlogAction } from '@/actions/addBlogAction';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
const supabase = createClient(); 
interface BlogData {
  title: string;
  content: string;
  image: File | null;
  author: string;
  date: string;
}

export default function AddBlogDialog({ onSuccess }: { onSuccess: () => void }) {
  const [blogData, setBlogData] = useState<BlogData>({
    title: '',
    content: '',
    image: null,
    author: '',
    date: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBlogData({ ...blogData, [name]: value });
  };

  const handleEditorChange = (value: string) => {
    setBlogData({ ...blogData, content: value });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setBlogData({ ...blogData, image: file });
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

    if (blogData.image) {
      try {
        const uniqueImageName = `${uuidv4()}_${blogData.image.name}`;
        
        const { data: storageData, error: uploadError } = await supabase.storage
          .from('storage')
          .upload('images/' + uniqueImageName, blogData.image);
        
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
      formData.append('title', blogData.title);
      formData.append('content', blogData.content);
      formData.append('author', blogData.author);
      formData.append('date', blogData.date);
      if (imageUrl) {
        formData.append('image', imageUrl);
      }

      await addNewBlogAction(formData);  // Using server action
      onSuccess(); // Trigger success callback

      // Reset form after success
      setBlogData({ title: '', content: '', image: null, author: '', date: '' });
    } catch (error) {
      console.error('Error adding blog:', error);
      setErrorMessage('Failed to add blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setBlogData({ ...blogData, image: null });
  };

  return (
    <div>
      <AlertDialog.Root>
        <AlertDialog.Trigger asChild>
          <Button className="bg-blue-500 text-white">Add Blog</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
          <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto">
            <AlertDialog.Title className="text-lg font-bold dark:text-white">
              Add New Blog
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Fill in the details for the new blog.
            </AlertDialog.Description>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                name="title"
                placeholder="Blog Title"
                className="w-full p-2 border rounded-md"
                value={blogData.title}
                onChange={handleChange}
                required
              />
              <input
                name="author"
                placeholder="Author Name"
                className="w-full p-2 border rounded-md"
                value={blogData.author}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                name="date"
                placeholder="Blog Date"
                className="w-full p-2 border rounded-md"
                value={blogData.date}
                onChange={handleChange}
                required
              />
              <ReactQuill
                value={blogData.content}
                onChange={handleEditorChange}
                placeholder="Write your blog content here..."
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ color: [] }, { background: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image', 'video'],
                  ],
                }}
                style={{ height: '300px' }} // Set editor height here
              />
              <div
                {...getRootProps()}
                style={{ marginTop: '96px' }}
                className="border-dashed border-2 border-white p-4 text-center rounded-md"
              >
                <input {...getInputProps()} name="image" />
                <p>Drag & drop an image here, or click to select one</p>
              </div>
              {blogData.image && (
                <div className="relative mt-3">
                  <img
                    src={URL.createObjectURL(blogData.image)}
                    className="w-full"
                    alt="Blog"
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
                  {isSubmitting ? 'Adding...' : 'Add Blog'}
                </Button>
              </div>
            </form>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
