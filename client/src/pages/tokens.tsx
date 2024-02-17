import type { NextPage } from "next";
import Head from "next/head";
import { TokensView } from "../views";

const Tokens: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Lock Tokens</title>
        <meta
          name="description"
          content="Lock Tokens"
        />
      </Head>
      <TokensView />
    </div>
  );
};

export default Tokens;
