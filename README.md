# Guide Tones

A piano flashcard tool for learning the thirds and sevenths of seventh chords. Open `index.html` directly, or publish it with GitHub Pages to use it on an iPad or another device.

`index.html` is the source file to edit going forward. It contains all of the app's HTML, CSS, and JavaScript. There is no build step, server-side code, package installation, or external asset dependency.

## Practice

- Three-octave piano with independent root and guide-tone display styles.
- Default display: dots for roots and highlighted keys for guide tones.
- Default pool: 36 dominant, major, and minor seventh chords; additional chord families are optional.
- Timed drills, answer reveal controls, and an Anki-inspired review scheduler.
- Browser-local settings and progress, with JSON export and import.

The printable PDFs and the previous standalone `guide-tones.html` snapshot remain outside this repository. Make future app changes in this repository's `index.html`.

## Publish with GitHub Pages

1. Sign in to [GitHub](https://github.com/new) and create a repository named **guide-tones**. For GitHub Free, use **Public**. Leave the options to add a README, `.gitignore`, and license off because this local repository already has a commit.
2. Open PowerShell in this folder. Replace `YOUR-USERNAME` with your GitHub username and run:

   ```powershell
   git remote add origin https://github.com/YOUR-USERNAME/guide-tones.git
   git push -u origin main
   ```

   If Git prompts you to sign in, complete the GitHub sign-in flow. Your GitHub account password is not a Git HTTPS password; use the credential manager's browser sign-in or an appropriate token if prompted.

3. On the repository's GitHub page, open **Settings > Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose **main** and **/(root)**, and click **Save**.
5. Wait for deployment to finish. The Pages settings page will show the live address, usually:

   ```text
   https://YOUR-USERNAME.github.io/guide-tones/
   ```

The empty `.nojekyll` file tells Pages to serve the static files without Jekyll processing. Future pushes to `main` update the site automatically. GitHub Pages publishes a publicly accessible website.

Official guidance: [push an existing repository](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github), [Pages availability and entry files](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), and [publish from a branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Use it on an iPad

Open the Pages address in Safari. Your computer does not need to be running. You can bookmark the page, or add it to the Home Screen through Safari's sharing menu. Hosting this page does not add an offline cache; load the hosted version while connected to the internet.

Progress does **not** automatically sync between devices or browsers. Before moving from the existing local preview, use **Export progress**, transfer the JSON file to the iPad, and select **Import progress** on the hosted site. Import replaces the destination browser's saved progress. Localhost and the GitHub Pages address have separate browser storage, even on the same device.

## Make and publish changes

Edit `index.html`, open it in a browser to review, and run the existing checks if Node.js is available:

```powershell
node tests/verify.cjs
git diff
git add index.html
git commit -m "Describe the change"
git push
```

Stage other intended files explicitly when changing documentation or checks. To see saved versions, use `git log --oneline`.

The checks cover chord spelling, scheduling, backup validation, the default chord pool, optional diminished families, display preference migration, and all 49 root/tone style combinations. They use Node's standard library and need no package installation.
