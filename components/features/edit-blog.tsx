'use client';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { updateBlogAction } from '@/actions/updateBlogAction'; 
import dynamic from 'next/dynamic'; 
import { createClient } from "@/supabase/client";
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { v4 as uuidv4 } from 'uuid';

interface EditBlogDialogProps {
  blog: any;   
  onClose: () => void;   
  onSuccess: () => void; 
}

export default function EditBlogDialog({ blog, onClose, onSuccess }: EditBlogDialogProps) {
  const [blogData, setBlogData] = useState({
    title: blog.title || '',
    content: blog.content || '',
    image: blog.image || null,
    newImage: null as File | null,
    date: blog.date || '', 
    author: blog.author || '', 
  });
  
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBlogData({ ...blogData, [name]: value });
  };

  const handleContentChange = (value: string) => {
    setBlogData({ ...blogData, content: value });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setBlogData({ ...blogData, newImage: acceptedFiles[0] });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const arrayBuffer = await file.arrayBuffer();
    const uniqueImageName = `${uuidv4()}_${file.name}`; // Generate a unique name for the image

    const { data, error: uploadError } = await supabase.storage
      .from('storage')
      .upload(`blogs/images/${uniqueImageName}`, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError; // Handle the error
    }

    // Construct the public URL for the uploaded image
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/blogs/images/${uniqueImageName}`;
    return imageUrl; // Return the image URL
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();       

    try {
      setUploading(true); // Set uploading state to true
      let imageUrl: string | null = null;

      if (blogData.newImage) {
        // Upload the new image and get the URL
        imageUrl = await uploadImage(blogData.newImage);
      } else {
        imageUrl = blogData.image; // Use existing image URL if no new image
      }

      await updateBlogAction(
        blog.id,
        blogData.title,
        blogData.content,
        blogData.date,
        blogData.author,
        imageUrl // Pass the image URL to updateBlogAction
      );
      
      onSuccess(); // Call the success handler after the update
    } catch (error) {
      console.error('Error updating blog:', error);
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  const removeImage = () => {
    setBlogData({ ...blogData, newImage: null });
  };

  return (
    <AlertDialog.Root open={true} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        <AlertDialog.Content className="fixed inset-0 max-w-[80%] max-h-[80%] p-6 m-auto bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-y-auto">
          <AlertDialog.Title className="text-lg font-bold dark:text-white">
            Edit Blog
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Update the details for the blog.
          </AlertDialog.Description>
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
              className="w-full p-2 border rounded-md"
              value={blogData.date}
              onChange={handleChange}
              required
            />
            <div className="w-full">
              <ReactQuill
                theme="snow"
                value={blogData.content}
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
            <div {...getRootProps()} className="border-dashed border-2 p-4 text-center rounded-md" style={{ marginTop: '16px' }}>
              <input {...getInputProps()} name="image" />
              <p>Drag & drop an image here, or click to select one</p>
            </div>
            {(blogData.newImage || blogData.image) && (
              <div className="relative mt-3">
                <img
                  src={blogData.newImage ? URL.createObjectURL(blogData.newImage) : blogData.image}
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
                <Button className="bg-gray-200 dark:bg-gray-700 dark:text-gray-300" onClick={onClose}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <Button type="submit" className={`bg-blue-500 text-white ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
