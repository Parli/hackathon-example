# Pokémon Mood Team Generator

A web application that generates a custom Pokémon team based on your mood or personality.

## Overview

This application allows users to input their current mood, personality traits, or preferences, and receive a carefully curated team of 6 Pokémon that match their input. Each Pokémon is displayed with detailed information including types, stats, and a description of why it fits the user's mood.

The application uses:
- PokéAPI to fetch Pokémon data and images
- Web Components for the Pokémon card UI
- AI-powered team generation based on mood analysis
- Support for multiple AI providers (OpenAI, Anthropic, Google)

## Prerequisites

Node.js 23.6.0

## Installation and Setup

1. Clone this repository
2. Initialize environment variables with `op inject -i example.env -o .env`
3. Run the server with `npm run dev`
4. Open your browser to `http://localhost:8080`

## Deployment

Deploy to Google Cloud Run with:

```
npm run deploy
```

Remove deployment with:

```
npm run undeploy
```

## How It Works

1. **User Input**: The user describes their mood, personality, or preferences.
2. **AI Analysis**: An AI model analyzes the input to determine appropriate Pokémon traits.
3. **Team Generation**: The AI selects 6 Pokémon that match the user's mood.
4. **Data Fetching**: For each Pokémon, the app fetches data from PokéAPI.
5. **Visual Display**: Each Pokémon is displayed in a custom card component showing types, stats, and more.

## Features

### Pokémon Card Web Component

The application uses a custom web component (`<pokemon-card>`) that:
- Fetches Pokémon data from PokéAPI
- Displays official artwork
- Shows type information with color coding
- Includes key stats and Pokédex description
- Creates a responsive card UI that adapts to each Pokémon's primary type

### AI-Powered Team Generation

The application uses AI to:
- Analyze emotional context and personality traits
- Match mood characteristics to Pokémon attributes
- Provide explanations for why each Pokémon matches the user's mood
- Create well-balanced teams that work together

### Sharing Teams

Users can share their generated teams by clicking the "Share My Team" button, which:
- Stores the team data in the application's built-in storage
- Generates a shareable URL with a unique ID
- Allows others to view the exact same team by visiting the URL

## API Endpoints

### Pokémon Data Proxy

The application proxies requests to PokéAPI to fetch Pokémon data:

```
GET /api/proxy/https://pokeapi.co/api/v2/pokemon/[id or name]
```

### Team Storage

```
GET /api/store/[hash]
POST /api/store/
```

## Technologies Used

- Vanilla JavaScript with Web Components
- Node.js server with HTTP proxy capabilities
- PokéAPI for Pokémon data
- AI APIs (OpenAI, Anthropic, Google) for team generation
- Vercel AI SDK for AI provider integration
