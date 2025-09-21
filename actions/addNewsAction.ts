'use server';
import { createClient } from "@/supabase/client";

export async function addNewNewsAction(formData: FormData) {
  try {
    const supabase = createClient(); 

    const { data: newsData, error: insertError } = await supabase
      .from('news') 
      .insert([{
          name: formData.get('name'),      
          content: formData.get('content'),
          image: formData.get('image'),   
          link: formData.get('link'),      
          type: formData.get('type'),    
        },
      ]);
      
    if (insertError) {
      throw insertError; 
    }
    console.log('News added:', newsData);
  } catch (error) {
    console.error('Error adding news:', error);
  }
}
