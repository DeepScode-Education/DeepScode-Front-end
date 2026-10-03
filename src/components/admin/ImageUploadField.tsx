import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { deleteImageUrl, replaceImage, uploadImage } from '@/lib/storage';

type ImageUploadFieldProps = {
    label?: string;
    description?: string;
    imageUrl?: string | null;
    folder: string;
    disabled?: boolean;
    onChange: (imageUrl: string | null) => void;
};

export function ImageUploadField({
    label = 'Image',
    description,
    imageUrl: initialImageUrl,
    folder,
    disabled = false,
    onChange,
}: ImageUploadFieldProps) {
    const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
    const [status, setStatus] = useState<'idle' | 'uploading' | 'removing'>('idle');

    useEffect(() => {
        setImageUrl(initialImageUrl || '');
    }, [initialImageUrl]);

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: { 'image/*': [] },
        multiple: false,
        noClick: true,
        noKeyboard: true,
        onDrop: async (acceptedFiles) => {
            if (!acceptedFiles.length || disabled) return;
            setStatus('uploading');

            try {
                const file = acceptedFiles[0];
                const result = imageUrl
                    ? await replaceImage(imageUrl, file, folder)
                    : await uploadImage(file, folder);

                setImageUrl(result.publicUrl);
                onChange(result.publicUrl);
                toast.success('Image uploaded successfully');
            } catch (error: any) {
                toast.error(error?.message || 'Image upload failed');
            } finally {
                setStatus('idle');
            }
        },
    });

    const handleRemove = async () => {
        if (!imageUrl || disabled) return;
        setStatus('removing');

        try {
            await deleteImageUrl(imageUrl);
            setImageUrl('');
            onChange(null);
            toast.success('Image removed');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to remove image');
        } finally {
            setStatus('idle');
        }
    };

    const actionLabel = status === 'uploading' ? 'Uploading…' : status === 'removing' ? 'Removing…' : 'Drag & drop or click to upload';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <Label>{label}</Label>
                {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
            </div>
            <div
                {...getRootProps({
                    className:
                        'group relative rounded-xl border border-dashed border-border bg-background/60 p-4 text-center transition hover:border-primary hover:bg-[#0037FF]/5 cursor-pointer',
                    onClick: open,
                })}
            >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">{actionLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">Supported formats: JPG, PNG, WebP, SVG</p>
            </div>

            {imageUrl ? (
                <div className="space-y-3">
                    <img src={imageUrl} alt={label} className="h-40 w-full rounded-xl border object-cover" />
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={open} disabled={disabled || status !== 'idle'}>
                            Replace image
                        </Button>
                        <Button size="sm" variant="destructive" onClick={handleRemove} disabled={disabled || status !== 'idle'}>
                            <Trash2 size={14} className="mr-1" /> Remove image
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
