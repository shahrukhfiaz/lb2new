# Building for macOS Without a Mac

Since building for macOS requires a macOS system, here are your options:

## Option 1: GitHub Actions (Recommended - Free)

If you have a GitHub repository, you can use the included GitHub Actions workflow to automatically build for macOS.

### Steps:

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add macOS build support"
   git push origin main
   ```

2. **Go to GitHub Actions**
   - Navigate to your repository on GitHub
   - Click on the "Actions" tab
   - You'll see the "Build macOS" workflow

3. **Trigger the build**
   - Click on "Build macOS"
   - Click "Run workflow"
   - Select your branch and click "Run workflow"

4. **Download the build**
   - Once the workflow completes, go to the workflow run
   - Click on "macos-x64-build" or "macos-arm64-build" artifacts
   - Download the DMG file

## Option 2: Use a Cloud macOS Service

### MacStadium (Free Trial)
- Sign up at https://www.macstadium.com/
- Get access to a remote Mac for building
- Run `npm run dist:mac` on the remote Mac

### GitHub Codespaces (If Available)
- Some plans offer macOS runners
- Check your GitHub plan for availability

### CircleCI (Free Tier Available)
- Sign up at https://circleci.com/
- Add a `.circleci/config.yml` file
- Use their macOS runners

## Option 3: Ask Someone with a Mac

If you know someone with a Mac, they can:
1. Clone your repository
2. Run `npm install`
3. Run `npm run dist:mac`
4. Share the DMG file from `release-icon-embed/` folder

## Current Configuration

The macOS build is already configured in `package.json`:
- **Target**: DMG installer
- **Architectures**: x64 (Intel) and arm64 (Apple Silicon)
- **Output**: `DAT Loadboard-2.0.0-{arch}.dmg`

## Manual Build Command

If you have access to a Mac:
```bash
npm run dist:mac
```

The DMG file will be created in the `release-icon-embed/` folder.

