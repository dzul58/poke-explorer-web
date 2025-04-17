import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

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

const STAT_COLORS = {
  hp: "bg-red-400",
  attack: "bg-orange-400",
  defense: "bg-blue-400",
  "special-attack": "bg-purple-400",
  "special-defense": "bg-green-400",
  speed: "bg-pink-400",
};

export default function PokemonDetail() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(true);
  const [moveDetails, setMoveDetails] = useState({});
  const [loadingMoves, setLoadingMoves] = useState(false);
  const [evolutionChain, setEvolutionChain] = useState(null);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [evolutionPokemonDetails, setEvolutionPokemonDetails] = useState({});

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setLoading(true);
        const pokemonResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${id}`
        );
        const pokemonData = await pokemonResponse.json();

        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();

        setPokemon(pokemonData);
        setSpecies(speciesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pokemon details:", error);
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, [id]);

  // Fetch move details when moves tab is activated
  useEffect(() => {
    if (
      activeTab === "moves" &&
      pokemon &&
      Object.keys(moveDetails).length === 0
    ) {
      fetchMoveDetails();
    }
  }, [activeTab, pokemon]);

  // Fetch evolution chain when evolution tab is activated
  useEffect(() => {
    if (activeTab === "evolution" && species && !evolutionChain) {
      fetchEvolutionChain();
    }
  }, [activeTab, species]);

  const fetchMoveDetails = async () => {
    if (!pokemon) return;

    setLoadingMoves(true);

    // Limit to first 20 moves to avoid too many requests
    const movesToFetch = pokemon.moves.slice(0, 20);

    const moveDetailsObj = {};

    try {
      const promises = movesToFetch.map((moveInfo) =>
        fetch(moveInfo.move.url)
          .then((res) => res.json())
          .then((data) => {
            moveDetailsObj[moveInfo.move.name] = {
              name: moveInfo.move.name,
              type: data.type.name,
              power: data.power,
              accuracy: data.accuracy,
              pp: data.pp,
              damageClass: data.damage_class.name,
              learnMethod:
                moveInfo.version_group_details[0]?.move_learn_method.name,
            };
          })
      );

      await Promise.all(promises);
      setMoveDetails(moveDetailsObj);
    } catch (error) {
      console.error("Error fetching move details:", error);
    } finally {
      setLoadingMoves(false);
    }
  };

  const fetchEvolutionChain = async () => {
    if (!species) return;

    setLoadingEvolution(true);

    try {
      // Fetch evolution chain URL from species data
      const evolutionChainResponse = await fetch(species.evolution_chain.url);
      const evolutionChainData = await evolutionChainResponse.json();

      setEvolutionChain(evolutionChainData);

      // Extract all Pokémon from the evolution chain
      const evolutionPokemons = extractPokemonFromEvolutionChain(
        evolutionChainData.chain
      );

      // Fetch details for each Pokémon in the evolution chain
      const evolutionDetailsObj = {};

      const promises = evolutionPokemons.map(async (pokemonName) => {
        try {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
          );
          const data = await response.json();

          evolutionDetailsObj[pokemonName] = {
            id: data.id,
            name: data.name,
            sprite:
              data.sprites.other["official-artwork"].front_default ||
              data.sprites.front_default,
            types: data.types.map((t) => t.type.name),
          };
        } catch (error) {
          console.error(`Error fetching details for ${pokemonName}:`, error);
        }
      });

      await Promise.all(promises);
      setEvolutionPokemonDetails(evolutionDetailsObj);
    } catch (error) {
      console.error("Error fetching evolution chain:", error);
    } finally {
      setLoadingEvolution(false);
    }
  };

  // Helper function to extract all Pokémon from evolution chain
  const extractPokemonFromEvolutionChain = (chain) => {
    const results = [];

    // Add current species
    results.push(chain.species.name);

    // Recursively add evolutions
    if (chain.evolves_to && chain.evolves_to.length > 0) {
      chain.evolves_to.forEach((evolution) => {
        results.push(...extractPokemonFromEvolutionChain(evolution));
      });
    }

    return results;
  };

  // Helper function to create a flat representation of evolution chain for rendering
  const getFlatEvolutionChain = (chain, level = 0) => {
    const evolutions = [];

    // Add current evolution with its level
    evolutions.push({
      name: chain.species.name,
      level,
      minLevel: chain.evolution_details?.[0]?.min_level || null,
      trigger: chain.evolution_details?.[0]?.trigger?.name || null,
      item: chain.evolution_details?.[0]?.item?.name || null,
    });

    // Add evolutions recursively with increased level
    if (chain.evolves_to && chain.evolves_to.length > 0) {
      chain.evolves_to.forEach((evolution) => {
        evolutions.push(...getFlatEvolutionChain(evolution, level + 1));
      });
    }

    return evolutions;
  };

  if (loading || !pokemon || !species) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const mainType = pokemon.types[0].type.name;
  const bgColor = TYPE_COLORS[mainType] || "bg-gray-200";

  // Format height from decimeters to meters with proper formatting
  const heightInM = (pokemon.height / 10).toFixed(2);
  // Format weight from hectograms to kilograms
  const weightInKg = (pokemon.weight / 10).toFixed(1);

  const getAbilitiesList = () => {
    return pokemon.abilities
      .map((ability) =>
        ability.ability.name
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      )
      .join(", ");
  };

  const getGenderRatio = () => {
    if (species.gender_rate === -1) return "Genderless";
    const femalePercentage = (species.gender_rate / 8) * 100;
    return `♂ ${100 - femalePercentage}%, ♀ ${femalePercentage}%`;
  };

  const getEggGroups = () => {
    return species.egg_groups
      .map((group) => group.name.charAt(0).toUpperCase() + group.name.slice(1))
      .join(", ");
  };

  return (
    <div className={`${bgColor} min-h-screen p-6`}>
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className={`${bgColor} p-6 relative`}>
          <Link to="/" className="absolute left-0 top-0 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>

          <div className="absolute right-0 top-0 p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>

          <div className="text-right text-white font-medium mt-4">
            #{String(pokemon.id).padStart(3, "0")}
          </div>

          <h1 className="text-3xl font-bold text-white capitalize mt-2">
            {pokemon.name}
          </h1>

          <div className="flex gap-2 mt-2">
            {pokemon.types.map((typeInfo) => (
              <span
                key={typeInfo.type.name}
                className="text-sm text-white px-3 py-1 rounded-full bg-white/20 capitalize"
              >
                {typeInfo.type.name}
              </span>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <img
              src={
                pokemon.sprites.other["official-artwork"].front_default ||
                pokemon.sprites.front_default
              }
              alt={pokemon.name}
              className="w-48 h-48 object-contain"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="flex border-b mb-4">
            <button
              className={`flex-1 text-center py-2 ${
                activeTab === "about"
                  ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
            <button
              className={`flex-1 text-center py-2 ${
                activeTab === "baseStats"
                  ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("baseStats")}
            >
              Base Stats
            </button>
            <button
              className={`flex-1 text-center py-2 ${
                activeTab === "evolution"
                  ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("evolution")}
            >
              Evolution
            </button>
            <button
              className={`flex-1 text-center py-2 ${
                activeTab === "moves"
                  ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("moves")}
            >
              Moves
            </button>
          </div>

          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center">
                <span className="text-gray-500">Species</span>
                <span className="col-span-2 capitalize">
                  {species.genera.find((g) => g.language.name === "en")
                    ?.genus || "Unknown"}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center">
                <span className="text-gray-500">Height</span>
                <span className="col-span-2">
                  {heightInM} m ({(heightInM * 3.28084).toFixed(2)} ft)
                </span>
              </div>

              <div className="grid grid-cols-3 items-center">
                <span className="text-gray-500">Weight</span>
                <span className="col-span-2">
                  {weightInKg} kg ({(weightInKg * 2.20462).toFixed(2)} lbs)
                </span>
              </div>

              <div className="grid grid-cols-3 items-center">
                <span className="text-gray-500">Abilities</span>
                <span className="col-span-2">{getAbilitiesList()}</span>
              </div>

              <h3 className="font-bold text-lg mt-6">Breeding</h3>

              <div className="grid grid-cols-3 items-center">
                <span className="text-gray-500">Gender</span>
                <span className="col-span-2">{getGenderRatio()}</span>
              </div>

              <div className="grid grid-cols-3 items-center">
                <span className="text-gray-500">Egg Groups</span>
                <span className="col-span-2">{getEggGroups()}</span>
              </div>

              <div className="grid grid-cols-3 items-center">
                <span className="text-gray-500">Egg Cycle</span>
                <span className="col-span-2">
                  {species.hatch_counter} cycles
                </span>
              </div>
            </div>
          )}

          {activeTab === "baseStats" && (
            <div className="space-y-4">
              {pokemon.stats.map((stat) => {
                const statName = stat.stat.name;
                const statValue = stat.base_stat;
                const statColor = STAT_COLORS[statName] || "bg-gray-400";
                const percentage = Math.min(100, (statValue / 255) * 100);

                return (
                  <div
                    key={statName}
                    className="grid grid-cols-6 items-center gap-2"
                  >
                    <span className="text-gray-500 capitalize col-span-2">
                      {statName === "hp"
                        ? "HP"
                        : statName === "special-attack"
                        ? "Sp. Atk"
                        : statName === "special-defense"
                        ? "Sp. Def"
                        : statName.charAt(0).toUpperCase() + statName.slice(1)}
                    </span>
                    <span className="font-medium">{statValue}</span>
                    <div className="col-span-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${statColor} h-full rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <div className="grid grid-cols-6 items-center gap-2 mt-4">
                <span className="text-gray-500 col-span-2">Total</span>
                <span className="font-medium">
                  {pokemon.stats.reduce(
                    (total, stat) => total + stat.base_stat,
                    0
                  )}
                </span>
              </div>
            </div>
          )}

          {activeTab === "evolution" && (
            <div className="space-y-4">
              {loadingEvolution ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : evolutionChain ? (
                <div>
                  {evolutionChain && (
                    <div className="grid grid-cols-1 gap-8">
                      {Object.keys(evolutionPokemonDetails).length > 0 && (
                        <div className="flex flex-wrap justify-around items-center gap-4">
                          {getFlatEvolutionChain(evolutionChain.chain).map(
                            (evolution, index, array) => {
                              const pokemonDetail =
                                evolutionPokemonDetails[evolution.name];
                              if (!pokemonDetail) return null;

                              const mainType = pokemonDetail.types
                                ? pokemonDetail.types[0]
                                : "normal";
                              const bgColor =
                                TYPE_COLORS[mainType] || "bg-gray-200";

                              return (
                                <div
                                  key={evolution.name}
                                  className="flex flex-col items-center"
                                >
                                  <Link
                                    to={`/pokemon/${pokemonDetail.id}`}
                                    className={`${bgColor} rounded-full p-4 shadow-md hover:shadow-lg transition-all duration-200`}
                                  >
                                    <img
                                      src={pokemonDetail.sprite}
                                      alt={evolution.name}
                                      className="w-24 h-24 object-contain"
                                    />
                                  </Link>
                                  <div className="mt-2 text-center">
                                    <h3 className="font-medium capitalize">
                                      {evolution.name.replace(/-/g, " ")}
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                      #
                                      {String(pokemonDetail.id).padStart(
                                        3,
                                        "0"
                                      )}
                                    </span>
                                  </div>

                                  {/* Evolution details - arrow and conditions */}
                                  {index < array.length - 1 &&
                                    evolution.level ===
                                      array[index + 1].level - 1 && (
                                      <div className="flex flex-col items-center my-2">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-6 w-6 text-gray-400"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                          />
                                        </svg>
                                        {array[index + 1].minLevel && (
                                          <span className="text-xs text-gray-500 mt-1">
                                            Level {array[index + 1].minLevel}
                                          </span>
                                        )}
                                        {array[index + 1].item && (
                                          <span className="text-xs text-gray-500 mt-1 capitalize">
                                            {array[index + 1].item.replace(
                                              /-/g,
                                              " "
                                            )}
                                          </span>
                                        )}
                                        {array[index + 1].trigger &&
                                          array[index + 1].trigger !==
                                            "level-up" &&
                                          !array[index + 1].minLevel &&
                                          !array[index + 1].item && (
                                            <span className="text-xs text-gray-500 mt-1 capitalize">
                                              {array[index + 1].trigger.replace(
                                                /-/g,
                                                " "
                                              )}
                                            </span>
                                          )}
                                      </div>
                                    )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500">
                    Tidak ada data evolusi yang tersedia
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "moves" && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {loadingMoves ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : Object.keys(moveDetails).length > 0 ? (
                <>
                  <div className="text-sm text-gray-500 mb-2">
                    Menampilkan {Object.keys(moveDetails).length} dari{" "}
                    {pokemon.moves.length} gerakan
                  </div>
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 border-b pb-2">
                    <div className="col-span-4">Nama</div>
                    <div className="col-span-2">Tipe</div>
                    <div className="col-span-2">Power</div>
                    <div className="col-span-2">Akurasi</div>
                    <div className="col-span-2">PP</div>
                  </div>
                  {Object.values(moveDetails).map((move) => {
                    const typeColor = TYPE_COLORS[move.type] || "bg-gray-200";
                    return (
                      <div
                        key={move.name}
                        className="grid grid-cols-12 gap-2 py-2 border-b text-sm"
                      >
                        <div className="col-span-4 font-medium capitalize">
                          {move.name.replace("-", " ")}
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`${typeColor} text-white px-2 py-1 rounded-full text-xs capitalize`}
                          >
                            {move.type}
                          </span>
                        </div>
                        <div className="col-span-2">{move.power || "-"}</div>
                        <div className="col-span-2">
                          {move.accuracy ? `${move.accuracy}%` : "-"}
                        </div>
                        <div className="col-span-2">{move.pp}</div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500">
                    Tidak ada data gerakan yang tersedia
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
