# Gemini CLI Web Interface

A retro-styled, web-based terminal interface for interacting with Google's Gemini AI models. Built with React, TypeScript, and the Google GenAI SDK.

## Features

- **Terminal UI**: Authentic command-line look and feel with blinking cursor, timestamps, and color-coded output.
- **Streaming Responses**: Real-time text streaming from Gemini models.
- **Slash Commands**:
  - `/model [flash|pro]`: Switch between Gemini Flash (faster) and Pro (smarter) models.
  - `/system [instruction]`: Set a system instruction to guide the AI's behavior.
  - `/clear`: Clear the terminal history.
  - `/help`: View available commands.
- **History Navigation**: Use `Up` and `Down` arrow keys to cycle through your command history.
- **Thinking Mode**: Support for Gemini 3 Pro's thinking capabilities (configured in code).

## Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gemini-cli.git
   cd gemini-cli
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your API Key:
   ```env
   API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Technologies

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI SDK**: @google/genai
- **Build Tool**: Vite

## License

MIT
