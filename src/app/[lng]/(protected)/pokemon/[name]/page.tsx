import { getClient } from "@/apollo/apollo-server";
import { pokemonQuery } from "@/apollo/client/query";
import { PageHeader } from "@/components/page-header";
import { PokemonDetail } from "@/components/pokemon/pokemon-detail";

interface IProps {
  params: Promise<{ name: string }>;
}

export default async function PokemonDetailPage({ params }: Readonly<IProps>) {
  const { name } = await params;

  try {
    const pokemon = await getClient().query({ query: pokemonQuery, variables: { name } });
    return (
      <div className="page-content mx-auto">
        <PageHeader pageTitle={pokemon.data.pokemon?.name} backRoute="/pokemon" />

        <PokemonDetail pokemon={pokemon.data.pokemon} />
      </div>
    );
  } catch (e) {
    console.warn("pokemon query error", e);
    return null;
  }
}
