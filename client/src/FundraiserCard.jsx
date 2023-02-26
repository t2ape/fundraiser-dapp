import React, { useEffect, useState } from "react";
import getWeb3 from "./utils/getWeb3";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl} from "@mui/material";

import FundraiserContract from "./contracts/Fundraiser.json";

import {styled, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography} from "@mui/material";

const StyledCard = styled(Card)({
  maxWidth: 450,
  height: 400,
})

const StyledCardMedia = styled(CardMedia)({
  height: 140,
})

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledInput = styled('input')({
  display: 'none',
})

const StyledContainer = styled('container')({
  display: 'flex',
  flexWrap: 'wrap',
})

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  display: 'table-cell',
}));

const StyledPaper = styled('paper')(({ theme }) => ({
  position: 'absolute',
  width: 400,
  backgroundColor: theme.palette.background.paper,
  border: 'none',
  boxShadow: 'none',
  padding: 4,
}));

const FundraiserCard = (props) => {
  const [ web3, setWeb3 ] = useState(null);
  const [ contract, setContract ] = useState(null);
  const [ accounts, setAccounts ] = useState(null);
  const [ fundName, setFundName ] = useState(null);
  const [ description, setDescription ] = useState(null);
  const [ totalDonations, setTotalDonations ] = useState(null);
  const [ donationCount, setDonationCounts ] = useState(null);
  const [ imageURL, setImageURL ] = useState(null);
  const [ url, setURL ] = useState(null);
  const { fundraiser } = props;
  const [ open, setOpen ] = useState(false);
  const [ donationAmount, setDonationAmount ] = useState(0);

  useEffect(() => {
    if(fundraiser) {
      const init = async (fundraiser) => {
        try {
          const fund = fundraiser;
          const web3 = await getWeb3();
          const accounts = await web3.eth.getAccounts();
          const netWorkId = await web3.eth.net.getId();
          const deployedNetwork = FundraiserContract.networks[netWorkId];
          const instance = new web3.eth.Contract(
            FundraiserContract.abi,
            fund,
          );
          setWeb3(web3);
          setContract(instance);
          setAccounts(accounts);

          const name = await instance.methods.name().call();
          const description = await instance.methods.description().call();
          const totalDonations = await instance.methods.totalDonations().call();
          const imageURL = await instance.methods.imageURL().call();
          const url = await instance.methods.url().call();

          setFundName(name);
          setDescription(description);
          setImageURL(imageURL);
          setTotalDonations(totalDonations);
          setURL(url);
        } catch(error) {
          alert(
            'Failed to load web3, accounts, or contract. Check console for details.',
          );
          console.error(error);
        }
      }
      init(fundraiser);
    }
  }, [fundraiser]);

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const submitFunds = async () => {
    const donation = web3.utils.toWei(donationAmount);

    await contract.methods.donate().send({
      from: accounts[0],
      value: donation,
      gas: 650000
    });
    setOpen(false);
  }

  return (
    <div className="fundraiser-card-content">
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          Donate to {fundName}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="span">
            <img src={imageURL} width='200px' height='130px' />
            <p>{description}</p>
          </DialogContentText>
          <StyledFormControl>
            $
            <input id="component-simple"
                   value={donationAmount}
                   onChange={(e) => setDonationAmount(e.target.value)}
                   placeholder="0.00" />
          </StyledFormControl>
          <p></p>
          <Button onClick={submitFunds} variant="contained" color="primary">
            Donate
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <StyledCard onClick={handleOpen}>
        <CardActionArea>
          {imageURL ?
            (<StyledCardMedia image={imageURL} title="Fundraiser Image" />) :
            (<></>)
          }
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {fundName}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="span">
              <p>{description}</p>
              <p>Total Donations: ${totalDonations}</p>
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <StyledButton onClick={handleOpen} variant="contained">
            View More
          </StyledButton>
        </CardActions>
      </StyledCard>
    </div>
  )
}

export default FundraiserCard;
