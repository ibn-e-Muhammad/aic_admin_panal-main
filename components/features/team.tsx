"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import EditTeamDialog from "./edit-team";
import AddTeamDialog from "./add-team";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { deleteTeamAction } from "@/actions";

export default function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const supabase = createClient();

  const fetchTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching team members:", error);
    } else {
      setTeamMembers(data || []);
    }
    setLoading(false);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      await deleteTeamAction(memberToDelete.id);
      setTeamMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting team member:", error);
    }

    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  const handleEditClick = (member: any) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (member: any) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    await fetchTeamMembers();
  };

  const handleAddSuccess = async () => {
    await fetchTeamMembers();
  };

  useEffect(() => {
    fetchTeamMembers();

    // Real-time subscription for team_members table
    const subscription = supabase
      .channel("public:team_members")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_members" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTeamMembers((prevMembers) => [...prevMembers, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setTeamMembers((prevMembers) =>
              prevMembers.map((member) =>
                member.id === payload.new.id ? payload.new : member
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTeamMembers((prevMembers) =>
              prevMembers.filter((member) => member.id !== payload.old.id)
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
    return <div>Loading team members...</div>;
  }

  if (teamMembers.length === 0) {
    return (
      <div>
        No team members found.
        <div className="w-full h-[90vh] flex justify-center items-center">
          <AddTeamDialog onSuccess={handleAddSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AddTeamDialog onSuccess={handleAddSuccess} />
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Designation
                </TableHead>
                <TableHead className="hidden md:table-cell">Quote</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Order</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow className="bg-accent" key={member.id}>
                  <TableCell>
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-xs">No Photo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className="text-xs" variant="outline">
                      {member.designation}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-xs truncate text-sm text-gray-600">
                      {member.quote || "No quote available"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      className="text-xs"
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.order_index || "N/A"}
                  </TableCell>
                  {/* Edit button */}
                  <TableCell>
                    <Button
                      onClick={() => handleEditClick(member)}
                      className="bg-blue-500 text-white"
                      size="sm"
                    >
                      <AiFillEdit />
                    </Button>
                  </TableCell>
                  {/* Delete button */}
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteClick(member)}
                      className="bg-red-500 text-white"
                      size="sm"
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

      {/* Edit Team Member Modal */}
      {isEditModalOpen && selectedMember && (
        <EditTeamDialog
          member={selectedMember}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-6 rounded-md shadow-lg">
            <AlertDialog.Title className="text-xl font-bold text-white">
              Confirm Delete
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-4 text-gray-300">
              Are you sure you want to delete {memberToDelete?.name}? This
              action cannot be undone.
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-4">
              <AlertDialog.Cancel asChild>
                <Button
                  variant="secondary"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={confirmDeleteMember}>
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
