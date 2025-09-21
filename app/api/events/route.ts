// app/api/events/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/client';

const supabase = createClient();

export async function GET() {
  try {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    
    let imageUrl = '';
    
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('storage')
        .upload('images/' + image.name, arrayBuffer, {
          contentType: image.type,
        });

      if (uploadError) throw uploadError;

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/storage/images/${image.name}`;
    }

    const { data, error } = await supabase.from('events').insert([{
      name: formData.get('name'),
      venue: formData.get('venue'),
      date: formData.get('date'),
      time: formData.get('time'),
      description: formData.get('description'),
      image: imageUrl,
    }]);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...formData } = await request.json();
    
    const { data, error } = await supabase.from('events').update(formData).eq('id', id);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
