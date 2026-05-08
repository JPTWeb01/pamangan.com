import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { recipeApi } from "../services/api";

const LIKED_KEY = "pamangan_liked";

function getLiked() {
  try { return JSON.parse(localStorage.getItem(LIKED_KEY) || "[]"); }
  catch { return []; }
}

function toggleStored(id) {
  const liked = getLiked();
  const idx = liked.indexOf(id);
  if (idx === -1) { liked.push(id); }
  else { liked.splice(idx, 1); }
  localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
  return idx === -1;
}

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="stars">
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
    </span>
  );
}

function difficultyClass(d) {
  if (!d) return "";
  const lower = d.toLowerCase();
  if (lower === "easy") return "difficulty-easy";
  if (lower === "hard") return "difficulty-hard";
  return "difficulty-medium";
}

export default function RecipeCard({ recipe }) {
  const [liked, setLiked] = useState(() => getLiked().includes(recipe.id));
  const [likes, setLikes] = useState(recipe.likes || 0);

  const imgSrc =
    recipe.image_url ||
    `https://picsum.photos/seed/${recipe.id}/400/300`;

  const handleLike = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowLiked = toggleStored(recipe.id);
    setLiked(nowLiked);
    setLikes((n) => Math.max(0, n + (nowLiked ? 1 : -1)));
    try {
      const res = await recipeApi.like(recipe.id, nowLiked ? "like" : "unlike");
      if (res?.data?.likes !== undefined) setLikes(res.data.likes);
    } catch {
      toggleStored(recipe.id);
      setLiked(!nowLiked);
      setLikes((n) => Math.max(0, n + (nowLiked ? -1 : 1)));
    }
  }, [recipe.id]);

  return (
    <div className="recipe-card h-100" style={{ position: "relative" }}>
      <Link to={`/recipe/${recipe.id}`} className="text-decoration-none d-flex flex-column h-100">
        <div className="recipe-card-img-wrapper">
          <img
            src={imgSrc}
            alt={recipe.name}
            loading="lazy"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${recipe.id}x/400/300`;
            }}
          />
          {recipe.cuisine && (
            <span className="recipe-card-badge">{recipe.cuisine}</span>
          )}
        </div>

        <div className="recipe-card-body">
          <div className="recipe-card-title">{recipe.name}</div>

          {recipe.description && (
            <p
              className="text-secondary mb-0"
              style={{
                fontSize: ".8rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {recipe.description}
            </p>
          )}

          <div className="recipe-card-meta">
            {recipe.rating > 0 && <Stars rating={recipe.rating} />}

            {recipe.cooking_time && (
              <span>
                <i className="bi bi-clock me-1"></i>
                {recipe.cooking_time}
              </span>
            )}

            {recipe.difficulty && (
              <span className={`difficulty-badge ${difficultyClass(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            )}

            {recipe.servings > 0 && (
              <span>
                <i className="bi bi-people me-1"></i>
                {recipe.servings}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Heart button — outside Link so clicks don't navigate */}
      <button
        className={`recipe-card-like${liked ? " liked" : ""}`}
        onClick={handleLike}
        aria-label={liked ? "Unlike recipe" : "Like recipe"}
      >
        <i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`}></i>
        {likes > 0 && <span>{likes}</span>}
      </button>
    </div>
  );
}
