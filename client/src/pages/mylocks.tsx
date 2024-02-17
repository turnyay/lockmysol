import type { NextPage } from "next";
import Head from "next/head";
import { MylocksView } from "../views";

const Mylocks: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>My Locks</title>
        <meta
          name="description"
          content="My Locks"
        />
      </Head>
      <MylocksView />
    </div>
  );
};

export default Mylocks;
