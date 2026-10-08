# Guide Tones

A piano flashcard tool for learning guide tones and four-note rootless voicings. Open `index.html` directly, or publish it with GitHub Pages to use it on an iPad or another device.

`index.html` is the source file to edit going forward. It contains all of the app's HTML, CSS, and JavaScript. There is no build step, server-side code, package installation, or external asset dependency.

## Practice

- Three-octave piano from C2 to B4 with independent root and guide-tone display styles.
- Default display: dots for roots and highlighted keys for guide tones.
- Guide Tones tab: 36 dominant, major, and minor seventh chords by default; additional chord families are optional.
- Rootless Voicings tab: 72 cards covering Type A and Type B for those 36 core chords. Use Type A, Type B, or Random above the chord name; fine-tune the selection in the chord pool.
- Click the large chord name to preview any root and quality available in that lesson. Previews outside the selected pool return to the pool on Next or Start practice.
- Expand button beside the card status fills the browser window with the flashcard and practice controls. The keyboard keeps the key proportions measured in normal view and grows into available space around the chord and controls. Those proportions stay fixed while rotating the screen. Tap again or press Escape to restore; F toggles the layout. Works in either iPad orientation, with scrolling available for shorter screens or hanging tags.
- Timed drills, answer reveal controls, and an Anki-inspired review scheduler.
- Browser-local settings and progress, with JSON export and import.

## Rootless voicings

Type A starts on the third; Type B starts on the seventh. The answer shows four notes in ascending order in a specific register, with the lowest note between C3 and B3. The keyboard viewport is C2–B4; changing the viewport leaves the voicings' pitches intact. Unlike guide tones, voiced notes are marked only in that register so the two shapes remain distinct. Root markers remain visual references; **Hear voicing** plays only the four voiced notes together.

Choosing Type A or Type B converts the selected root/quality combinations to that type. Random includes both types for those same chords and makes a fresh type choice on each new card. In spaced review, due cards take priority over new cards, and cards scheduled for later remain excluded. Within that eligible set, either available type is equally likely. In Random mode, a white outline around Type A or Type B identifies the current voicing. Type selection is saved, and the A/B ratings remain independent.

| Family | Type A, low to high | Type B, low to high |
| --- | --- | --- |
| Major seventh | 3 · 5 · 7 · 9 | 7 · 9 · 3 · 5 |
| Minor seventh | m3 · 5 · m7 · 9 | m7 · 9 · m3 · 5 |
| Dominant seventh | 3 · 13 · m7 · 9 | m7 · 9 · 3 · 13 |

These are the A/B conventions described by [PianoGroove's rootless voicing lesson](https://www.pianogroove.com/jazz-piano-lessons/body-soul-rootless-voicings/). Seventh-chord symbols identify the family; the voicing adds ninths and, for dominants, thirteenths. Optional diminished and altered families remain in Guide Tones; this first rootless set covers the three core families.

Each lesson has its own chord pool, review history, and schedule. A and B are separate cards. Switching tabs pauses the current practice and opens a fresh preview or review session; saved ratings are retained. Display preferences and timing settings are shared. Existing backups load with Guide Tones progress intact and a fresh rootless deck. New backups include both decks; importing replaces both.

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

The checks cover chord spelling, all 72 rootless voicings and their note order, written octaves, scheduling, separate review decks, backup migration and validation, the default chord pools, optional diminished families, display preference migration, and all 49 root/tone style combinations. They use Node's standard library and need no package installation.
