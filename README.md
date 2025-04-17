# Pokedex - Pokémon Explorer Application

A web application that displays Pokémon information using [PokeAPI](https://pokeapi.co/). This application allows users to view a list of Pokémon and details of each Pokémon such as base stats, moves, and evolution chains.

Live demo: [https://poke-explorer-web.vercel.app/](https://poke-explorer-web.vercel.app/)

## User Interface

- **Pokedex Page**: Displays a grid of Pokémon with cards colored according to Pokémon type
- **Pokémon Detail**: Shows comprehensive information about a specific Pokémon, including:
  - Basic information (height, weight, abilities)
  - Base stats with bar graphs
  - Evolution chain with visualization
  - List of moves the Pokémon can learn

## Technologies Used

- React.js
- React Router for navigation
- Tailwind CSS for styling
- Fetch API to retrieve data from PokeAPI

### Installation Steps

1. Clone the repository from GitHub:

   ```bash
   git clone https://github.com/dzul58/poke-explorer-web.git
   ```

2. Navigate to the project directory:

   ```bash
   cd poke-explorer-web
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the application in development mode:

   ```bash
   npm run dev
   ```

5. The application will run on `http://localhost:5173` or another specified port. Open your browser and access this URL to view the application.

## Deployment

This application is deployed using [Vercel](https://vercel.com/). Any changes to the main branch will be automatically deployed.

## Features and Usage

1. **Main Page (Pokedex)**:

   - Displays a grid of Pokémon with images, names, and types
   - "Load More" button to load more Pokémon
   - Click on a Pokémon card to view details

2. **Pokémon Detail Page**:
   - "About" tab: General information about the Pokémon
   - "Base Stats" tab: Base statistics with bar graph visualization
   - "Evolution" tab: Pokémon's evolution chain with images and evolution conditions
   - "Moves" tab: List of the Pokémon's moves with type, power, accuracy, and PP

## Credits

- Pokémon data provided by [PokeAPI](https://pokeapi.co/)
- Pokémon images provided by PokeAPI through the sprites endpoint
