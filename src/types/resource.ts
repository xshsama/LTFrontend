export interface Resource {
    id: string;
    type: 'pdf' | 'link' | 'video' | 'article' | 'course' | 'note';
    title: string;
    description: string;
    source: string;
    thumbnail?: string;
    tags: string[];
}