# Electron App Icon Fix Guide

This guide explains how the app icon is configured and how to fix icon display issues.

## Icon Configuration

The app icon is configured in multiple places to ensure it displays correctly:

### 1. BrowserWindow Configuration

All `BrowserWindow` instances use the `resolveAppIcon()` function which:
- Tries multiple icon paths (development and production)
- Returns the first valid icon path found
- Logs the icon path for debugging

### 2. Explicit Icon Setting

After each window is created, `setWindowIcon()` is called to explicitly set the icon. This is **critical for Windows** to show the correct icon in the taskbar.

### 3. Build Configuration

The `package.json` build configuration specifies icons for:
- **Windows**: `build/icon.ico` (must contain 16x16, 32x32, 48x48, 256x256 sizes)
- **macOS**: `build/icon.icns` (512x512 or 1024x1024 recommended)
- **Linux**: `public/assets/icon.png` (512x512 or 1024x1024 recommended)

### 4. Icon Embedding

The `embed-icon.js` script uses `rcedit` to embed the icon directly into the executable after building. This ensures the icon is part of the .exe file itself.

## Icon File Locations

Icons are located in:
- **Development**: `public/assets/icon.ico` or `build/icon.ico`
- **Production (unpacked)**: `resources/app.asar.unpacked/public/assets/icon.ico`
- **Production (root)**: `resources/icon.ico` or `resources/build/icon.ico`

## Troubleshooting Icon Issues

### Desktop Shortcut Icon Not Showing

If the desktop shortcut shows the Electron icon instead of your app icon:

1. **Quick Fix - Run the fix script**:
   ```batch
   scripts\fix-shortcut-icon.bat
   ```
   Or PowerShell:
   ```powershell
   scripts\fix-shortcut-icon.ps1
   ```

2. **Manual Fix**:
   - Right-click the desktop shortcut
   - Select "Properties"
   - Click "Change Icon"
   - Browse to: `C:\Program Files\DAT Loadboard\icon.ico` (or your install directory)
   - Click OK and Apply

3. **For New Installations**:
   - The installer now creates shortcuts with the correct icon
   - If you have an old shortcut, delete it and reinstall to get a new one

### Windows Icon Not Showing

1. **Clear the Windows icon cache**:
   ```batch
   scripts\clear-icon-cache.bat
   ```
   Or manually run:
   ```batch
   ie4uinit.exe -show
   ```

2. **Completely uninstall the app**:
   - Uninstall from Control Panel
   - Delete any leftover folders in `%LOCALAPPDATA%\DAT Loadboard`
   - Delete any leftover folders in `%APPDATA%\DAT Loadboard`

3. **Rebuild the app**:
   ```bash
   npm run create-icon  # Regenerate icon.ico
   npm run dist         # Build installer
   ```

4. **Reinstall the app**:
   - Install the new build
   - The icon should now appear correctly

### Icon Still Not Showing After Rebuild

1. **Check icon file exists**:
   - Verify `build/icon.ico` exists
   - Verify it contains multiple resolutions (16x16, 32x32, 48x48, 256x256)

2. **Check build configuration**:
   - Verify `package.json` has correct icon paths
   - Verify `build/icon.ico` is included in `extraFiles` or `asarUnpack`

3. **Check logs**:
   - Look for icon-related log messages in the console
   - Messages like "✅ Icon found at: ..." indicate successful icon resolution
   - Messages like "⚠️ Warning: App icon not found" indicate path issues

4. **Manually embed icon** (if needed):
   - Use Resource Hacker: http://www.angusj.com/resourcehacker/
   - Open the .exe file
   - Replace the icon in "Icon Group" > "1: 1033"
   - Save the file

### Development vs Production

- **Development**: Icon is loaded from `public/assets/icon.ico` or `build/icon.ico`
- **Production**: Icon is loaded from unpacked resources or embedded in the executable

The `resolveAppIcon()` function automatically handles both scenarios.

## Icon Requirements

### Windows (.ico)
- Must be a proper .ico file (not just a renamed .png)
- Should contain multiple resolutions: 16x16, 32x32, 48x48, 256x256
- Created using `scripts/create-windows-icon.js` which uses `sharp` and `to-ico`

### macOS (.icns)
- Must be in .icns format
- Recommended size: 512x512 or 1024x1024
- Can be created using online converters or `iconutil` on macOS

### Linux (.png)
- PNG format
- Recommended size: 512x512 or 1024x1024
- Can support high-DPI with @2x, @3x suffixes

## Scripts

- `npm run create-icon`: Creates `build/icon.ico` from PNG assets
- `npm run embed-icon`: Embeds icon into the built executable (runs after build)
- `scripts/clear-icon-cache.bat`: Clears Windows icon cache

## Best Practices

1. **Always use `resolveAppIcon()`** instead of hardcoded paths
2. **Always call `setWindowIcon()`** after creating a BrowserWindow
3. **Include icon in both `icon` property and `setIcon()` call** for maximum compatibility
4. **Test in both development and production builds**
5. **Clear icon cache after rebuilding** if icon doesn't update

## References

- [Electron BrowserWindow icon documentation](https://www.electronjs.org/docs/latest/api/browser-window#new-browserwindowoptions)
- [electron-builder icon configuration](https://www.electron.build/icons)
- [Windows icon cache clearing](https://support.microsoft.com/en-us/windows/refresh-your-windows-10-start-menu-7a1a4bcf-5b3e-1b0b-0b3e-1b0b0b0b0b0b)


