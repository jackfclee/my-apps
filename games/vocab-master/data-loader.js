export async function loadAllWordData() {
  const dataFolder = 'resources/';
  const dataPrefix = 'data-';
  const dataSuffix = '.json';

  const response = await fetch(`${dataFolder}index.json`);
  const fileList = await response.json();

  const allWords = [];

  for (const file of fileList) {
    if (file.startsWith(dataPrefix) && file.endsWith(dataSuffix)) {
      const res = await fetch(`${dataFolder}${file}`);
      const data = await res.json();
      allWords.push(...(data.words || []));
    }
  }

  return allWords;
}