'use server';

import { createClient } from "@/supabase/client";
import { v4 as uuidv4 } from 'uuid'; 

export async function updateNewsAction(newsId: string, formData: FormData) {
    try {
        const supabase = createClient();

      
        const newImage = formData.get('image');
        let imageUrl = formData.get('existingImage') as string; 

     
        if (newImage && newImage instanceof File) {
            const arrayBuffer = await newImage.arrayBuffer();

           
            const uniqueImageName = `${uuidv4()}_${newImage.name}`;

          
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('storage') 
                .upload('news/' + uniqueImageName, arrayBuffer, {
                    contentType: newImage.type,
                });

            if (uploadError) {
                throw uploadError;
            }

           
            imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/news/${uniqueImageName}`;
        }

        
        const { data, error } = await supabase
  .from('news')
  .update({
    name: formData.get('name'),
    content: formData.get('content'),
    image: imageUrl, 
    link: formData.get('link'), 
    type: formData.get('type'), 
  })
  .eq('id', newsId);

        if (error) {
            throw error;
        }

        console.log('News updated:', data);
    } catch (error) {
        console.error('Error updating news:', error);
    }
}
