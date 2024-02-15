import type { NextPage } from "next";
import Head from "next/head";
import { MylocksView } from "../views";

const Mylocks: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Scaffold</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <MylocksView />
    </div>
  );
};

export default Mylocks;
