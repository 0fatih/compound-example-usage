import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import { COMPTROLLER, CTOKEN_ABI } from '../contracts';

const toNormal = (number) => {
  return parseFloat(ethers.utils.formatEther(number.toString()));
};

const ComptrollerInfo = () => {
  const [blockchain, setBlockchain] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [marketResults, setMarketResults] = useState(null);

  useEffect(() => {
    if (!window.ethereum) {
      window.alert('Please install metamask!');
      return;
    }

    const getData = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const contract = new ethers.Contract(
        COMPTROLLER.address,
        COMPTROLLER.abi,
        provider
      );

      const allMarkets = await contract.getAllMarkets();
      setBlockchain({ provider, allMarkets, contract });
    };

    getData();
  }, []);

  const getMarketInfo = async () => {
    const marketContract = new ethers.Contract(
      searchValue,
      CTOKEN_ABI,
      blockchain.provider
    );

    const cash = await marketContract.getCash();
    const totalBorrows = await marketContract.totalBorrows();
    const borrowRatePerBlock = await marketContract.borrowRatePerBlock();
    const reserveFactorMantissa = await marketContract.reserveFactorMantissa();
    const totalReserves = await marketContract.totalReserves();
    const supplyRatePerBlock = await marketContract.supplyRatePerBlock();
    const totalSupply = await marketContract.totalSupply();

    setMarketResults({
      cash: toNormal(cash).toFixed(2),
      totalBorrows: toNormal(totalBorrows),
      borrowRatePerBlock: toNormal(borrowRatePerBlock),
      reserveFactorMantissa: toNormal(reserveFactorMantissa),
      totalReserves: toNormal(totalReserves),
      supplyRatePerBlock: toNormal(supplyRatePerBlock),
      totalSupply: toNormal(totalSupply),
    });
  };

  return (
    <div>
      Enter the address:{' '}
      <input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button onClick={getMarketInfo}>Get Market</button>
      <h3>Here are all the markets (aka cTokens)</h3>
      <ul>
        {blockchain &&
          blockchain.allMarkets.map((res) => {
            return (
              <li key={res}>
                {res} look in{' '}
                <a href={'https://etherscan.io/address/' + res}>etherscan</a>
              </li>
            );
          })}
      </ul>
      {marketResults && (
        <div>
          <h3>Selected Market Results:</h3>
          <ul>
            <li>
              Underlying balance owned by this cToken: {marketResults.cash}
            </li>
            <li>
              Amount of underlying currently loaned out by the market:{' '}
              {marketResults.totalBorrows}
            </li>
            <li>
              Current borrow rate per block: {marketResults.borrowRatePerBlock}
            </li>
            <li>
              The portion of borrower interest:{' '}
              {marketResults.reserveFactorMantissa}
            </li>
            <li>Total Reserves: {marketResults.totalReserves}</li>
            <li>Supply Rate: {marketResults.supplyRatePerBlock}</li>
            <li>Total Supply: {marketResults.totalSupply}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComptrollerInfo;
