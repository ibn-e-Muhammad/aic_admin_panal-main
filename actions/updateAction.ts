'use server';

import { createClient } from "@/supabase/client";

export async function updateEventAction(eventId: string, formData: {
    name: string;
    venue: string;
    date: string; 
    time: string; 
    description: string;
    image: string | null; 
    
}) {
    const supabase = createClient();

    try {
        const { name, venue, date, time, description, image } = formData;

        if (!name || !venue || !description) {
            throw new Error("All event fields are required.");
        }

      
        const updateData: any = { name, venue, description, image };

        if (date) {
            updateData.date = date;
        }

        if (time) {
            updateData.time = time;
        }

        const { data, error } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', eventId);

        if (error) {
            throw new Error(`Database update error: ${error.message}`);
        }

        console.log('Event updated successfully:', data);
    } catch (error) {
        console.error('Error updating event:', error);
        throw error; 
    }
}
