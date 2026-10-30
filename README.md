# Aamir Afroz — Personal Portfolio

A responsive personal portfolio for Aamir Afroz, a third-semester B.Tech Computer Science and Engineering student at JECRC University. Built with HTML, CSS, and vanilla JavaScript, with a Vercel serverless function for the Groq-powered portfolio assistant.

## Features

- Home, About, Skills, Projects, AI Assistant, and Contact sections
- Blue, white, and gold visual theme
- Responsive layout and mobile navigation
- Light/dark mode with saved preference in browser storage
- Project search by name/technology and technology filters
- Five project cards linking to the supplied GitHub repositories
- City weather lookup with current conditions using Open-Meteo (no weather API key required)
- AI portfolio Q&A through `/api/chat` powered by Groq
- No frontend API key; the Groq key is read from the server-side `GROQ_API_KEY` environment variable

## Weather feature

The weather section searches for a city using Open-Meteo geocoding and then requests current conditions. It does not need an API key. An internet connection is required.

## Run locally first

The chatbot needs the Vercel function runtime. Opening `index.html` directly or using VS Code Live Server will not run `/api/chat`.

1. Install Node.js (LTS) from the official Node.js website.
2. Open this project folder in VS Code.
3. Open Terminal → New Terminal and run `npm install`.
   On Windows, keep the project path free of spaces; Vercel's local function runtime can split paths containing spaces while loading functions.
4. Copy `.env.local.example` to a new file named `.env.local`.
5. Open `.env.local` and replace the placeholder with a **new** Groq API key:

   ```env
   GROQ_API_KEY=your_new_key_here
   ```

6. Run `npm run local`. If prompted, allow the Vercel CLI to set up local development.
7. Open the local URL shown in the terminal (usually `http://localhost:3000`). Test the chatbot by asking “Where does Aamir study?”

**Security:** A real Groq credential was mistakenly included in the example environment files and has been removed. Revoke that credential in Groq and create a new key before testing, especially if this project was pushed or shared. Do not share the new key in chat or commit `.env.local`; the `.gitignore` file excludes local environment files.

If the chatbot fails, check the terminal where `npm run local` is running. The API function logs the Groq HTTP status and provider error there without printing the key. A `401` usually means the key is invalid/revoked; `429` indicates a rate limit or quota issue; a model-related error means the configured model may not be available to the account.

## Deploy to Vercel

1. Create a new GitHub repository, for example `aamir-portfolio`.
2. Upload/push all files in this folder to the repository root.
3. Sign in to Vercel using GitHub and import the portfolio repository.
4. The project uses plain HTML/CSS/JS and a Vercel function in `api/chat.js`; no build command is required.
5. In Vercel Project Settings → Environment Variables, add `GROQ_API_KEY` with a newly generated Groq API key. Apply it to Production (and Preview if needed).
6. Redeploy after adding the variable, then test the deployed site and ask the chatbot a question.
7. Test the weather section with a city such as Jaipur; it requires an internet connection but no separate weather key.

## Before submitting

- Confirm the five project titles and repository links match the actual coursework. The supplied `book-reading` and `Python-Basic-PE` links may not correspond to the task labels, and the exact bug-fixing project details were not provided.
- No deployed Reading List URL was supplied, so this portfolio does not claim a live demo link for it.
- Add a real profile photo if desired; the current hero uses a designed monogram and does not pretend to be a photograph.
- Replace any project description that does not match the actual repository contents.

## Technologies

HTML5, CSS3, vanilla JavaScript, Open-Meteo geocoding and weather APIs, Groq Chat Completions API, Vercel Functions, GitHub.
