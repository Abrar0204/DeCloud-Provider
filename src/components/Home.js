import { Button, Heading } from "@chakra-ui/react";
import React from "react";

const Home = ({ ethers }) => {
  const { amountEarned, transferAmountToMetamask, refreshAmountEarned } =
    ethers;

  return (
    <div>
      <Heading>Amount Earned:{amountEarned}</Heading>
      <Button onClick={transferAmountToMetamask}>Get Paid</Button>
      <Button onClick={refreshAmountEarned}>Refresh</Button>
    </div>
  );
};

export default Home;
