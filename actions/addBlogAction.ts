'use server';
import { createClient } from "@/supabase/client";

export async function addNewBlogAction(formData: FormData) {
  try {
    const supabase = createClient(); 

    const { data: blogData, error: insertError } = await supabase
      .from('blogs') 
      .insert([{
          title: formData.get('title'),
          content: formData.get('content'),
          image: formData.get('image'), // Directly use the image URL
          author: formData.get('author'), 
          date: formData.get('date'),  
        },
      ]);
      
    if (insertError) {
      throw insertError; 
    }
    console.log('Blog added:', blogData);
  } catch (error) {
    console.error('Error adding blog:', error);
  }
}
