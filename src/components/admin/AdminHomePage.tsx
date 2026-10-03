import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon, Eye, Save, Undo2 } from "lucide-react";

interface HomePageSettings {
    id: string;
    hero_image_url: string | null;
    hero_image_alt: string | null;
    previous_image_url: string | null; // Add this
    updated_at: string;
}

const AdminHomePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [settings, setSettings] = useState<HomePageSettings | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [previousImage, setPreviousImage] = useState<string | null>(null);
    const [altText, setAltText] = useState("Student learning dashboard showing progress tracking and course analytics");

    // Fetch current settings
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("site_content")
                .select("*")
                .eq("page", "home")
                .eq("section", "hero")
                .single();

            if (error && error.code !== "PGRST116") {
                console.error("Error fetching settings:", error);
            } else if (data) {
                const content = data.content as any;
                setSettings({
                    id: data.id,
                    hero_image_url: content?.hero_image_url || null,
                    hero_image_alt: content?.hero_image_alt || null,
                    previous_image_url: content?.previous_image_url || null,
                    updated_at: data.updated_at || new Date().toISOString(),
                });
                setImagePreview(content?.hero_image_url || null);
                setPreviousImage(content?.previous_image_url || null);
                setAltText(content?.hero_image_alt || "Student learning dashboard showing progress tracking and course analytics");
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Upload image to Cloudinary
    const uploadImageToCloudinary = async (file: File): Promise<string> => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error("Cloudinary not configured");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "bloom-skills/homepage");

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        const result = await response.json();
        return result.secure_url;
    };

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setUploading(true);
        try {
            const imageUrl = await uploadImageToCloudinary(file);
            setImagePreview(imageUrl);
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    // Restore previous image
    const restorePreviousImage = () => {
        if (previousImage) {
            setImagePreview(previousImage);
            toast.info("Previous image restored. Save to apply changes.");
        } else {
            toast.error("No previous image available to restore");
        }
    };

    // Remove image
    const removeImage = () => {
        setImagePreview(null);
        toast.info("Image removed. Save to apply changes.");
    };

    // Save settings
    const saveSettings = async () => {
        setSaving(true);
        try {
            const currentImage = imagePreview;
            const previousImageSaved = settings?.hero_image_url || null;

            const content = {
                hero_image_url: currentImage,
                hero_image_alt: altText,
                previous_image_url: previousImageSaved, // Store current image as previous before updating
            };

            if (settings?.id) {
                // Update existing
                const { error } = await supabase
                    .from("site_content")
                    .update({
                        content: content,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", settings.id);

                if (error) throw error;
                toast.success("Home page image updated successfully!");
            } else {
                // Create new
                const { error } = await supabase.from("site_content").insert({
                    page: "home",
                    section: "hero",
                    type: "image",
                    content: content,
                });

                if (error) throw error;
                toast.success("Home page image saved successfully!");
            }

            await fetchSettings();
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Home Page Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage the hero image displayed on the home page
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Current Image</Label>
                            <div className="mt-2 relative group">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Hero preview"
                                            className="w-full h-48 object-cover rounded-lg border"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            {previousImage && (
                                                <button
                                                    onClick={restorePreviousImage}
                                                    className="bg-blue-500 text-white rounded-full p-1.5 hover:bg-blue-600 transition-colors"
                                                    title="Restore previous image"
                                                >
                                                    <Undo2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={removeImage}
                                                className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-muted rounded-lg border-2 border-dashed flex items-center justify-center">
                                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>Upload New Image</Label>
                            <div className="mt-2">
                                <label className="cursor-pointer">
                                    <div className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                                        <Upload className="h-4 w-4" />
                                        <span className="text-sm">Choose Image</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                                {uploading && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Uploading...
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                    Recommended size: 800x600px or larger. Max 5MB. JPG, PNG, WebP.
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="alt-text">Alt Text (Accessibility)</Label>
                            <Input
                                id="alt-text"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Describe the image for screen readers"
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Important for SEO and accessibility
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={saveSettings}
                                disabled={saving || uploading}
                                className="flex-1"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>

                            {previousImage && (
                                <Button
                                    onClick={restorePreviousImage}
                                    variant="outline"
                                    type="button"
                                >
                                    <Undo2 className="mr-2 h-4 w-4" />
                                    Restore Previous
                                </Button>
                            )}
                        </div>

                        {previousImage && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    💡 Previous image is saved. Click "Restore Previous" to revert changes before saving.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg overflow-hidden border">
                            <img
                                src={imagePreview || "https://placehold.co/800x600/1e293b/ffffff?text=Hero+Image+Preview"}
                                alt={altText}
                                className="w-full object-cover"
                                style={{ maxHeight: "300px" }}
                            />
                        </div>
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <strong>Preview Info:</strong>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {imagePreview ? "Image ready to save" : "No image selected"}
                            </p>
                            {previousImage && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    📸 Previous image available for restore
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminHomePage;