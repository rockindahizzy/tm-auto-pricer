// document.querySelectorAll('.data')[(12%6)+((12/6)*7)]

export function getShopItems() {
  const perChunk = 7; // items per chunk

  const inputArray = Array.from(document.querySelectorAll('.data'));

  const groupedArray = inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index/perChunk);

    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);

  console.log({groupedArray});

  return groupedArray.map((group) => {
    return ({
      input: group[4].querySelector('input'),
      url: group[0].querySelector('.searchhelp').children[0].href,
      currentPrice: parseInt(group[4].querySelector('input').value),
    });
  });
}
