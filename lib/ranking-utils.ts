/**
 * Utility functions for ranking category display and styling
 */

export type RankingLevel = "1" | "2" | "3" | "4" | "5" | null;

/**
 * Get the color classes for a ranking category badge
 * @param rankingCategory - The ranking category value
 * @returns Tailwind CSS classes for the badge
 */
export function getRankingBadgeClasses(rankingCategory: RankingLevel): string {
  const baseClasses = "text-xs pointer-events-none";
  
  switch (rankingCategory) {
    case "1":
      return `${baseClasses} bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700`;
    case "2":
      return `${baseClasses} bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700`;
    case "3":
      return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700`;
    case "4":
      return `${baseClasses} bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700`;
    case "5":
      return `${baseClasses} bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700`;
  }
}

/**
 * Get the display text for a ranking category
 * @param rankingCategory - The ranking category value
 * @returns The display text (e.g., "Level 1", "Level 2", etc.)
 */
export function getRankingDisplayText(rankingCategory: RankingLevel): string {
  return rankingCategory ? `Level ${rankingCategory}` : "—";
}

/**
 * Get ranking category information for display
 * @param rankingCategory - The ranking category value
 * @returns Object with display text and color classes
 */
export function getRankingInfo(rankingCategory: RankingLevel) {
  return {
    displayText: getRankingDisplayText(rankingCategory),
    badgeClasses: getRankingBadgeClasses(rankingCategory),
    hasRanking: !!rankingCategory
  };
}
