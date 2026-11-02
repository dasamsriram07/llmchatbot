# TechBuddy AI Chat

## Overview
A polished, developer‑focused web UI for the TechBuddy AI chatbot. The interface uses a light theme by default, supports a dark/light toggle, a responsive sidebar, static explanatory prompts (Explain a concept, Debug code, Explore DSA), and a streamlined message composer while keeping the existing Gemini backend unchanged.

## Features
- Light theme (default) with dark mode toggle persisted in `localStorage`
- Responsive sidebar with logo, **New Chat** button, conversation list, and theme toggle
- Welcome screen with three static prompt texts: **Explain a concept**, **Debug code**, **Explore DSA**
- Bottom‑fixed multiline message composer with send button and `Enter`/`Shift+Enter` shortcuts
- Automatic hiding of the welcome screen after the first message
- Conversation history and usage counter
- Markdown rendering, syntax highlighting, and copy‑to‑clipboard for code blocks

## Demo
Access the live deployed version: https://llmchatbot-ten.vercel.app/

## Repository
Source code: https://github.com/dasamsriram07/llmchatbot.git

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Start the server:
   ```bash
   nodemon server.js   # or `node server.js`
   ```
4. Open the UI locally:
   `http://localhost:3000/`

## Usage
- The static prompts are displayed as highlighted text on the welcome screen.
- Use the theme toggle (🌙/🌞) to switch between light and dark modes; the choice is saved.
- Click **New Chat** to start a fresh conversation.
- The usage counter in the header shows the number of API calls made.
