---
description: How to load and test the ZenTask extension in Chrome
---

Follow these steps to load the built extension into your Google Chrome browser:

1. **Build the extension**:
   Ensure you have the latest code built by running:
   ```powershell
   npm run build
   ```

2. **Open Chrome Extensions**:
   In your Chrome browser, type `chrome://extensions/` in the address bar and press Enter.

3. **Enable Developer Mode**:
   Find the **Developer mode** toggle in the top-right corner of the page and turn it ON.

4. **Load Unpacked**:
   - Click the **Load unpacked** button that appears in the top-left area.
   - In the file picker, navigate to the project directory:
     `c:\Users\GPow\stash\ZenTask-ChromeExtension`
   - Select the **`dist`** folder and click **Select Folder**.

5. **Pin the Extension**:
   - Click the puzzle piece icon (Extensions) in your Chrome toolbar.
   - Find **ZenTask** and click the pin icon to keep it visible.

6. **Open New Tab**:
   The extension will now automatically take over your new tab page. Open a new tab (`Ctrl + T`) to see the results!

// turbo
### Quick Re-Build
If you make changes to the source code, run `npm run build` again and then click the **Update** button (circular arrow) on the ZenTask card in `chrome://extensions/`.
