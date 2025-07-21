export async function loadAllWordData(onProgress) {
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

  return allWords.sort((a, b) => a.word.localeCompare(b.word));
}