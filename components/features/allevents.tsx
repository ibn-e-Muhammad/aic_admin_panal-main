'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClient } from '@/supabase/client';
import { Button } from '@/components/ui/button';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import EditEventDialog from './edit-event';
import AddEventDialog from './add-event';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function Orders() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);
  const supabase = createClient();

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    const { error } = await supabase.from('events').delete().eq('id', eventToDelete.id);
    if (error) {
      console.error('Error deleting event:', error);
    } else {
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventToDelete.id));
    }
    setDeleteDialogOpen(false);
  };

  const handleEditClick = (event: any) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (event: any) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    await fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
    const subscription = supabase
      .channel('public:events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEvents((prevEvents) => [...prevEvents, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setEvents((prevEvents) =>
              prevEvents.map((event) =>
                event.id === payload.new.id ? payload.new : event
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setEvents((prevEvents) =>
              prevEvents.filter((event) => event.id !== payload.old.id)
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
    return <div>Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div>
        No events found.
        <div className='w-full h-[90vh] flex justify-center items-center'>
          <AddEventDialog onSuccess={fetchEvents} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AddEventDialog onSuccess={fetchEvents} />
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Venue</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Time</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow className="bg-accent" key={event.id}>
                  <TableCell>
                    <div className="font-medium">{event.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{event.venue}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="text-xs" variant="secondary">
                      {event.description}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {
                      event.date ?  event.date : "not confirmed" 
                    }

                  </TableCell>
                  <TableCell className="text-right">
                  {
                      event.time ?  event.time : "not confirmed" 
                    }
                  </TableCell>
                  {/* Edit button */}
                  <TableCell>
                    <Button
                      onClick={() => handleEditClick(event)}
                      className="bg-blue-500 text-white"
                    >
                      <AiFillEdit />
                    </Button>
                  </TableCell>
                  {/* Delete button */}
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteClick(event)}
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

      {/* Edit Event Modal */}
      {isEditModalOpen && selectedEvent && (
        <EditEventDialog
          event={selectedEvent}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-md shadow-lg">
            <AlertDialog.Title className="text-xl font-bold">Confirm Delete</AlertDialog.Title>
            <AlertDialog.Description className="mt-4">
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-4">
              <AlertDialog.Cancel asChild>
                <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={confirmDeleteEvent}>
                  Delete
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
