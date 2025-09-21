'use client';
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import EditNewsDialog from "./edit-news";  
import AddNewsDialog from "./add-news";    
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface News {
  id: number;
  name: string;
  content: string;
  link: string;
  type: string;
  image?: string;
}

interface SupabasePayload {
  new: News;
  old: News;
  eventType: "INSERT" | "UPDATE" | "DELETE";
}

export default function News() {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);  
  const supabase = createClient();

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("news").select("*");
    if (error) {
      console.error("Error fetching news:", error);
    } else {
      setNewsItems(data || []);
    }
    setLoading(false);
  };

  const deleteNews = async (id: number) => {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) {
      console.error("Error deleting news:", error);
    } else {
      setNewsItems((prevNews) => prevNews.filter((item) => item.id !== id));
    }
  };

  const handleEditClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    await fetchNews();
  };

  useEffect(() => {
    fetchNews();
    const subscription = supabase
      .channel("public:news")
      .on(
        "broadcast",
        { event: "*" },
        ({ event, payload }: { event: string; payload: SupabasePayload }) => {
          if (payload.eventType === "INSERT") {
            setNewsItems((prevNews) => [...prevNews, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setNewsItems((prevNews) =>
              prevNews.map((item) =>
                item.id === payload.new.id ? payload.new : item
              )
            );
          } else if (payload.eventType === "DELETE") {
            setNewsItems((prevNews) =>
              prevNews.filter((item) => item.id !== payload.old.id)
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
    return <div>Loading News...</div>;
  }

  if (newsItems.length === 0) {
    return (
      <div>
        No News found.
        <div className="w-full h-[90vh] flex justify-center items-center">
          <AddNewsDialog onSuccess={fetchNews} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AddNewsDialog onSuccess={fetchNews} />
      <Card>
        <CardHeader className="px-7">
          <CardTitle>News</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Content</TableHead>
                <TableHead className="hidden md:table-cell">Image</TableHead>
                <TableHead className="hidden md:table-cell">Link</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsItems.map((item) => (
                <TableRow className="bg-accent" key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.image && (
                      <img
                        src={item.image}
                        alt="News"
                        className="w-20 h-20 object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <a href={item.link} target="_blank" className="text-blue-500">
                      {item.link}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge>{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleEditClick(item)}
                      className="bg-blue-500 text-white"
                    >
                      <AiFillEdit />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setNewsToDelete(item)} 
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

      {isEditModalOpen && selectedNews && (
        <EditNewsDialog
          news={selectedNews} 
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {newsToDelete && (
        <AlertDialog.Root open={!!newsToDelete} onOpenChange={() => setNewsToDelete(null)}>
          <AlertDialog.Trigger asChild>
            <Button className="bg-transparent" >Delete News</Button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 w-[400px] p-6 bg-gray-800 rounded shadow-lg transform -translate-x-1/2 -translate-y-1/2">
              <AlertDialog.Title className="text-lg font-bold">Confirm Deletion</AlertDialog.Title>
              <AlertDialog.Description className="mt-2">
                Are you sure you want to delete the news titled &quot;{newsToDelete.name}&quot;? This action cannot be undone.
              </AlertDialog.Description>
              <div className="mt-4 flex justify-end space-x-2">
                <AlertDialog.Cancel asChild>
                  <Button className="bg-gray-500 text-white">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button
                    className="bg-red-500 text-white"
                    onClick={() => {
                      deleteNews(newsToDelete.id);
                      setNewsToDelete(null);
                    }}
                  >
                    Delete
                  </Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      )}
    </div>
  );
}
