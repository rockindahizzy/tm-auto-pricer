// noinspection DuplicatedCode

function getMarketItems(domToSearch) {
  const perChunk = 4; // items per chunk

  const inputArray = Array.from(domToSearch.querySelectorAll('.data:not(.sw_mine)'));

  const groupedArray = inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index/perChunk);

    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  return parseInt(groupedArray[0][3].innerText.replace(/[\sNP|,]/g, ''));
}

export const searchItem = async (item) => {
  const html = (await (await fetch(item.url)).text());
  const doc = (new DOMParser()).parseFromString(html, 'text/html');
  if(!!doc.querySelector(`a[href='/faerieland/quests']`)){
    console.log('Error');
    throw Error('Fairy quest is pending');
  }
  let form = doc.querySelector('form[action=\'/market/wizard/\']');
  const searchResultsString = (await (await fetch(form.action, {method: 'post', body: new FormData(form)})).text());
  const searchResultsDom = (new DOMParser()).parseFromString(searchResultsString,'text/html');
  return getMarketItems(searchResultsDom);
};
