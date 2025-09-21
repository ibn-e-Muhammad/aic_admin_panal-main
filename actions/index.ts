"use server";

import { createClient } from "@/supabase/client";

const supabase = createClient();

export const addNewEventAction = async (formData: FormData) => {
  const name = formData.get("name");
  const venue = formData.get("venue");
  const date = formData.get("date");
  const time = formData.get("time");
  const description = formData.get("description");
  const image = formData.get("image");

  try {
    const { data, error } = await supabase.from("events").insert([
      {
        name,
        venue,
        date,
        time,
        description,
        image: image ? image.toString() : null,
      },
    ]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};

// Team Actions
export const addNewTeamAction = async (formData: FormData) => {
  const name = formData.get("name");
  const designation = formData.get("designation");
  const quote = formData.get("quote");
  const status = formData.get("status");
  const order_index = formData.get("order_index");
  const image = formData.get("image");

  try {
    const { data, error } = await supabase.from("team_members").insert([
      {
        name,
        designation,
        quote,
        status,
        order_index: order_index ? parseInt(order_index.toString()) : null,
        image: image ? image.toString() : null,
      },
    ]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error adding team member:", error);
    throw error;
  }
};

export const updateTeamAction = async (id: string, formData: FormData) => {
  const name = formData.get("name");
  const designation = formData.get("designation");
  const quote = formData.get("quote");
  const status = formData.get("status");
  const order_index = formData.get("order_index");
  const image = formData.get("image");

  try {
    const updateData: any = {
      name,
      designation,
      quote,
      status,
      order_index: order_index ? parseInt(order_index.toString()) : null,
    };

    // Only update image if a new one is provided
    if (image && image.toString() !== "") {
      updateData.image = image.toString();
    }

    const { data, error } = await supabase
      .from("team_members")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating team member:", error);
    throw error;
  }
};

export const deleteTeamAction = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error deleting team member:", error);
    throw error;
  }
};

export const getTeamMembersAction = async () => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};
