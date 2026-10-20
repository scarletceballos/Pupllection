import { Link } from "react-router-dom";
import { pluralize } from "./breedData";

export default function AboutPage({ insights }) {
  return (
    <main className="dashboard page-section about-page">
      <span className="eyebrow">ABOUT THE DATA</span>
      <h1>What you're looking at</h1>
      <p className="about-lead">
        Pupllection is built on the Dog CEO API, a free collection of dog breeds and photos. It's a small
        dataset, but it has a surprisingly uneven shape.
      </p>

      <section className="about-block">
        <h2>How the data is organized</h2>
        <p>
          Every dog belongs to a <strong>breed family</strong>. Some families are a single breed on their own
          (a <em>standalone</em> breed). Others are split into <strong>sub-breeds</strong>, so "Hound" is a
          family and each kind of hound inside it is a sub-breed.
        </p>
        {insights && (
          <p>
            Right now the API lists <strong>{insights.familyCount} families</strong> and{" "}
            <strong>{insights.subBreedCount} sub-breeds</strong>. {insights.standaloneCount}{" "}
            {pluralize(insights.standaloneCount, "family has", "families have")} no sub-breeds at all.
          </p>
        )}
      </section>

      <section className="about-block">
        <h2>How to read the charts</h2>
        <ul>
          <li>
            <strong>Where the sub-breeds live</strong> counts sub-breeds per family. Toggle between bars and a
            pie to compare exact counts or overall share. The dashed line marks the average.
          </li>
          <li>
            <strong>How families are built</strong> shows whether families tend to have sub-breeds. Toggle
            between a simple split and a size breakdown that counts how many families have 0, 1, 2, or more
            sub-breeds.
          </li>
        </ul>
      </section>

      <section className="about-block">
        <h2>Good to know</h2>
        <ul>
          <li>
            The groupings are the API's own. They're a handy way to browse, not an official breed registry's
            classification.
          </li>
          <li>
            A family with more sub-breeds isn't necessarily more popular. It only means the API splits it into
            more varieties.
          </li>
          <li>
            The "Photos in the collection" number on each detail page counts photos available in the API for
            that breed, not how common the breed is.
          </li>
        </ul>
      </section>

      <section className="about-block">
        <h2>Where it comes from</h2>
        <p>
          The breed list and every photo come from the{" "}
          <a href="https://dog.ceo/dog-api/" target="_blank" rel="noreferrer">
            Dog CEO API
          </a>
          . The list is requested once when the page loads. Each card then asks for a random photo, and each
          detail page asks for the full photo list for that breed.
        </p>
      </section>

      <Link className="details-link" to="/">
        Explore the gallery
      </Link>
    </main>
  );
}
