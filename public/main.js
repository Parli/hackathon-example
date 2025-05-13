// This is a Pokémon mood-based team generator

// `ai` Vercel AI SDK https://ai-sdk.dev/docs/
import {
  streamText,
  createProviderRegistry,
} from "https://cdn.jsdelivr.net/npm/ai@4.3.15/+esm";
// `@ai-sdk/openai` Vercel AI SDK OpenAI Provider https://ai-sdk.dev/providers/ai-sdk-providers/openai
import { createOpenAI } from "https://cdn.jsdelivr.net/npm/@ai-sdk/openai@1.3.22/+esm";
// `@ai-sdk/anthropic` Vercel AI SDK Anthropic Provider https://ai-sdk.dev/providers/ai-sdk-providers/anthropic
import { createAnthropic } from "https://cdn.jsdelivr.net/npm/@ai-sdk/anthropic@1.2.11/+esm";
// `@ai-sdk/google` Vercel AI SDK Google Provider https://ai-sdk.dev/providers/ai-sdk-providers/google
import { createGoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@ai-sdk/google@1.2.18/+esm";
// `marked` Markdown parser
import { marked } from "https://cdn.jsdelivr.net/npm/marked@15.0.11/+esm";
// `morphdom` DOM diff minimizer
import morphdom from "https://cdn.jsdelivr.net/npm/morphdom@2.7.5/+esm";

// Define Pokémon Card Web Component
class PokemonCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['pokemon-id', 'pokemon-name'];
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      await this.render();
    }
  }

  async fetchPokemonData() {
    const pokemonId = this.getAttribute('pokemon-id');
    const pokemonName = this.getAttribute('pokemon-name');
    
    try {
      let url;
      if (pokemonId) {
        url = `/api/proxy/https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
      } else if (pokemonName) {
        url = `/api/proxy/https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
      } else {
        return null;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Pokémon not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
      return null;
    }
  }

  async fetchSpeciesData(speciesUrl) {
    try {
      const proxyUrl = `/api/proxy/${speciesUrl}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Species data not found');
      return await response.json();
    } catch (error) {
      console.error('Error fetching species data:', error);
      return null;
    }
  }

  async render() {
    const pokemon = await this.fetchPokemonData();
    if (!pokemon) {
      this.shadowRoot.innerHTML = `
        <div class="error">Pokémon not found</div>
      `;
      return;
    }

    const species = await this.fetchSpeciesData(pokemon.species.url);
    
    const typeColors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };

    const mainType = pokemon.types[0].type.name;
    const bgColor = typeColors[mainType] || '#888888';
    
    // Get English flavor text
    let flavorText = '';
    if (species && species.flavor_text_entries) {
      const englishEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
      if (englishEntry) {
        flavorText = englishEntry.flavor_text.replace(/\f/g, ' ');
      }
    }

    this.shadowRoot.innerHTML = `
      <style>
        .pokemon-card {
          width: 250px;
          border-radius: 10px;
          padding: 15px;
          margin: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(to bottom, ${bgColor}, white);
          font-family: Arial, sans-serif;
          transition: transform 0.3s ease;
        }
        
        .pokemon-card:hover {
          transform: translateY(-5px);
        }
        
        .pokemon-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .pokemon-name {
          font-size: 1.4em;
          font-weight: bold;
          text-transform: capitalize;
          margin: 0;
          color: #333;
        }
        
        .pokemon-id {
          font-size: 1em;
          color: #666;
        }
        
        .pokemon-image {
          width: 120px;
          height: 120px;
          margin: 10px 0;
        }
        
        .pokemon-types {
          display: flex;
          gap: 10px;
          margin: 5px 0;
        }
        
        .type {
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.8em;
          font-weight: bold;
          color: white;
          text-transform: capitalize;
        }
        
        .stats {
          width: 100%;
          margin-top: 10px;
        }
        
        .stat {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          font-size: 0.8em;
        }
        
        .stat-name {
          color: #555;
          text-transform: capitalize;
        }
        
        .flavor-text {
          font-style: italic;
          font-size: 0.9em;
          margin-top: 10px;
          color: #555;
          text-align: center;
        }
      </style>
      
      <div class="pokemon-card">
        <div class="pokemon-header">
          <h2 class="pokemon-name">${pokemon.name}</h2>
          <span class="pokemon-id">#${pokemon.id}</span>
        </div>
        
        <img class="pokemon-image" src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}">
        
        <div class="pokemon-types">
          ${pokemon.types.map(typeInfo => 
            `<span class="type" style="background-color: ${typeColors[typeInfo.type.name]}">
              ${typeInfo.type.name}
            </span>`
          ).join('')}
        </div>
        
        <div class="stats">
          ${pokemon.stats.slice(0, 3).map(stat => 
            `<div class="stat">
              <span class="stat-name">${stat.stat.name.replace('-', ' ')}</span>
              <span class="stat-value">${stat.base_stat}</span>
            </div>`
          ).join('')}
        </div>
        
        ${flavorText ? `<p class="flavor-text">${flavorText}</p>` : ''}
      </div>
    `;
  }
}

// Register the web component
customElements.define('pokemon-card', PokemonCard);

// Shared config
// Mapping of models for each provider
const modelMap = {
  openai: "gpt-4.1",
  anthropic: "claude-3-7-sonnet-latest",
  google: "gemini-2.5-flash-preview-04-17",
};

// System prompt for the Pokémon team generator
const systemPrompt = `You are a Pokémon Team Generator that creates the perfect team based on the user's mood, personality, or preferences.

When responding to a user query about what Pokémon team they should use:

1. Analyze their mood, personality traits, or preferences described in their query.
2. Select 6 Pokémon that match this mood/personality.
3. For each Pokémon:
   - Provide a brief explanation of why it matches their mood/personality
   - Include a <pokemon-card pokemon-name="pokemonName"> tag (using the exact Pokémon name)

Format your response as follows:
1. A brief introduction connecting their mood to the team theme
2. For each of the 6 Pokémon:
   - Name and brief reasoning
   - <pokemon-card> tag
3. A conclusion about how the team works together

Always ensure you use correct Pokémon names that exist in the PokéAPI database. Only use the "pokemon-name" attribute in the <pokemon-card> tag, not pokemon-id.

Example response format:
"Based on your [mood/preference], here's a team that embodies [theme]:

1. Pikachu: [reason]
<pokemon-card pokemon-name="pikachu"></pokemon-card>

2. Charizard: [reason]
<pokemon-card pokemon-name="charizard"></pokemon-card>

... and so on for all 6 Pokémon"

If the user's query doesn't mention mood or personality, prompt them to share how they're feeling or what kind of personality they have so you can generate an appropriate team.`;

// Initialize providers with the proxy url and server side env var interpolation strings
// https://ai-sdk.dev/docs/reference/ai-sdk-core/provider-registry
const registry = createProviderRegistry({
  openai: createOpenAI({
    baseURL: "/api/proxy/https://api.openai.com/v1",
    apiKey: "${OPENAI_API_KEY}",
  }),
  anthropic: createAnthropic({
    baseURL: "/api/proxy/https://api.anthropic.com/v1",
    apiKey: "${ANTHROPIC_API_KEY}",
  }),
  google: createGoogleGenerativeAI({
    baseURL: "/api/proxy/https://generativelanguage.googleapis.com/v1beta",
    apiKey: "${GEMINI_API_KEY}",
  }),
});
// Setup elements
// Search form container
const searchForm = document.getElementById("search");
// Provider select dropdown
const providerSelect = document.getElementById("provider");
// User search input
const queryInput = document.getElementById("query");
// Answer display area
const answerContainer = document.getElementById("answer");
// Share thread button
const shareButton = document.getElementById("share");
shareButton.style.display = "none";
// Setup state
let userQuery = "";
let answerText = "";
// Handle input submission
searchForm.addEventListener("submit", async (event) => {
  // Set loading state
  event.preventDefault();
  answerContainer.innerHTML = "<div class='loading-message'><p>Generating your Pokémon team based on your mood...</p></div>";
  shareButton.style.display = "none";
  userQuery = queryInput.value;
  
  if (!userQuery.trim()) {
    answerContainer.innerHTML = "<div class='loading-message'><p>Please tell us how you're feeling so we can generate a team for you!</p></div>";
    return;
  }
  
  // Send the LLM request
  const provider = providerSelect.value;
  const model = modelMap[provider];
  // AI SDK's streamText utility for normalizing providers and providing a stream part generator
  // https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text
  const result = streamText({
    model: registry.languageModel(`${provider}:${model}`),
    system: systemPrompt,
    prompt: userQuery,
  });
  
  // Accumulate text parts asyncronously using text stream generator
  answerText = "";
  for await (const textPart of result.textStream) {
    answerText += textPart;
    // Render markdown text to an html string. HTML tags are supported and can be streamed in.
    // HTML web components tag can be used for custom content and does not require post-processing.
    // https://marked.js.org/#usage
    const html = marked.parse(answerText);
    // Diffs the existing HTML and updates it with minimal changes to preserve prior DOM nodes
    // https://www.npmjs.com/package/morphdom#api
    morphdom(answerContainer, `<div>${html}</div>`, {
      childrenOnly: true,
      onNodeAdded: (node) => {
        // When a pokemon-card node is added during streaming, ensure it's properly rendered
        if (node.tagName && node.tagName.toLowerCase() === 'pokemon-card') {
          // This ensures the component's attributeChangedCallback is triggered
          if (node.getAttribute('pokemon-name')) {
            const pokemonName = node.getAttribute('pokemon-name');
            node.setAttribute('pokemon-name', pokemonName);
          }
        }
        return node;
      }
    });
  }
  
  // Set complete state
  shareButton.style.display = "";
});
// Handle share button click
shareButton.addEventListener("click", async () => {
  // Store the question and answer text on the server store route
  const storeResponse = await fetch("/api/store/", {
    method: "POST",
    body: JSON.stringify({ question: userQuery, answer: answerText }),
  });
  // Get the url safe base64 storage id from the server store response
  const storeId = await storeResponse.text();
  // Redirect to the share url
  window.location = `?${storeId}`;
});
// Init app state
(async function init() {
  // Get url parameters for parsing thread storage id
  const urlParams = new URLSearchParams(window.location.search);
  const [id, value] = [...urlParams.entries()][0] ?? [];
  // Check if parameter is a base64 url safe thread storage id
  if (id && /^[a-z0-9_-]+$/i.test(id) && !value) {
    // Retrieve the stored thread from the id
    const storeResponse = await fetch(`/api/store/${id}`);
    // Extract the question and answer data from the storage response
    const { question, answer } = await storeResponse.json();
    // Update the app state with the thread data
    queryInput.value = question;
    const html = marked.parse(answer);
    answerContainer.innerHTML = `<div>${html}</div>`;
  }
})();
