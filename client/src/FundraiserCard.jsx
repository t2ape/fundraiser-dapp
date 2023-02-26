import React, { useEffect, useState } from "react";
import getWeb3 from "./utils/getWeb3";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl, Input,
} from "@mui/material";
import {Link} from "react-router-dom";

import FundraiserContract from "./contracts/Fundraiser.json";

import {styled, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography} from "@mui/material";

const cc = require('cryptocompare');

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
  const [ exchangeRate, setExchangeRate ] = useState(null);
  const ethAmount = (donationAmount / exchangeRate || 0).toFixed(4);
  const [ userDonations, setUserDonations ] = useState(null);
  const [ isOwner, setIsOwner ] = useState(false);
  const [ beneficiary, setNewBeneficiary ] = useState('');

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

          const exchangeRate = await cc.price('ETH', ['USD']);
          setExchangeRate(exchangeRate.USD);
          const eth = web3.utils.fromWei(totalDonations, 'ether');
          const dollarDonationAmount = exchangeRate.USD * eth;

          setFundName(name);
          setDescription(description);
          setImageURL(imageURL);
          setTotalDonations(dollarDonationAmount);
          setURL(url);

          const userDonations = await instance.methods.myDonations().call({ from: accounts[0] });
          console.log(userDonations);
          setUserDonations(userDonations);

          const isUser = accounts[0];
          const isOwner = await instance.methods.owner().call();
          if (isOwner === isUser) {
            setIsOwner(true);
          }
        } catch(error) {
          alert(
            'Failed to load web3, accounts, or contract. Check console for details.',
          );
          console.error(error);
        }
      }
      init(fundraiser);

      window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
      });
    }
  }, [fundraiser]);

  const handleOpen = () => {
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const submitFunds = async () => {
    const ethTotal = donationAmount / exchangeRate;
    const donation = web3.utils.toWei(ethTotal.toString());

    await contract.methods.donate().send({
      from: accounts[0],
      value: donation,
      gas: 650000
    });
    setOpen(false);
  }

  const renderDonationsList = () => {
    var donations = userDonations;
    if(donations === null) { return null; }

    const totalDonations = donations.values.length;
    let donationList = [];
    var i;
    for (i = 0; i < totalDonations; i++) {
      const ethAmount = web3.utils.fromWei(donations.values[i]);
      const userDonation = exchangeRate * ethAmount;
      const donationDate = donations.dates[i];
      donationList.push({
        donationAmount: userDonation.toFixed(2),
        date: donationDate,
      })
    }
    return donationList.map((donation) => {
      return (
        <div className="donation-list" key={donation}>
          <p>${donation.donationAmount}</p>
          <Button variant="contained" color="primary">
            <Link className="donation-receipt-link"
                  to='/receipts/'
                  state={{ fund: fundName,
                           donation: donation.donationAmount,
                           date: donation.date }}
            >
              Request Receipt
            </Link>
          </Button>
        </div>
      );
    });
  }

  const withdrawalFunds = async () => {
    await contract.methods.withdraw().send({
      from: accounts[0],
    })
    alert('Funds Withdrawn');
    setOpen(false);
  }

  const setBeneficiary = async () => {
    await contract.methods.setBeneficiary(beneficiary).send({
      from: accounts[0],
    });
    alert('Fundraiser Beneficiary Changed');
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
          <p>Eth: {ethAmount}</p>
          <Button onClick={submitFunds} variant="contained" color="primary">
            Donate
          </Button>
          <div>
            <h3>My donations</h3>
            {renderDonationsList()}
          </div>

          { isOwner &&
            <div>
              <StyledFormControl>
                Beneficiary:
                <Input value={beneficiary}
                       onChange={(e) => setNewBeneficiary((e.target.value))}
                       placeholder="Set Beneficiary" />
              </StyledFormControl>

              <Button variant="contained"
                      style={{ marginTop: 30 }}
                      color="primary"
                      onClick={setBeneficiary}>
                Set Beneficiary
              </Button>
            </div>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          { isOwner &&
            <Button variant="contained" color="primary" onClick={withdrawalFunds}>
              Withdrawal
            </Button>
          }
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
