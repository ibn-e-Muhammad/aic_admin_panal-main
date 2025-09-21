// actions/updateBlogAction.ts
import { createClient } from "@/supabase/client";

export async function updateBlogAction(blogId: string, title: string, content: string, date: string, author: string, imageUrl: string | null) {
    const supabase = createClient();

    try {
        // Update the blog entry in the 'blogs' table
        const { data: blogData, error } = await supabase
            .from('blogs')
            .update({
                title,
                content,
                image: imageUrl, // Use the new image URL or existing one
                date,
                author,
            })
            .eq('id', blogId);

        if (error) {
            throw error; // Handle the error
        }

        console.log('Blog updated:', blogData);
    } catch (error) {
        console.error('Error updating blog:', error);
        throw error; // You can throw or handle the error as you wish
    }
}
