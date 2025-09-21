'use server';

import { createClient } from "@/supabase/client";

export async function updateSponsoredAction(sponsoredId: string, formData: {
    name: string;
    status: 'Active' | 'Inactive';
    image: string | null; 
    details: { title: string; description: string }[];
    links: { linkName: string; link: string }[]; 
}) {
    const supabase = createClient();

    try {
        const { name, status, image, details, links } = formData;

        if (!name || !status) {
            throw new Error("Name and status are required fields.");
        }

       
        const { data, error } = await supabase
            .from('sponsoreds')
            .update({
                name,
                status,
                image,
                details,
                links,
            })
            .eq('id', sponsoredId);

        if (error) {
            throw new Error(`Database update error: ${error.message}`);
        }

        console.log('Sponsored updated successfully:', data);
    } catch (error) {
        console.error('Error updating sponsored:', error);
        throw error; 
    }
}
