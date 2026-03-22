# QuizCraft — UK & Cambridge Assessment Platform

A teacher-facing quiz platform supporting all UK/Cambridge question types with AI-powered marking and SVG illustrations.

---

## Deployment (GitHub + Netlify)

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click the **+** icon → **New repository**
3. Name it `quizcraft`
4. Set it to **Public**
5. Leave all other options as default → click **Create repository**

### Step 2 — Upload files to GitHub

1. On the new repository page, click **uploading an existing file**
2. Drag and drop ALL files from this folder:
   - `index.html`
   - `netlify.toml`
   - `netlify/` folder (with `edge-functions/claude.js` inside)
3. Scroll down, click **Commit changes**

### Step 3 — Deploy on Netlify (free)

1. Go to [netlify.com](https://netlify.com) and sign in with your GitHub account
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** → select your `quizcraft` repository
4. Build settings are detected automatically from `netlify.toml`
5. Click **Deploy site**

### Step 4 — Add your Anthropic API key to Netlify

1. In Netlify, go to your site → **Site configuration** → **Environment variables**
2. Click **Add a variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: your `sk-ant-…` key
5. Click **Save**
6. Go to **Deploys** → **Trigger deploy** → **Deploy site**

### Step 5 — Set a custom subdomain (optional but recommended)

1. In Netlify → **Domain management** → **Options** → **Edit site name**
2. Change to something like `quizcraft-yourschool`
3. Your site will be live at `https://quizcraft-yourschool.netlify.app`

### Step 6 — Use in Google Classroom

1. Open your live site URL
2. Build and publish quizzes as normal
3. Go to **Take a Quiz** → select a quiz → **Download student quiz file**
4. In Google Classroom, create an Assignment → attach the `.html` file
5. Students click the file to take the quiz with full AI marking

---

## Security

- Your API key lives **only** in Netlify's environment variables — never in the browser or in student files
- All AI calls from the teacher app go through `/api/claude` (Netlify Edge Function)
- Downloaded student files also route through the same secure proxy
- Students cannot access or extract your API key

## Local development

Open `index.html` directly in a browser. It will call the Anthropic API directly via Claude.ai's built-in authentication (no key needed when running inside Claude.ai).
