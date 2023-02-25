import React, { useState, useEffect } from "react";
import getWeb3 from "./utils/getWeb3";

import FundraiserFactoryContract from "./contracts/FundraiserFactory.json";

import FundraiserCard from "./FundraiserCard";

const Home = () => {
  const [ contract, setContract ] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ funds, setFunds ] = useState([])

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const netWorkId = await web3.eth.net.getId();
        const deployedNetwork = FundraiserFactoryContract.networks[netWorkId];
        const instance = new web3.eth.Contract(
          FundraiserFactoryContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setContract(instance);
        setAccounts(accounts);

        const funds = await instance.methods.fundraisers(10, 0).call();
        setFunds(funds);
      } catch(error) {
        alert(
          'Failed to load web3, accounts, or contract. Check console for details.',
        )
        console.error(error);
      }
    }
    init();
  }, []);

  const displayFundraisers = () => {
    return funds.map((fundraiser) => {
      return (
        <FundraiserCard
          fundraiser={fundraiser}
          key={fundraiser}
        />
      );
    });
  }

  return (
    <div className="main-container">
      {displayFundraisers()}
    </div>
  );
}

export default Home;
