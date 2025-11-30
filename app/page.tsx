"use client";
import { useRouter } from "next/navigation";
import StepDescription from "./components/StepDescription";

const Home = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/courses");
  };

  return (
    <main className="items-center flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="p-4 w-full">
          <h2 className="font-semibold">Hva skjer nå?</h2>
          <p className="mt-2">
            Følg trinnene for å sette opp timeplanen. Du kan hoppe over valg av
            studieretning om ønskelig.
          </p>
          <button
            onClick={handleGetStarted}
            className="cursor-pointer mt-8 inline-block px-8 py-2 font-fruncy-sage text-3xl font-bold bg-burnt-peach text-bright-white rounded-full hover:bg-dark-coral transition hover:bg-terracotta-clay"
          >
            {"Kom i gang"}
          </button>
        </div>
        <div className="p-4 rounded-lg bg-powder-petal">
          <ol className="space-y-16">
            <StepDescription
              number="1"
              title="Velg semester"
              description="Velg semesteret du ønsker å se fag for."
            />

            <StepDescription
              number="2"
              title="Velg fag & lag kalender"
              description="Søk etter og velg fag du ønsker å inkludere i kalenderen din."
            />

            <StepDescription
              number="3"
              title="Se kalender"
              description="Se og rediger kalenderen basert på valgte fag."
            />
          </ol>
        </div>
      </div>
    </main>
  );
};

export default Home;
