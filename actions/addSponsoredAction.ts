'use server';

import { createClient } from "@/supabase/client";

const supabase = createClient();

export const addNewSponsoredEventAction = async (formData: FormData) => {
  const name = formData.get('name');
  const status = formData.get('status');
  const image = formData.get('image');
  const details = formData.get('details');
  const links = formData.get('links');

  try {
    const { data, error } = await supabase
      .from('sponsoreds')
      .insert([
        {
          name,
          status,
          image: image ? image.toString() : null, 
          details: details ? JSON.parse(details.toString()) : [],
          links: links ? JSON.parse(links.toString()) : [], 
        },
      ]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error adding sponsored event:', error);
    throw error;
  }
};
