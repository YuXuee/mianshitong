import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Resume, ResumeData } from '@/types/resume';

export function useResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setResumes(data as Resume[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  return { resumes, loading, refetch: fetchResumes };
}

export function useResume(id: string | undefined) {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) setResume(data as Resume);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const updateResume = useCallback(async (updates: Partial<Resume>) => {
    if (!id) return;
    const { data, error } = await supabase
      .from('resumes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setResume(data as Resume);
    return { error };
  }, [id]);

  const updateResumeData = useCallback(async (resumeData: ResumeData) => {
    return updateResume({ resume_data: resumeData as unknown as Resume['resume_data'], status: 'ready' });
  }, [updateResume]);

  return { resume, loading, updateResume, updateResumeData, setResume };
}

export async function createResume(title: string, userId: string): Promise<Resume | null> {
  const { data, error } = await supabase
    .from('resumes')
    .insert({ title, user_id: userId, status: 'draft' })
    .select()
    .single();
  if (error) return null;
  return data as Resume;
}

export async function deleteResume(id: string) {
  const { error } = await supabase.from('resumes').delete().eq('id', id);
  return { error };
}
