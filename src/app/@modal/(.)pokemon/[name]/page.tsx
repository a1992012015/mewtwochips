import { getClient } from "@/apollo/apollo-server";
import { pokemonQuery } from "@/apollo/client/query";
import { PokemonDetail } from "@/components/pokemon/pokemon-detail";

interface IProps {
  params: Promise<{ name: string }>;
}

export default async function PokemonModal({ params }: Readonly<IProps>) {
  const { name } = await params;

  try {
    const pokemon = await getClient().query({ query: pokemonQuery, variables: { name } });
    return (
      <div className="mx-auto w-[1200px] bg-white">
        <PokemonDetail pokemon={pokemon.data.pokemon} />
      </div>
    );
  } catch (e) {
    console.log(e);
    return <div>没找到</div>;
  }
}
