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
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';

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
import { initialize } from 'next/dist/server/lib/render-server';

const maxDays = 365;
const programId = new anchor.web3.PublicKey("5b6JMVrHatTdGFnHtKb2iuBquDmspYsPq1HLKifS8QHA");

export const MylocksView: FC = ({ }) => {
  const wallet = useWallet();
  const [initialized, setInitialized] = React.useState(false);
  const { connection } = useConnection();
  const [lockAccounts, setLockAccounts] = useState([]);

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    const fetchData = async () => {
      if (wallet.publicKey && !initialized) {
        setInitialized(true);
        
        console.log(wallet.publicKey.toBase58())
        getUserSOLBalance(wallet.publicKey, connection)

        const provider = new anchor.AnchorProvider(
            connection,
            wallet,
            {
                commitment: "recent",
                preflightCommitment: "recent",
                skipPreflight: true,
            }
        );
        const program = new Program(IDL, programId, provider);

        const lockmysol = new LockmysolProgram({
          provider: provider,
          programId: programId,
          program: program,
        });

        try {
          const userAccount = await lockmysol.getUserAccount();
          console.log(userAccount);
          const lockCount = userAccount.lockSolIdCount.toNumber();
          if (lockCount > 1) {
            let lockAccountsData = [];
            for (var i = 1; i < lockCount; i++) {
              let lockAccountPda = await lockmysol.getLockAccountPda(i);
              console.log("LOCK ACCOUNT NUMBER " + i);
              const lockAccount = await program.account.lockAccountSol.fetch(lockAccountPda);
              console.log("Lock Owner: ", lockAccount.owner.toBase58());
              console.log("Lock amount base units: ", lockAccount.amount.toString());
              console.log("Lock state: ", lockAccount.state);
              console.log("Lock until: ", lockAccount.unlockTime.toString());
              const diff = parseInt(lockAccount.unlockTime.toString()) - Math.floor(Date.now() / 1000);
              console.log("Unlocking in ", diff, " seconds!");
              lockAccountsData.push({
                lockNumber: i,
                owner: lockAccount.owner.toBase58(),
                amount: lockAccount.amount.toString(),
                state: lockAccount.state,
                unlockTime: lockAccount.unlockTime.toString(),
                unlockingIn: diff,
              });
            }
            setLockAccounts(lockAccountsData);
          }
        } catch (e) {
          console.log(e)
        }
      }
    };
    fetchData();
  }, [wallet.publicKey, connection, getUserSOLBalance, setInitialized])

  const handleUnlockButtonClick  = async (lockNumber) => {
    console.log(`Unlocking SOLANA for lock ID: `, lockNumber);

    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        {
            commitment: "recent",
            preflightCommitment: "recent",
            skipPreflight: true,
        }
    );
    const program = new Program(IDL, programId, provider);

    const lockmysol = new LockmysolProgram({
      provider: provider,
      programId: programId,
      program: program,
    });

    try {
      const result = await lockmysol.unlockSol(lockNumber);
      if (result) {
        notify({ type: 'success', message: 'Transaction successful!' });
      } else {
        notify({ type: 'error', message: 'Transaction error!' });
      }
    } catch (e) {
      
    }
  };

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">
          My Locks
        </h1>
        <TableContainer sx={{ borderColor: 'white' }}>
          <Table sx={{ color: 'white' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Lock Number</TableCell>
                <TableCell sx={{ color: 'white' }}>Asset</TableCell>
                <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                <TableCell sx={{ color: 'white' }}>State</TableCell>
                <TableCell sx={{ color: 'white' }}>Unlock Time</TableCell>
                <TableCell sx={{ color: 'white' }}>Unlocking In</TableCell>
                <TableCell sx={{ color: 'white' }}>Unlock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lockAccounts.map((lockAccount) => (
                <TableRow key={lockAccount.lockNumber}>
                  <TableCell sx={{ color: 'white' }}>{lockAccount.lockNumber}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{"SOL"}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{lockAccount.amount / 1000000000}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{lockAccount.state == 1 ? "Locked" : "Complete"}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{lockAccount.unlockTime}</TableCell>
                  <TableCell sx={{ color: 'white' }}>{lockAccount.unlockingIn} seconds</TableCell>
                  <TableCell sx={{ color: 'white' }}>
                    {lockAccount.state == 1 ? 
                      <Button variant="contained" onClick={() => handleUnlockButtonClick(lockAccount.lockNumber)}>UNLOCK</Button>
                      : 
                      "Unlocked"
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default MylocksView;