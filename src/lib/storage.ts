import { supabase } from '@/integrations/client';

export const CMS_IMAGE_BUCKET = 'cms-images';

const normalizeFolder = (folder: string) => folder.replace(/^\/+|\/+$/g, '');

const buildFilePath = (folder: string, ext: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    return `${folder}/${timestamp}-${random}.${ext}`;
};

export type StorageUploadResult = {
    publicUrl: string;
    path: string;
};

export const extractStoragePathFromUrl = (publicUrl: string): string | null => {
    try {
        const url = new URL(publicUrl);
        const segments = url.pathname.split('/');
        const publicIndex = segments.findIndex((segment) => segment === 'public');
        if (publicIndex < 0 || publicIndex + 1 >= segments.length) return null;
        return segments.slice(publicIndex + 1).join('/');
    } catch {
        return null;
    }
};

export const getPublicUrl = async (path: string, bucket: string = CMS_IMAGE_BUCKET): Promise<string> => {
    const { data, error } = supabase.storage.from(bucket).getPublicUrl(path);
    if (error || !data?.publicUrl) {
        throw new Error(error?.message || `Unable to generate public URL for ${path}`);
    }
    return data.publicUrl;
};

export const uploadImage = async (
    file: File,
    folder: string,
    bucket: string = CMS_IMAGE_BUCKET
): Promise<StorageUploadResult> => {
    const cleanFolder = normalizeFolder(folder);
    const ext = file.name.split('.').pop() || 'bin';
    const path = buildFilePath(cleanFolder, ext);

    const uploadOptions = {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
    };

    const { data: uploadData, error } = await supabase.storage.from(bucket).upload(path, file, uploadOptions);
    if (error) {
        console.error('Supabase upload failed', { bucket, path, uploadOptions, error, uploadData });
        throw error;
    }

    const publicUrl = await getPublicUrl(path, bucket);
    return { publicUrl, path };
};

export const deleteImagePath = async (path: string, bucket: string = CMS_IMAGE_BUCKET): Promise<void> => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
        throw error;
    }
};

export const deleteImageUrl = async (publicUrl: string, bucket: string = CMS_IMAGE_BUCKET): Promise<void> => {
    const path = extractStoragePathFromUrl(publicUrl);
    if (!path) {
        throw new Error('Unable to derive storage path from public URL.');
    }
    await deleteImagePath(path, bucket);
};

export const replaceImage = async (
    oldPublicUrl: string | null,
    file: File,
    folder: string,
    bucket: string = CMS_IMAGE_BUCKET
): Promise<StorageUploadResult> => {
    const newImage = await uploadImage(file, folder, bucket);

    if (oldPublicUrl) {
        try {
            await deleteImageUrl(oldPublicUrl);
        } catch (error) {
            console.warn('Failed to delete previous image after replacement:', error);
        }
    }

    return newImage;
};

export const createSignedUrl = async (path: string, expiresInSeconds = 60, bucket: string = CMS_IMAGE_BUCKET): Promise<string> => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
    if (error || !data?.signedUrl) {
        throw new Error(error?.message || `Unable to create signed URL for ${path}`);
    }
    return data.signedUrl;
};
