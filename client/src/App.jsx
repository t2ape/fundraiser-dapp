import React, { useState, useEffect } from "react";
import getWeb3 from "./utils/getWeb3";

import FundraiserFactoryContract from "./contracts/FundraiserFactory.json";

import { Routes, Route, NavLink } from "react-router-dom";
import { styled, AppBar, Toolbar, Typography } from "@mui/material";

import NewFundraiser from './NewFundraiser';
import Home from './Home';

const StyledDiv = styled('div')({
  flexGrow: 1,
})

const App = () => {
  const [state, setState] = useState({ web3: null, accounts: null, contract: null });

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
        setState({web3, accounts, contract: instance});
      } catch(error) {
        alert(
          'App.jsx: Failed to load web3, accounts, or contract. Check console for details.',
        );
        console.error(error);
      }
    }
    init();
  }, []);

  return (
    <StyledDiv>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            <NavLink className="nav-link" to="/">Home</NavLink>
          </Typography>
          <NavLink className="nav-link" to="/new/">New</NavLink>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new/" element={<NewFundraiser />} />
      </Routes>
    </StyledDiv>
  );
}

export default App;
