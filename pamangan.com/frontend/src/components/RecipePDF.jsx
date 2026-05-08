import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const BLUE = "#0038A8";
const LIGHT_BLUE = "#e8edf8";
const YELLOW = "#FCD116";

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    backgroundColor: "#ffffff",
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    marginBottom: 20,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BLUE },
  brandSub: { fontSize: 8, color: "#9ca3af", marginTop: 2 },
  badgeRow: { flexDirection: "row" },
  badge: {
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 4,
  },
  badgeText: { fontSize: 8, color: "#ffffff", fontFamily: "Helvetica-Bold" },
  badgeYellow: { backgroundColor: YELLOW },
  badgeYellowText: { color: "#111827" },

  /* Title */
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  description: { fontSize: 10, color: "#6b7280", lineHeight: 1.5, marginBottom: 14 },

  /* Stats */
  statsBox: {
    flexDirection: "row",
    backgroundColor: LIGHT_BLUE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE },
  statLabel: { fontSize: 7, color: "#6b7280", marginTop: 2 },

  /* Section heading */
  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 8,
    marginTop: 18,
  },

  /* Ingredients */
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 0.75,
    borderColor: "#9ca3af",
    borderRadius: 2,
    marginRight: 8,
  },
  ingredientName: { flex: 1, fontSize: 10 },
  ingredientQty: { fontSize: 10, color: "#6b7280", fontFamily: "Helvetica-Bold" },

  /* Instructions */
  stepRow: { flexDirection: "row", marginBottom: 8, alignItems: "flex-start" },
  stepBubble: {
    width: 20,
    height: 20,
    backgroundColor: BLUE,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },
  stepNum: { color: "#ffffff", fontSize: 9, fontFamily: "Helvetica-Bold" },
  stepText: { flex: 1, fontSize: 10, lineHeight: 1.5, paddingTop: 3 },

  /* Substitutions */
  tipBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    padding: 10,
    marginTop: 16,
  },
  tipTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#92400e", marginBottom: 4 },
  tipItem: { fontSize: 9, color: "#92400e", lineHeight: 1.5, marginBottom: 2 },

  /* Tags */
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  tag: {
    backgroundColor: LIGHT_BLUE,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: { fontSize: 8, color: BLUE },

  /* Footer */
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
});

export function RecipePDFDocument({ recipe }) {
  const stats = [
    recipe.cooking_time && { label: "Cook Time", value: recipe.cooking_time },
    recipe.prep_time && { label: "Prep Time", value: recipe.prep_time },
    recipe.servings && { label: "Servings", value: String(recipe.servings) },
    recipe.difficulty && { label: "Difficulty", value: recipe.difficulty },
    recipe.cuisine && { label: "Cuisine", value: recipe.cuisine },
  ].filter(Boolean);

  const difficultyColor =
    recipe.difficulty === "Easy" ? "#16a34a" :
    recipe.difficulty === "Hard" ? "#dc2626" : "#d97706";

  return (
    <Document title={recipe.name} author="Pamangan">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Pamangan</Text>
            <Text style={s.brandSub}>pamangan.com</Text>
          </View>
          <View style={s.badgeRow}>
            {recipe.cuisine && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{recipe.cuisine}</Text>
              </View>
            )}
            {recipe.difficulty && (
              <View style={[s.badge, { backgroundColor: difficultyColor }]}>
                <Text style={s.badgeText}>{recipe.difficulty}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={s.title}>{recipe.name}</Text>
        {recipe.description ? <Text style={s.description}>{recipe.description}</Text> : null}

        {/* Stats */}
        {stats.length > 0 && (
          <View style={s.statsBox}>
            {stats.map((stat) => (
              <View key={stat.label} style={s.statItem}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <View>
            <Text style={s.sectionHeading}>Ingredients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={s.ingredientRow}>
                <View style={s.checkbox} />
                <Text style={s.ingredientName}>
                  {ing.item}{ing.notes ? ` (${ing.notes})` : ""}
                </Text>
                {ing.quantity ? <Text style={s.ingredientQty}>{ing.quantity}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        {recipe.instructions?.length > 0 && (
          <View>
            <Text style={s.sectionHeading}>Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepBubble}>
                  <Text style={s.stepNum}>{i + 1}</Text>
                </View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Substitutions */}
        {recipe.substitutions?.length > 0 && (
          <View style={s.tipBox}>
            <Text style={s.tipTitle}>Substitution Tips</Text>
            {recipe.substitutions.map((tip, i) => (
              <Text key={i} style={s.tipItem}>• {tip}</Text>
            ))}
          </View>
        )}

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <View style={s.tagsRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={s.footer}>Generated by Pamangan — pamangan.com</Text>
      </Page>
    </Document>
  );
}
