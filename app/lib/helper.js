// Helper functions for the resume builder

/**
 * Converts an array of entries (experience, education, projects) to markdown format
 * @param {Array} entries - Array of entry objects
 * @param {String} sectionTitle - Title for the section (e.g., "Work Experience")
 * @returns {String} Markdown formatted string
 */
export function entriesToMarkdown(entries, sectionTitle) {
  if (!entries || entries.length === 0) return "";

  const entriesMarkdown = entries
    .map((entry) => {
      const dateRange = entry.current
        ? `${entry.startDate} - Present`
        : `${entry.startDate} - ${entry.endDate}`;

      return `### ${entry.title} | ${entry.organization}
*${dateRange}*

${entry.description}`;
    })
    .join("\n\n");

  return `## ${sectionTitle}\n\n${entriesMarkdown}`;
}
