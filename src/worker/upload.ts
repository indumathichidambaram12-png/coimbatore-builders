import { Hono } from "hono";

const upload = new Hono<{ Bindings: Env }>();

// Simple file upload handler for worker photos
upload.post("/api/upload/photo", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'Only image files are allowed' }, 400);
    }

    // Convert file to base64 for simple storage
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:${file.type};base64,${base64}`;

    return c.json({ 
      success: true, 
      photo_url: dataUrl,
      message: 'Photo uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

export default upload;
