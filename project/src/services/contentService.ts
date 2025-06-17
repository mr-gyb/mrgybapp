import { supabase, GeneratedContent, ContentError } from '../lib/supabase';

export const generateContent = async (text: string): Promise<string> => {
  try {
    const response = await fetch('https://hook.us1.make.com/cgjp8jnmg4fm4s2w87t7pjdugg0j74a7', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    return data.generated_content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export const saveContent = async (
  userId: string,
  originalText: string,
  generatedContent: string,
  title: string
): Promise<GeneratedContent> => {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .insert([
        {
          user_id: userId,
          original_text: originalText,
          generated_content: generatedContent,
          title,
          status: 'draft',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

export const getContentHistory = async (userId: string): Promise<GeneratedContent[]> => {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching content history:', error);
    throw error;
  }
};

export const updateContent = async (
  contentId: string,
  updates: Partial<GeneratedContent>
): Promise<GeneratedContent> => {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .update(updates)
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('generated_content')
      .delete()
      .eq('id', contentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};