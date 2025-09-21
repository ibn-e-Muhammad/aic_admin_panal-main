'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { createClient } from '@/supabase/client';
import { Button } from '@/components/ui/button';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import AddSponsoredDialog from './add-sponsored';
import EditEventDialog from './edit-sponsored';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface SponsoredEvent {
  id: string;
  name: string;
  image: string | null;
  newImage: File | null;
  status: 'Active' | 'Inactive';
  details: { title: string; description: string }[];
  links: { linkName: string; link: string }[];
}

export default function Sponsored() {
  const [sponsored, setSponsored] = useState<SponsoredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<SponsoredEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<SponsoredEvent | null>(null);

  const supabase = createClient();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('sponsoreds').select('*');
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setSponsored(data as SponsoredEvent[]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('sponsoreds').delete().eq('id', id);
      if (error) {
        console.error('Error deleting event:', error);
      } else {
        setSponsored((prevEvents) => prevEvents.filter((event) => event.id !== id));
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
    setDeletingEvent(null); // Close the confirmation dialog
  };

  useEffect(() => {
    fetchEvents();
    const subscription = supabase
      .channel('public:sponsoreds')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sponsoreds' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSponsored((prevEvents) => [...prevEvents, payload.new as SponsoredEvent]);
          } else if (payload.eventType === 'UPDATE') {
            setSponsored((prevEvents) =>
              prevEvents.map((event) =>
                event.id === (payload.new as SponsoredEvent).id
                  ? (payload.new as SponsoredEvent)
                  : event
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setSponsored((prevEvents) =>
              prevEvents.filter((event) => event.id !== (payload.old as SponsoredEvent).id)
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase]);

  const handleEdit = (event: SponsoredEvent) => {
    setEditingEvent(event);
  };

  const handleEditSuccess = () => {
    setEditingEvent(null);
    fetchEvents();
  };

  const openDeleteDialog = (event: SponsoredEvent) => {
    setDeletingEvent(event);
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div>
      <AddSponsoredDialog onSuccess={fetchEvents} />

      {editingEvent && (
        <EditEventDialog
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingEvent && (
        <AlertDialog.Root open={!!deletingEvent} onOpenChange={() => setDeletingEvent(null)}>
          <AlertDialog.Trigger asChild>
            <div />
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/30" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 shadow-lg">
              <AlertDialog.Title className="text-lg font-medium">Confirm Deletion</AlertDialog.Title>
              <AlertDialog.Description className="text-sm mt-2">
                Are you sure you want to delete the sponsored event &quot;{deletingEvent?.name}&quot; ?
              </AlertDialog.Description>
              <div className="mt-4 flex justify-end space-x-2">
                <AlertDialog.Cancel asChild>
                  <Button variant="outline" onClick={() => setDeletingEvent(null)}>
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button variant="destructive" onClick={() => deleteEvent(deletingEvent.id)}>
                    Delete
                  </Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      )}

      <Card>
        <CardHeader className="px-7">
          <CardTitle>Sponsored</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Image</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsored.map((event) => (
                <TableRow className="bg-accent" key={event.id}>
                  <TableCell>
                    <div className="font-medium">{event.name}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <img
                      src={event.image || '/placeholder.png'}
                      className="w-16 h-16"
                      alt="Event"
                    />
                  </TableCell>
                  <TableCell className="text-right">{event.status}</TableCell>
                  <TableCell className="text-right">
                    {/* Edit button */}
                    <Button
                      onClick={() => handleEdit(event)}
                      className="bg-blue-500 text-white mr-2"
                    >
                      <AiFillEdit className="w-5 h-5" />
                    </Button>
                    {/* Delete button */}
                    <Button
                      onClick={() => openDeleteDialog(event)}
                      className="bg-red-500 text-white"
                    >
                      <AiFillDelete className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
