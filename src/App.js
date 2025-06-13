import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let url = `https://techcrunch.com/wp-json/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`;
        if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        const totalPages = res.headers.get("X-WP-TotalPages");
        setTotalPages(Number(totalPages));
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [perPage, page, debouncedSearch]);

  const getImage = (post) => {
    return (
      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
      "https://via.placeholder.com/300x200?text=No+Image"
    );
  };

  return (
    <div className="container">
      <h1>Fetching wordpress post using React</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={18}>18</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid">
            {posts.map((post) => (
              <div className="card" key={post.id}>
                <img src={getImage(post)} alt="Post" />
                <h3 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                <p dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                <a href={post.link} target="_blank" rel="noopener noreferrer">
                  Read More →
                </a>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
              ◀ Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
