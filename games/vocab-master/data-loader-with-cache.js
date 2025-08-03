export async function loadAllWordData(onProgress, forceRefresh = false) {
  const cacheKey = 'allWordData';
  const cached = localStorage.getItem(cacheKey);

  if (cached && !forceRefresh) {
    return JSON.parse(cached);
  }

  const dataFolder = 'resources/';
  const dataPrefix = 'data-';
  const dataSuffix = '.json';

  const response = await fetch(`${dataFolder}index.json`);
  const fileList = await response.json();

  const filesToLoad = fileList.filter(file => file.startsWith(dataPrefix) && file.endsWith(dataSuffix));
  const totalFiles = filesToLoad.length;

  const allWords = [];
  let loadedFiles = 0;

  for (const file of filesToLoad) {
    const res = await fetch(`${dataFolder}${file}`);
    const data = await res.json();
    allWords.push(...(data.words || []));

    loadedFiles++;
    if (onProgress) {
      onProgress(loadedFiles / totalFiles);
    }
  }

  const sortedWords = allWords.sort((a, b) => a.word.localeCompare(b.word));
  localStorage.setItem(cacheKey, JSON.stringify(sortedWords)); // persist cache

  return sortedWords;
}