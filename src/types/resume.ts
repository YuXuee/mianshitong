export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  jobTitle?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location?: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  items: string[];
}

export interface CertItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tech: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  certifications: CertItem[];
  projects: ProjectItem[];
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  jd_text: string | null;
  resume_data: ResumeData | null;
  status: 'draft' | 'parsing' | 'ready';
  created_at: string;
  updated_at: string;
}

export const emptyResumeData: ResumeData = {
  personal: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    jobTitle: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
};
