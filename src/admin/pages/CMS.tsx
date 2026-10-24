'use client';

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { HeroImageManager } from '@/components/admin/HeroImageManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '../../integrations/client';
import { toast } from 'sonner';

// ---------- Types ----------
type Page = { id: string; name: string; slug: string };
type PageSection = {
  id: string;
  page_id: string;
  name: string;
  type: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  content: any;
  visible: boolean;
  sort_order: number;
};

// ---------- Hero Section Form (specific) ----------
const heroSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string(),
  image_url: z.string().url().optional(),
  image_alt: z.string().optional(),
  button1_text: z.string(),
  button1_link: z.string(),
  button2_text: z.string(),
  button2_link: z.string(),
});

type HeroFormData = z.infer<typeof heroSchema>;

function HeroForm({
  defaultValues,
  onSave,
  isSaving,
}: {
  defaultValues: HeroFormData;
  onSave: (data: HeroFormData) => void;
  isSaving: boolean;
}) {
  const { register, handleSubmit, setValue, watch } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema),
    defaultValues,
  });
  const imageUrl = watch('image_url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Upload and automatically save hero section
  const handleUploadAndSave = async () => {
    if (!selectedFile) {
      toast.warning('Please select an image first');
      return;
    }

    // Validate file type and size
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const BUCKET = 'course-images';
      const HERO_FILE = 'Frame 1.jpg';

      console.log('Uploading hero image:', selectedFile.name);

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(HERO_FILE, selectedFile, { cacheControl: '2400', upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(HERO_FILE);

      // Update the form's image_url with the new public URL
      setValue('image_url', publicUrlData.publicUrl);

      // Get current form values (including the new image URL)
      const currentValues = {
        title: watch('title'),
        subtitle: watch('subtitle'),
        image_url: publicUrlData.publicUrl,
        image_alt: watch('image_alt'),
        button1_text: watch('button1_text'),
        button1_link: watch('button1_link'),
        button2_text: watch('button2_text'),
        button2_link: watch('button2_link'),
      };

      // Save the hero section with the new image
      onSave(currentValues);

      toast.success('Hero image uploaded and section saved');
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <div>
        <Label>Title (H1)</Label>
        <Input {...register('title')} placeholder="Career Oriented Courses After" />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Textarea {...register('subtitle')} rows={3} />
      </div>

      {/* Hero Image section with always-visible Submit button */}
      <div>
        <Label>Hero Image</Label>
        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              console.log('File selected:', file?.name);
              setSelectedFile(file);
            }}
            className="!p-2 flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleUploadAndSave}
            disabled={!selectedFile || isUploading}
            className="whitespace-nowrap"
          >
            {isUploading ? 'Uploading & Saving...' : 'Submit Image'}
          </Button>
        </div>

        {imageUrl && (
          <div className="mt-3">
            <img src={imageUrl} alt="Preview" className="h-32 w-auto rounded border" />
            <p className="text-xs text-muted-foreground mt-1">Current image</p>
          </div>
        )}

        <Input
          {...register('image_url')}
          placeholder="Or paste image URL directly"
          className="mt-2"
        />
      </div>

      <div>
        <Label>Image Alt Text</Label>
        <Input {...register('image_alt')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Primary Button Text</Label>
          <Input {...register('button1_text')} />
        </div>
        <div>
          <Label>Primary Button Link</Label>
          <Input {...register('button1_link')} />
        </div>
        <div>
          <Label>Secondary Button Text</Label>
          <Input {...register('button2_text')} />
        </div>
        <div>
          <Label>Secondary Button Link</Label>
          <Input {...register('button2_link')} />
        </div>
      </div>

      <Button type="submit" disabled={isSaving}>
        <Save size={14} className="mr-2" />
        {isSaving ? 'Saving...' : 'Save Hero'}
      </Button>
    </form>
  );
}

// ---------- Generic section editor (for trust, categories, etc.) ----------
function GenericSectionForm({
  section,
  onSave,
  isSaving,
}: {
  section: PageSection;
  onSave: (updates: Partial<PageSection>) => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(section.title);
  const [subtitle, setSubtitle] = useState(section.subtitle);
  const [imageUrl, setImageUrl] = useState(section.image_url || '');
  const [content, setContent] = useState(JSON.stringify(section.content, null, 2));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const folder = `sections/${section.type}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('cms')
        .upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('cms')
        .getPublicUrl(filePath);

      setImageUrl(publicUrlData.publicUrl);
      toast.success('Image uploaded');
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    let parsedContent = section.content;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      toast.error('Invalid JSON');
      return;
    }
    onSave({ title, subtitle, image_url: imageUrl, content: parsedContent });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Section Title (H2)</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>
      <div>
        <Label>Section Image</Label>
        <div className="flex flex-col gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          {selectedFile && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedFile.name}
              </span>
            </div>
          )}
        </div>
        {imageUrl && (
          <div className="mt-2">
            <img src={imageUrl} alt="Preview" className="h-32 w-auto rounded border" />
            <p className="text-xs text-muted-foreground mt-1">Current image</p>
          </div>
        )}
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Or paste image URL directly"
          className="mt-2"
        />
      </div>
      <div>
        <Label>Content (JSON)</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="font-mono" />
      </div>
      <Button onClick={handleSubmit} disabled={isSaving}>
        <Save size={14} className="mr-2" /> Save Section
      </Button>
    </div>
  );
}

// ---------- Main CMS Page ----------
export default function CMSPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('generic');
  const [newSectionImageUrl, setNewSectionImageUrl] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('{}');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  // Fetch all pages
  const {
    data: pages = [],
    isLoading: pagesLoading,
    isError: pagesError,
    error: pagesErrorObj,
  } = useQuery<Page[]>({
    queryKey: ['cms_pages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_pages').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (pages.length === 0) return;

    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    if (pageParam) {
      const matched = pages.find((p) => p.slug === pageParam || p.name.toLowerCase() === pageParam.toLowerCase());
      if (matched) {
        setSelectedPageId(matched.id);
        return;
      }
    }

    if (!selectedPageId && pages.length > 0) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId, location.search]);

  const createPage = async () => {
    const name = newPageName.trim();
    const slug = newPageSlug.trim() || name.toLowerCase().replace(/\s+/g, '-');
    if (!name) {
      toast.error('Page name is required');
      return;
    }

    setIsCreatingPage(true);
    try {
      const { data, error } = await supabase
        .from('cms_pages')
        .insert([{ name, slug }])
        .select('*')
        .single();
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['cms_pages'] });
      setSelectedPageId(data.id);
      setIsPageDialogOpen(false);
      setNewPageName('');
      setNewPageSlug('');
      toast.success('Page created');
    } catch (err: any) {
      console.error('Create page error:', err);
      toast.error(err.message || 'Failed to create page');
    } finally {
      setIsCreatingPage(false);
    }
  };

  const createSection = async () => {
    if (!selectedPageId) {
      toast.error('Select a page first');
      return;
    }

    let content;
    try {
      content = JSON.parse(newSectionContent);
    } catch (err) {
      toast.error('Section JSON content is invalid');
      return;
    }

    const sectionName = newSectionName.trim() || 'New Section';
    const sectionTitle = newSectionTitle.trim() || sectionName;

    setIsCreatingSection(true);
    try {
      const { data: existingSections, error: existingError } = await supabase
        .from('cms_sections')
        .select('sort_order')
        .eq('page_id', selectedPageId)
        .order('sort_order', { ascending: false })
        .limit(1);
      if (existingError) throw existingError;

      const nextSortOrder = existingSections?.[0]?.sort_order != null ? existingSections[0].sort_order + 1 : 0;

      const { error } = await supabase.from('cms_sections').insert([
        {
          page_id: selectedPageId,
          name: sectionName,
          type: newSectionType,
          title: sectionTitle,
          subtitle: '',
          image_url: newSectionImageUrl || null,
          content,
          visible: true,
          sort_order: nextSortOrder,
        },
      ]);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['cms_sections', selectedPageId] });
      setIsSectionDialogOpen(false);
      setNewSectionName('');
      setNewSectionTitle('');
      setNewSectionType('generic');
      setNewSectionImageUrl('');
      setNewSectionContent('{}');
      toast.success('Section created');
    } catch (err: any) {
      console.error('Create section error:', err);
      toast.error(err.message || 'Failed to create section');
    } finally {
      setIsCreatingSection(false);
    }
  };

  // Fetch sections for selected page
  const {
    data: sections = [],
    isLoading,
  } = useQuery<PageSection[]>({
    queryKey: ['cms_sections', selectedPageId],
    queryFn: async () => {
      if (!selectedPageId) return [];
      const { data, error } = await supabase
        .from('cms_sections')
        .select('*')
        .eq('page_id', selectedPageId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPageId,
  });

  // Mutation to update a section
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PageSection> }) => {
      const { error } = await supabase.from('cms_sections').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms_sections', selectedPageId] });
      toast.success('Section updated');
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Mutation to reorder sections (drag & drop)
  const reorderMutation = useMutation({
    mutationFn: async (updatedSections: PageSection[]) => {
      const updates = updatedSections.map((s, idx) => ({
        id: s.id,
        sort_order: idx,
      }));
      for (const upd of updates) {
        await supabase.from('cms_sections').update({ sort_order: upd.sort_order }).eq('id', upd.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cms_sections', selectedPageId] }),
    onError: (err: any) => toast.error(err.message),
  });

  // Drag end handler
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over?.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      reorderMutation.mutate(newOrder);
    }
  }

  // Toggle visibility
  const toggleVisibility = (section: PageSection) => {
    updateMutation.mutate({ id: section.id, updates: { visible: !section.visible } });
  };

  // Delete section
  const deleteSection = async (id: string) => {
    if (!confirm('Delete this section permanently?')) return;
    try {
      const { error } = await supabase.from('cms_sections').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['cms_sections', selectedPageId] });
      toast.success('Section deleted');
    } catch (err: any) {
      console.error('Delete section error:', err);
      toast.error(err.message);
    }
  };

  // Publish a cms section to the public `site_content` table
  const publishSectionToSite = async (section: PageSection) => {
    try {
      const page = pages.find((p) => p.id === selectedPageId);
      if (!page) {
        toast.error('No page selected');
        return;
      }

      const content: any = {};
      if (section.type === 'hero') {
        content.title = section.title;
        content.subtitle = section.subtitle;
        content.hero_image_url = section.image_url || section.content?.hero_image_url || null;
        content.hero_image_alt = section.content?.image_alt || section.content?.hero_image_alt || null;
        content.buttons = section.content?.buttons || [
          { text: 'Explore Courses', link: '/courses' },
          { text: 'Start Your Career', link: '/login' },
        ];
      } else {
        content.title = section.title;
        content.subtitle = section.subtitle;
        content.image_url = section.image_url || section.content?.image_url || null;
        content.body = section.content || {};
        if (section.content?.buttons) {
          content.buttons = section.content.buttons;
        }
      }

      const sectionName = section.name || section.type;
      const { data: existing, error: selectErr } = await supabase
        .from('site_content')
        .select('*')
        .eq('page', page.slug)
        .eq('section', sectionName)
        .single();

      if (selectErr && selectErr.code !== 'PGRST116') {
        throw selectErr;
      }

      if (existing) {
        const { error } = await supabase
          .from('site_content')
          .update({
            content,
            type: section.type,
            order_index: section.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_content').insert({
          page: page.slug,
          section: sectionName,
          type: section.type,
          content,
          order_index: section.sort_order,
        });
        if (error) throw error;
      }

      toast.success('Section published to site');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to publish section');
    }
  };

  // When page changes, reset expanded section
  useEffect(() => {
    setExpandedSectionId(null);
  }, [selectedPageId]);

  if (pagesLoading) return <div className="p-8">Loading pages...</div>;
  if (pagesError) {
    return (
      <div className="p-8 text-destructive">
        Failed to load pages: {pagesErrorObj?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <AdminLayout
      title="Page CMS"
      subtitle="Manage content for any page: hero, sections, images, and buttons"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedPageId} onValueChange={setSelectedPageId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a page" />
            </SelectTrigger>
            <SelectContent>
              {pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setIsPageDialogOpen(true)}>
            <Plus size={14} className="mr-1" /> Add Page
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSectionDialogOpen(true)}
            disabled={!selectedPageId}
          >
            <Plus size={14} className="mr-1" /> Add Section
          </Button>
        </div>
      }
    >
      {!selectedPageId && (
        <div className="text-center py-12 text-muted-foreground space-y-4">
          <div>
            {pages.length
              ? 'Select a page from the dropdown to start editing.'
              : 'No pages yet. Create one to begin editing homepage sections.'}
          </div>
          {!pages.length && (
            <Button size="sm" onClick={() => setIsPageDialogOpen(true)}>
              <Plus size={14} className="mr-1" /> Create first page
            </Button>
          )}
        </div>
      )}

      {selectedPageId && (
        <Tabs defaultValue="sections" className="w-full">
          <TabsList>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="hero-image">Hero Image</TabsTrigger>
            <TabsTrigger value="seo">SEO (coming soon)</TabsTrigger>
          </TabsList>
          <TabsContent value="sections" className="mt-6">
            {isLoading ? (
              <div className="p-4">Loading sections...</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        isExpanded={expandedSectionId === section.id}
                        onToggleExpand={() =>
                          setExpandedSectionId(expandedSectionId === section.id ? null : section.id)
                        }
                        onToggleVisibility={() => toggleVisibility(section)}
                        onDelete={() => deleteSection(section.id)}
                        onSave={(updates) => updateMutation.mutate({ id: section.id, updates })}
                        onPublish={() => publishSectionToSite(section)}
                        isSaving={updateMutation.isPending}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </TabsContent>
          <TabsContent value="hero-image" className="mt-6">
            <HeroImageManager />
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Page Name</Label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="Homepage"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Page Slug</Label>
              <Input
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="homepage"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Will be used as the page identifier.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createPage} disabled={isCreatingPage}>
              {isCreatingPage ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Section Name</Label>
              <Input
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Why Choose Us"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Section Title</Label>
              <Input
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Why Choose deepScode Education"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Section Type</Label>
              <Input
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value)}
                placeholder="hero, trust, categories, testimonials"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Section Image URL</Label>
              <Input
                value={newSectionImageUrl}
                onChange={(e) => setNewSectionImageUrl(e.target.value)}
                placeholder="https://example.com/section-image.jpg"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Section Content (JSON)</Label>
              <Textarea
                value={newSectionContent}
                onChange={(e) => setNewSectionContent(e.target.value)}
                rows={6}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createSection} disabled={isCreatingSection || !selectedPageId}>
              {isCreatingSection ? 'Creating...' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// ---------- Sortable Section Component (with drag handle) ----------
function SortableSection({
  section,
  isExpanded,
  onToggleExpand,
  onToggleVisibility,
  onDelete,
  onSave,
  onPublish,
  isSaving,
}: {
  section: PageSection;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onSave: (updates: Partial<PageSection>) => void;
  onPublish: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 flex-1">
          <div className="cursor-grab active:cursor-grabbing" {...{ 'data-drag-handle': true }}>
            <GripVertical size={16} className="text-muted-foreground" />
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}>
            {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <div>
            <h3 className="font-semibold">{section.title || section.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 size={14} className="text-destructive" />
          </Button>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4">
          {section.type === 'hero' ? (
            <HeroForm
              defaultValues={{
                title: section.title,
                subtitle: section.subtitle,
                image_url: section.image_url || '',
                image_alt: section.content?.image_alt || '',
                button1_text: section.content?.button1_text || '',
                button1_link: section.content?.button1_link || '',
                button2_text: section.content?.button2_text || '',
                button2_link: section.content?.button2_link || '',
              }}
              onSave={(data) =>
                onSave({
                  title: data.title,
                  subtitle: data.subtitle,
                  image_url: data.image_url,
                  content: {
                    image_alt: data.image_alt,
                    button1_text: data.button1_text,
                    button1_link: data.button1_link,
                    button2_text: data.button2_text,
                    button2_link: data.button2_link,
                  },
                })
              }
              isSaving={isSaving}
            />
          ) : (
            <GenericSectionForm section={section} onSave={onSave} isSaving={isSaving} />
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onPublish(); }}>
              Publish to site
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}