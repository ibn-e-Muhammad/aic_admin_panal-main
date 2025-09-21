'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import EditBlogDialog from "./edit-blog";
import AddBlogDialog from "./add-blogs";
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface Blog {
  id: number;
  title: string;
  content: string;
  image?: string;
}

interface SupabasePayload {
  new: Blog;
  old: Blog;
  eventType: "INSERT" | "UPDATE" | "DELETE";
}

export default function AllBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);  // For the confirmation dialog

  const supabase = createClient();

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("blogs").select("*");
    if (error) {
      console.error("Error fetching blogs:", error);
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  const deleteBlog = async (id: number) => {
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) {
      console.error("Error deleting blog:", error);
    } else {
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    }
  };

  const handleEditClick = (blog: Blog) => {
    setSelectedBlog(blog);
    setEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    await fetchBlogs();
  };

  useEffect(() => {
    fetchBlogs();

    const subscription = supabase
      .channel("public:blogs")
      .on(
        "broadcast",
        { event: "*" },
        ({ event, payload }: { event: string; payload: SupabasePayload }) => {
          if (payload.eventType === "INSERT") {
            setBlogs((prevBlogs) => [...prevBlogs, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setBlogs((prevBlogs) =>
              prevBlogs.map((blog) =>
                blog.id === payload.new.id ? payload.new : blog
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBlogs((prevBlogs) =>
              prevBlogs.filter((blog) => blog.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return <div>Loading blogs...</div>;
  }

  if (blogs.length === 0) {
    return (
      <div>
        No blogs found.
        <div className="w-full h-[90vh] flex justify-center items-center">
          <AddBlogDialog onSuccess={fetchBlogs} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AddBlogDialog onSuccess={fetchBlogs} />
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Blogs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Content</TableHead>
                <TableHead className="hidden md:table-cell">Image</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow className="bg-accent" key={blog.id}>
                  <TableCell>
                    <div className="font-medium">{blog.title}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {blog.image && (
                      <img
                        src={blog.image}
                        alt="Blog"
                        className="w-20 h-20 object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleEditClick(blog)}
                      className="bg-blue-500 text-white"
                    >
                      <AiFillEdit />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setBlogToDelete(blog)}  // Trigger confirmation dialog
                      className="bg-red-500 text-white"
                    >
                      <AiFillDelete />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && selectedBlog && (
        <EditBlogDialog
          blog={selectedBlog}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Confirmation Dialog */}
      {blogToDelete && (
        <AlertDialog.Root
          open={!!blogToDelete}
          onOpenChange={() => setBlogToDelete(null)}
        >
          <AlertDialog.Trigger asChild>
            <Button className="bg-transparent">Delete Blog</Button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="bg-black bg-opacity-30 fixed inset-0" />
            <AlertDialog.Content className="bg-gray-700 p-4 rounded shadow-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <AlertDialog.Title className="text-lg font-medium">
                Confirm Deletion
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-2">
                Are you sure you want to delete this blog? This action cannot be undone.
              </AlertDialog.Description>
              <div className="flex gap-4 mt-4">
                <Button
                  className="bg-red-500 text-white"
                  onClick={() => {
                    deleteBlog(blogToDelete!.id);
                    setBlogToDelete(null);
                  }}
                >
                  Confirm
                </Button>
                <Button
                  className="bg-gray-300"
                  onClick={() => setBlogToDelete(null)}
                >
                  Cancel
                </Button>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      )}
    </div>
  );
}
