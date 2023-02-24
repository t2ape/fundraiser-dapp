import React, { useState, useEffect } from "react";
import {Button, styled, TextField} from "@mui/material";
import getWeb3 from "./utils/getWeb3";
import FundraiserFactoryContract from "./contracts/FundraiserFactory.json";

const StyledContainer = styled('container')({
  display: 'flex',
  flexWrap: 'wrap',
});
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
}));
const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const NewFundraiser = () => {
  const { name, setFundraiserName } = useState(null);
  const { url, setFundraiserWebsite } = useState(null);
  const { description, setFundraiserDescription } = useState(null);
  const { imageURL, setImage } = useState(null);
  const { beneficiary, setAddress } = useState(null);
  const { custodian, setCustodian } = useState(null);
  const { contract, setContract } = useState(null);
  const { accounts, setAccounts } = useState(null);

  useEffect(() => {
  }, []);

  const init = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const netWorkId = await web3.eth.getId();
      const deployedNetwork = FundraiserFactoryContract.networks[netWorkId];
      const instance = new web3.eth.Contract(
        FundraiserFactoryContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setContract(instance);
      setAccounts(accounts);
    } catch(error) {
      alert(
        'Failed to load web3, accounts, or contract. Check console for details.',
      );
      console.error(error);
    }
  }

  const handleSubmit = async () => {
    await contract.methods.createFundraiser(
      name,
      url,
      imageURL,
      description,
      beneficiary
    ).send({ from: accounts[0] });
    alert('Successfully created fundraiser');
  }

  return (
    <div className="create-fundraiser-container">
    <h2>Create A New Fundraiser</h2>

    <label>Name</label>
    <StyledTextField id="outlined-bare"
                     placeholder="Fundraiser Name"
                     margin="normal"
                     onChange={(e) => setFundraiserName(e.target.value)}
                     variant="outlined"
                     inputProps={{ 'aria-label': 'bare' }} />

    <label>Website</label>
    <StyledTextField id="outlined-bare"
                     placeholder="Fundraiser Website"
                     margin="normal"
                     onChange={(e) => setFundraiserWebsite(e.target.value)}
                     variant="outlined"
                     inputProps={{ 'aria-label': 'bare' }} />

    <label>Description</label>
    <StyledTextField id="outlined-bare"
                     placeholder="Fundraiser Description"
                     margin="normal"
                     onChange={(e) => setFundraiserDescription(e.target.value)}
                     variant="outlined"
                     inputProps={{ 'aria-label': 'bare' }} />

    <label>Image</label>
    <StyledTextField id="outlined-bare"
                     placeholder="Fundraiser Image"
                     margin="normal"
                     onChange={(e) => setImage(e.target.value)}
                     variant="outlined"
                     inputProps={{ 'aria-label': 'bare' }} />

    <label>Address</label>
    <StyledTextField id="outlined-bare"
                     placeholder="Fundraiser Ethereum Address"
                     margin="normal"
                     onChange={(e) => setAddress(e.target.value)}
                     variant="outlined"
                     inputProps={{ 'aria-label': 'bare' }} />

    <label>Custodian</label>
    <StyledTextField id="outlined-bare"
                     placeholder="Fundraiser Custodian"
                     margin="normal"
                     onChange={(e) => setCustodian(e.target.value)}
                     variant="outlined"
                     inputProps={{ 'aria-label': 'bare' }} />

    <StyledButton onClick={handleSubmit}
                  variant="contained">
      Submit
    </StyledButton>

    </div>
  );
}

export default NewFundraiser;
