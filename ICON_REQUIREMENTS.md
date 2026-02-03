# Windows Installer Icon Requirements

## Required Icon Sizes

Please add these **PNG files** to `public/assets/` folder:

### Essential Sizes (Required):
1. **icon-16x16.png** - 16x16 pixels (for small icons, taskbar)
2. **icon-32x32.png** - 32x32 pixels (for standard icons, desktop)
3. **icon-48x48.png** - 48x48 pixels (for medium icons, Start menu)
4. **icon-256x256.png** - 256x256 pixels (for large icons, high-DPI displays)

### Recommended Additional Sizes (Optional but better):
5. **icon-64x64.png** - 64x64 pixels (for better quality)
6. **icon-128x128.png** - 128x128 pixels (for better quality)

## File Format Requirements

- **Format**: PNG (Portable Network Graphics)
- **Bit Depth**: 32-bit RGBA (with transparency support)
- **Background**: Transparent or solid color (your choice)
- **File Naming**: Must be exactly as shown above (icon-16x16.png, etc.)

## Current Files You Have

I can see you currently have:
- ✅ favicon-16x16.png (can use for 16x16)
- ✅ favicon-32x32.png (can use for 32x32)
- ⚠️ ms-icon-70x70.png (will resize to 48x48)
- ⚠️ ms-icon-310x310.png (will resize to 256x256)

## What You Need to Add

Please add these **exact files** to `public/assets/`:

1. **icon-16x16.png** (or we can use favicon-16x16.png)
2. **icon-32x32.png** (or we can use favicon-32x32.png)
3. **icon-48x48.png** ← **NEW - Need exact 48x48 size**
4. **icon-256x256.png** ← **NEW - Need exact 256x256 size**

## After Adding Files

Once you add the files, I will:
1. Update the icon generation script to use the exact sizes
2. Rebuild the installer with the proper multi-resolution icon
3. Ensure all Windows contexts use the correct icon

## Quick Instructions

1. Create or export your icon in these exact sizes:
   - 16x16 pixels
   - 32x32 pixels  
   - 48x48 pixels
   - 256x256 pixels

2. Save them as PNG files with these exact names:
   - `icon-16x16.png`
   - `icon-32x32.png`
   - `icon-48x48.png`
   - `icon-256x256.png`

3. Place them in: `public/assets/` folder

4. Let me know when done, and I'll rebuild!

## Alternative: Single ICO File

If you prefer, you can also provide a single **icon.ico** file with all sizes embedded:
- Place it directly in `public/assets/icon.ico`
- Must contain: 16x16, 32x32, 48x48, 256x256 embedded sizes
- I'll update the script to use this instead

Let me know which approach you prefer!


