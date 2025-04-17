import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const TYPE_COLORS = {
  normal: "bg-gray-200",
  fire: "bg-red-400",
  water: "bg-blue-400",
  electric: "bg-yellow-300",
  grass: "bg-green-400",
  ice: "bg-blue-200",
  fighting: "bg-red-600",
  poison: "bg-purple-400",
  ground: "bg-yellow-600",
  flying: "bg-indigo-300",
  psychic: "bg-pink-400",
  bug: "bg-green-500",
  rock: "bg-yellow-700",
  ghost: "bg-purple-600",
  dragon: "bg-indigo-600",
  dark: "bg-gray-800",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

export default function PokemonCard({ pokemon, url }) {
  const [pokemonData, setPokemonData] = useState(null);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const response = await fetch(url || pokemon.url);
        const data = await response.json();
        setPokemonData(data);
      } catch (error) {
        console.error("Error fetching pokemon data:", error);
      }
    };

    fetchPokemonData();
  }, [url, pokemon]);

  if (!pokemonData)
    return <div className="animate-pulse bg-gray-200 rounded-xl h-40"></div>;

  const mainType = pokemonData.types[0].type.name;
  const bgColor = TYPE_COLORS[mainType] || "bg-gray-200";

  return (
    <Link
      to={`/pokemon/${pokemonData.id}`}
      className={`${bgColor} rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center`}
    >
      <div className="w-full text-right text-white font-medium">
        #{String(pokemonData.id).padStart(3, "0")}
      </div>
      <img
        src={
          pokemonData.sprites.other["official-artwork"].front_default ||
          pokemonData.sprites.front_default
        }
        alt={pokemonData.name}
        className="w-24 h-24 object-contain my-2"
      />
      <h3 className="text-lg font-semibold capitalize mb-1 text-center">
        {pokemonData.name}
      </h3>
      <div className="flex gap-1 mt-1">
        {pokemonData.types.map((typeInfo) => (
          <span
            key={typeInfo.type.name}
            className="text-xs text-white px-2 py-1 rounded-full bg-black/20 capitalize"
          >
            {typeInfo.type.name}
          </span>
        ))}
      </div>
    </Link>
  );
}
