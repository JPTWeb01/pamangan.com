import React from "react";
import { Link } from "react-router-dom";

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
  const imgSrc =
    recipe.image_url ||
    `https://picsum.photos/seed/${recipe.id}/400/300`;

  return (
    <div className="recipe-card h-100">
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
          {recipe.source === "ai" && (
            <span
              className="ai-badge position-absolute"
              style={{ bottom: 10, right: 10 }}
            >
              <i className="bi bi-stars"></i> AI
            </span>
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
    </div>
  );
}
