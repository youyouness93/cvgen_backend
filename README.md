# CVGEN Backend

Backend service for the CV Generator application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```env
DATABASE_URL="your-database-url"
OPENAI_API_KEY="your-openai-api-key"
PORT=3000
CORS_ORIGIN="http://localhost:3000"
```

3. Run the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the project
- `npm start`: Start production server

## API Endpoints

### Analyze CV
- `POST /api/analyze`: Analyze CV content against job description
- `GET /api/analyze/:id`: Get CV data by ID

### Generate CV
- `POST /api/generate`: Generate optimized CV based on job description

## Environment Variables

- `DATABASE_URL`: MySQL database connection URL
- `OPENAI_API_KEY`: OpenAI API key
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed origin for CORS
