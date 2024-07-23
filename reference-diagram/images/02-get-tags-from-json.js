// Import the fs module
const fs = require('fs');

function extractUniqueTags(data) {
  const allTags = data.reduce((acc, topic) => {
    const topicTags = topic.references.reduce((innerAcc, reference) => {
      // Convert tags to lowercase to ensure case insensitivity
      const normalizedTags = reference.tags.map(tag => tag.toLowerCase());
      return innerAcc.concat(normalizedTags);
    }, []);
    return acc.concat(topicTags);
  }, []);
  // Remove duplicates and sort the tags alphabetically
  const uniqueTags = Array.from(new Set(allTags)).sort();
  return uniqueTags.sort();
}

// Read the JSON file
fs.readFile('z.json', 'utf-8', (err, fileContents) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  try {
    const jsonData = JSON.parse(fileContents);
    const uniqueTags = extractUniqueTags(jsonData);
    console.log(uniqueTags); // Outputs the sorted unique tags
  } catch (err) {
    console.error('Error parsing JSON:', err);
  }
});
