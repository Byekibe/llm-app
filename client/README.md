This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# AI Q&A Assistant

An interactive Q&A system built with Next.js and FastAPI, integrating with Google's Gemini LLM API.

## Features

- Interactive chat interface for querying the AI
- Real-time responses with Markdown formatting
- Chat history storage and management
- Responsive design for all device sizes
- Loading states and error handling

## Tech Stack

### Frontend
- Next.js (latest version)
- TypeScript
- TailwindCSS for styling
- shadcn/ui for UI components
- Redux Toolkit for state management
- RTK Query for API interactions
- Lucide React for icons

### Backend
- FastAPI (Python)
- Google Gemini API integration

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- Python 3.8 or higher
- Google AI API key for Gemini

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install frontend dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following:
```
NEXT_PUBLIC_API_URL=http://localhost:5002
```

4. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory with:
```
GOOGLE_API_KEY=your_google_api_key
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload --port 5002
```

2. In a separate terminal, start the frontend:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app                  # Next.js app directory
│   ├── api              # API integration
│   ├── utils            # Utility functions
│   ├── page.tsx         # Main chat interface
│   └── layout.tsx       # Root layout
├── components           # Reusable UI components
├── lib                  # Helper functions
├── public               # Static assets
└── backend              # FastAPI backend
    ├── main.py          # Main API endpoints
    └── requirements.txt # Python dependencies
```

## LLM Integration

This project uses Google's Gemini AI models through their API. The integration handles:
- Text generation
- Chat conversations
- Error handling and rate limiting

## Prompt Engineering

For optimal results, the system uses carefully crafted prompts that:
1. Provide clear context to the model
2. Request structured responses when appropriate
3. Handle conversational context through chat history