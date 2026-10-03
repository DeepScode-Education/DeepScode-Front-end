import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, RefreshCw, Calendar } from 'lucide-react';

const BUCKET_NAME = 'course-images';
const IMAGE_FILE_NAME = 'Frame 1.jpg';

export function HeroImageManager() {
    const [heroImageUrl, setHeroImageUrl] = useState('');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch current hero image
    useEffect(() => {
        fetchHeroImage();
    }, []);

    const fetchHeroImage = async () => {
        setIsLoading(true);
        try {
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(IMAGE_FILE_NAME);

            if (data?.publicUrl) {
                setHeroImageUrl(data.publicUrl);

                // Get file metadata to show last updated time
                const { data: fileData, error } = await supabase.storage
                    .from(BUCKET_NAME)
                    .list('', { limit: 100 });

                if (!error && fileData) {
                    const file = fileData.find((f) => f.name === IMAGE_FILE_NAME);
                    if (file?.updated_at) {
                        setLastUpdated(new Date(file.updated_at).toLocaleString());
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching hero image:', error);
            toast.error('Failed to load hero image');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            // Delete old image if exists
            const { error: deleteError } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([IMAGE_FILE_NAME]);

            if (deleteError && deleteError.message !== 'not found') {
                throw deleteError;
            }

            // Upload new image with same name to replace
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(IMAGE_FILE_NAME, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Refresh the image URL
            await fetchHeroImage();
            toast.success('Hero image updated successfully!');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error?.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hero Section Image Manager</CardTitle>
                <CardDescription>
                    Update the hero image displayed on the homepage. Changes will be reflected immediately.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Image Preview */}
                <div>
                    <Label className="mb-3 block">Current Hero Image</Label>
                    <div className="relative w-full rounded-lg overflow-hidden bg-gray-100 mb-3">
                        {heroImageUrl ? (
                            <img
                                src={heroImageUrl}
                                alt="Hero"
                                className="w-full h-auto max-h-[400px] object-cover"
                            />
                        ) : (
                            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                                No image loaded
                            </div>
                        )}
                    </div>

                    {lastUpdated && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} />
                            <span>Last updated: {lastUpdated}</span>
                        </div>
                    )}
                </div>

                {/* Upload New Image */}
                <div>
                    <Label htmlFor="hero-image-input" className="mb-3 block">
                        Upload New Hero Image
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="hero-image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading || isLoading}
                            className="flex-1"
                        />
                        <Button
                            onClick={fetchHeroImage}
                            variant="outline"
                            disabled={isLoading || isUploading}
                            size="icon"
                            title="Refresh image"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Max file size: 5MB. Supported formats: JPG, PNG, WebP, GIF
                    </p>
                </div>

                {/* Image Details */}
                <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Storage Details</p>
                    <dl className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Bucket:</dt>
                            <dd className="font-mono">{BUCKET_NAME}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">File Name:</dt>
                            <dd className="font-mono">{IMAGE_FILE_NAME}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Status:</dt>
                            <dd className="font-mono text-green-600">
                                {heroImageUrl ? 'Active' : 'Not Found'}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
                    <p className="font-medium text-blue-900 mb-1">💡 How it works</p>
                    <ul className="text-blue-800 space-y-1 ml-4">
                        <li>• Upload a new image to replace the current hero image</li>
                        <li>• Changes appear on the homepage within seconds</li>
                        <li>• You can update the image daily or as often as needed</li>
                        <li>• The HeroSection component fetches the latest image automatically</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
