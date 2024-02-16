// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IDL } from "../../idl/lockmysol";
import LockmysolProgram from "../../LockmysolProgram.js";

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MuiInput from '@mui/material/Input';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';

import Button from '@mui/material/Button';

const Input = styled(MuiInput)`
  width: 42px;
`;

import { notify } from "../../utils/notifications";

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import { ColorSwatchIcon } from '@heroicons/react/outline';

const maxDays = 365;
const programId = new anchor.web3.PublicKey("5b6JMVrHatTdGFnHtKb2iuBquDmspYsPq1HLKifS8QHA");

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  // Params
  const [amount, setAmount] = React.useState('');
  const [durationPercent, setDurationPercent] = React.useState(50);
  const [duration, setDuration] = React.useState(Math.floor(maxDays / 2));

  const handleSliderChange = (event: Event, newDuration: number) => {
    let daysAmount = Math.floor(newDuration * maxDays / 100);
    setDurationPercent(newDuration as number);
    setDuration(daysAmount);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (duration < 0) {
      setDuration(0);
    } else if (duration > 365) {
      setDuration(365);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleAmountBlur = () => {
    const amountString = String(amount); // Convert amount to a string
    if (amountString.includes(".")) {
      setAmount(amount);
    } else {
      setAmount(Number(amount));
    }
  };

  const handleLockButtonClick  = async () => {
    console.log(`Locking ${amount} SOLANA for ${duration} days`);

    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        {
            commitment: "recent",
            preflightCommitment: "recent",
            skipPreflight: true,
        }
    );
    // const program = anchor.workspace.Lockmysol as Program<Lockmysol>;   <anchor.Idl>
    const program = new Program(IDL, programId, provider);

    const lockmysol = new LockmysolProgram({
      provider: provider,
      programId: programId,
      program: program,
    });

    // Get airdrop for txs
    provider.connection.requestAirdrop(provider.wallet.publicKey, 10000000000);

    const durationSeconds = duration * 24 * 60 * 60;
    const amountBase = Number(amount) * 1000000000;

    console.log('LOCKING ' + amountBase + ' LAMPORTS FOR ' + durationSeconds + ' SECONDS');

    try {
      // saved user
      const userAccount = await lockmysol.getUserAccount();
      const savedId = userAccount.lockSolIdCount.toNumber();
      console.log("saved ID: ", savedId);
      const result = await lockmysol.lockSolForTime(savedId, amountBase, durationSeconds)
      if (result) {
        notify({ type: 'success', message: 'Transaction successful!' });
      } else {
        notify({ type: 'error', message: 'Transaction error!' });
      }
    } catch (e) {
      // new user
      const result = await lockmysol.createUserAccount();
      if (result) {
        notify({ type: 'success', message: 'Transaction successful!' });
      } else {
        notify({ type: 'error', message: 'Transaction error!' });
      }  
      const result2 = await lockmysol.lockSolForTime(1, amountBase, durationSeconds);
      if (result2) {
        notify({ type: 'success', message: 'Transaction successful!' });
      } else {
        notify({ type: 'error', message: 'Transaction error!' });
      }
    }
  };

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className='mt-6'>
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
          Lock Solana
        </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
          <p>Lock your Solana tokens in escrow for a specified amount of time.</p>
          <p className='text-slate-500 text-2x1 leading-relaxed'>Don't sell your SOL, lock it!</p>
        </h4>
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
        </div>
        <Box sx={{ width: 600 }}>
          <Typography id="input-text" gutterBottom>
            Amount (in SOL):
          </Typography>
          <Input
                value={amount}
                size="medium"
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                inputProps={{
                  min: 0,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                  sx: { color: 'white' }
                }}
                sx={{ bgcolor: '#31125d66', width: 100  }}
              />
          <Typography id="input-slider" gutterBottom>
            Lock Duration (in DAYS):
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={typeof durationPercent === 'number' ? durationPercent : 0}
                onChange={handleSliderChange}
                aria-labelledby="input-slider"
                step={0.01}
                min={(1 / maxDays * 100)}
              />
            </Grid>
            <Grid item>
              <Input
                value={duration}
                size="small"
                onChange={handleInputChange}
                onBlur={handleBlur}
                inputProps={{
                  step: 10,
                  min: 0,
                  max: 100,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                  sx: { color: 'white' }
                }}
                sx={{ bgcolor: '#31125d66' }}
              />
            </Grid>
          </Grid>
        </Box>
        <Button variant="contained" onClick={handleLockButtonClick}>LOCK {amount} SOLANA FOR {duration} DAYS</Button>
      </div>
    </div>
  );
};
