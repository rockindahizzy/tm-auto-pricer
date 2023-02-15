import React, {useEffect, useState} from 'react';
import { getShopItems } from './market-utils';
import { searchItem } from './ItemWorker';
import './App.css';
import {getItemNameFromUrl} from './utils';

const App = () => {
  const priceMarginStore = localStorage.getItem('PRICE_MARGIN');
  const [runPricer, setRunPricer] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [itemsRetrieved, setItemsRetrieved] = useState(false);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [fairyQuestPending, setFairyQuestPending] = useState(false);
  const [priceMargin, setPriceMargin] = useState(parseInt(priceMarginStore) || null);
  const [priceMarginUnit, setPriceMarginUnit] = useState('NP');

  localStorage.setItem('MESSAGE', 'This is super secret');
  useEffect(() => {
    const items = getShopItems();
    setShopItems(items);
    setItemsRetrieved(items.length > 0);
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(async () => {
    if(runPricer) {
      setTotalCompleted(0);
      for(let i = 0; i < shopItems.length; i++) {
        await _searchItem(i);
      }
      updateItems();
    }
  }, [runPricer]);
  /* eslint-enable */

  const _searchItem = async (i) => {
    try {
      const price = await searchItem(shopItems[i]);
      const newItems = [...shopItems];
      newItems[i].lowPrice = price;
      setShopItems(newItems);
      setTotalCompleted((prev) => prev + 1);
    } catch (e) {
      if (e.message.toLowerCase().includes('fairy')) {
        setFairyQuestPending(true);
      }
    }
  };

  const getUpdatedPrice = (lowPrice) => {
    switch (priceMarginUnit) {
    case 'PERCENT':
      const val = lowPrice - (lowPrice * (priceMargin/100.00));
      return Math.round(val < 0 ? 1 : val);
    case 'NP':
    default:
      return (lowPrice - priceMargin) < 0 ? 1 : (lowPrice - priceMargin);
    }
  };

  const updateItems = () => {
    console.log(shopItems);
    shopItems.forEach((item) => {
      console.log('Updating Item', { ...item, updateItem: item.currentPrice > item.lowPrice });
      if(item.currentPrice === 0 || item.currentPrice > item.lowPrice) {
        const priceSetTo = getUpdatedPrice(item.lowPrice);
        console.log(`Updating price for ${getItemNameFromUrl(item.url)}`, {currentPrice: item.currentPrice, lowPrice: item.lowPrice, priceSetTo, priceMargin, priceMarginUnit});
        item.input.value = priceSetTo;
        if(!document.getElementById(`prevPriceContainer${getItemNameFromUrl(item.url)}`)) {
          const newDiv = document.createElement('div');
          newDiv.innerHTML = `<p id="prevPriceContainer${getItemNameFromUrl(item.url)}">(Previous Price: ${item.currentPrice})</p>`;
          item.input.parentElement.appendChild(newDiv);
          item.input.parentElement.style.flexDirection = 'column';
        }
      }
    });
    setRunPricer(false);
  };

  return (
    <div className="App">
      <h2>Auto Pricer</h2>
      {itemsRetrieved && (
        <>
          Beat the lowest price by:
          <form
            style={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              setRunPricer(true);
            }}>
            <div style={styles.formGroup}>
              <input
                type="number"
                value={priceMargin}
                placeholder="Enter Whole Number"
                onChange={(e) => {
                  setPriceMargin(parseInt(e.target.value));
                  localStorage.setItem('PRICE_MARGIN', e.target.value);
                }}
              />
              <select
                value={priceMarginUnit}
                onChange={(e) => setPriceMarginUnit(e.target.value)}
                placeholder="Select Units"
              >
                <option value="NP">NP</option>
                <option value="PERCENT">%</option>
              </select>
            </div>
            <input type="submit" value="Run Auto Pricer" style={{ width: '50%'}}/>
          </form>
          { runPricer && (
            <progress value={totalCompleted / shopItems.length}/>
          )}
          { !runPricer && totalCompleted > 0 && (
            <h4>Done!</h4>
          )}
        </>
      )}
      {fairyQuestPending && (
        <p>
            A fairy quest is pending, currently cannot run quests 😬
        </p>
      )}
    </div>
  );
};


const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formGroup: {
    display: 'block',
  },
};

export default App;
