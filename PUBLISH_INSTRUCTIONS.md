# Publish to GitHub — Option B (run on YOUR machine)

Version: **1.5HD**
Changes included:
- Password for ALL protected actions (Clear History, Delete Selected, Delete Mode, delete dish): `DeepH@2805`
- Compact mobile-first redesign with professional modern styling + dark mode

Files you need (also inside updated_1.5HD.zip):
- index.html
- css/style.css
- js/app.js
- vercel.json
- .gitignore

SHA-256 checksums (verify after copying):
  cb0e6e496484c905bb8674a62c8cbedfab8d285c27538b9ab80aefa7aa433284  index.html
  38dbc0fb76af67a07a79eecaec282cab4692842b042f8011bf6118a47562579e  css/style.css
  f7ae0de52dc268313f0adf8b44c6bbe2011a905a680d30e81268184cdd59290c  js/app.js

---

## Path 1 — You already have the repo cloned locally

```bash
cd <your-repo-folder>            # e.g. cd ~/projects/dish-picker
git pull                         # get latest from GitHub first

# Copy the new files over the old ones (from wherever you saved this zip):
unzip updated_1.5HD.zip -d .     # or copy index.html, css/, js/ manually

git add -A
git commit -m "v1.5HD: password DeepH@2805 + compact mobile redesign"
git push origin main             # use master if that is your default branch
```

## Path 2 — Fresh clone

```bash
git clone https://github.com/<USERNAME>/<REPO>.git
cd <REPO>
unzip /path/to/updated_1.5HD.zip -d .
git add -A
git commit -m "v1.5HD: password DeepH@2805 + compact mobile redesign"
git push origin main
```

## Path 3 — No terminal at all (GitHub website upload)

1. Open your repo on https://github.com
2. Click **Add file -> Upload files**
3. Drag in: `index.html`, `css/style.css`, `js/app.js` (the website keeps folder paths when you drag whole folders)
4. Commit message: `v1.5HD: password DeepH@2805 + compact mobile redesign`
5. Click **Commit changes**

---

## If the push asks for a password
GitHub no longer accepts account passwords. Use one of:
- **Personal Access Token**: GitHub -> Settings -> Developer settings -> Personal access tokens
  -> generate one with `repo` scope -> when prompted for a password during push, paste the token.
- **SSH key**: `ssh-keygen -t ed25519` -> add the public key to GitHub -> use the SSH clone URL.
- **GitHub Desktop** or `gh auth login` (CLI) — handles auth automatically.

## Verify it published
Open `https://github.com/<USERNAME>/<REPO>` and confirm:
- raw index.html contains `DeepH@2805` (Ctrl+F on the raw view)
- raw index.html contains the new markup (`quick-grid` class)
Then test the live site (Vercel/GitHub Pages) with a hard refresh (Ctrl+Shift+R).
