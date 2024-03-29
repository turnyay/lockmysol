import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Lock Solana</title>
        <meta
          name="description"
          content="Lock Solana"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
