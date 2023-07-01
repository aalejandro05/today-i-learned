/**
 * @prettier
 */

import "./style.css";

import { useEffect, useState } from "react";
import supabase from "./supabase";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(() => true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all") {
          query = query.eq("category", currentCategory);
        }

        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);

        setIsLoading(() => false);

        if (!error) setFacts(facts);
        else alert("There was a problem getting data.");
      }

      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header
        showForm={showForm}
        setShowForm={setShowForm}
      />

      {showForm ? (
        <NewFactForm
          setShowForm={setShowForm}
          setFacts={setFacts}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
        />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {isLoading ? (
          <Loader />
        ) : (
          <FactList
            facts={facts}
            setFacts={setFacts}
          />
        )}
      </main>
    </>
  );
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img
          src="logo.png"
          height="68px"
          width="68"
          alt="Today I Learned logo"
        />

        <h1>Today I Learned!</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm(show => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function NewFactForm({ setShowForm, setFacts, isUploading, setIsUploading }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");

  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault(); // prevents the browser to reload

    // Checks if data is valid. If true, creates a new fact and adds it to initialFacts
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      // Creates a new fact object
      // const newFact = {
      //   id: Math.round(Math.random() * 10000000),
      //   text,
      //   source,
      //   category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      // Renders newFact
      // setFacts(facts => [newFact, ...facts]);

      // Renders newFact
      setIsUploading(() => true);

      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();

      setIsUploading(() => false);

      if (!error) setFacts(facts => [...newFact, ...facts]);
      else alert("There was a problem inserting data.");

      // Resets input fields
      setText("");
      setSource("");
      setCategory("");

      // Closes form
      setShowForm(false);
    }
  }

  function isValidHttpUrl(str) {
    let url;

    try {
      url = new URL(str);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  return (
    <form
      className="fact-form"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={isUploading}
      />

      <span>{200 - textLength}</span>

      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={e => setSource(e.target.value)}
        disabled={isUploading}
      />

      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option
          key=""
          value=""
        >
          Choose category:
        </option>

        {CATEGORIES.map(cat => (
          <option
            key={cat.name}
            value={cat.name}
          >
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>

      <button
        className="btn btn-large"
        disabled={isUploading}
      >
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map(cat => (
          <li
            key={cat.name}
            className="category"
          >
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0)
    return (
      <p className="message">
        No facts with this category yet! Create the first one
      </p>
    );

  return (
    <section>
      <ul className="fact-list">
        {facts.map(fact => (
          <Fact
            key={fact.id}
            fact={fact}
            setFacts={setFacts}
          />
        ))}
      </ul>

      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(() => true);

    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({
        [columnName]: hasVoted ? fact[columnName] - 1 : fact[columnName] + 1,
      })
      .eq("id", fact.id)
      .select();

    setIsUpdating(() => false);

    if (!error) {
      setFacts(facts =>
        facts.map(factToCheck =>
          factToCheck.id === fact.id ? updatedFact[0] : factToCheck
        )
      );

      setHasVoted(hasVoted => !hasVoted);
    }
  }

  return (
    <li className="fact">
      <p>
        {fact.text}

        <a
          className="source"
          href={fact.source}
          target="_blank"
        >
          (Source)
        </a>
      </p>

      {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}

      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find(cat => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>

      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button
          onClick={() => handleVote("votesFalse")}
          disabled={isUpdating}
        >
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
