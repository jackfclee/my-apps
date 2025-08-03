export async function loadAllWordData(onProgress, forceRefresh = false) {
  const cacheKey = 'VocabMaster_allWordDataRaw';
  const expiryKey = 'VocabMaster_allWordDataExpiry';
  const cached = localStorage.getItem(cacheKey);
  const expiry = localStorage.getItem(expiryKey);

  const now = Date.now();
  const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

  // Check cache expiry and forceRefresh flag
  if (cached && expiry && now < parseInt(expiry, 10) && !forceRefresh) {
    return JSON.parse(cached);
  }

  // fetch fresh data
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

  // Save data and set expiry for 1 month from now
  localStorage.setItem(cacheKey, JSON.stringify(sortedWords));
  localStorage.setItem(expiryKey, now + oneMonth);

  return sortedWords;
}