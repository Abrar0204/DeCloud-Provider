import { useState, useCallback } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import DeCloudFiles from "../res/contracts/DeCloudFiles.json";

const wcProvider = new WalletConnectProvider({
  rpc: {
    1337: "http://127.0.0.1:7545",
  },
});

const useEthers = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [contract, setContract] = useState(null);
  const [amountEarned, setAmountEarned] = useState("");

  const connectToMetaMask = async () => {
    await wcProvider.enable();
    const web3Provider = new ethers.providers.Web3Provider(wcProvider);

    const signer = web3Provider.getSigner(wcProvider.accounts[0]);

    const fContract = new ethers.Contract(
      "0x6366565Db65F748450D80159e98756332B115d1D",
      DeCloudFiles.abi,
      signer
    );

    console.log(wcProvider.accounts[0]);

    window.api.send("account-number", wcProvider.accounts[0]);
    setAccountNumber(wcProvider.accounts[0]);
    setContract(fContract);

    setAmountEarned(
      ethers.utils.formatEther(await fContract.getAmount()) + " ethers"
    );
    console.log(ethers.utils.formatEther(await fContract.getAmount()));
  };

  const refreshAmountEarned = useCallback(async () => {
    setAmountEarned(
      ethers.utils.formatEther(await contract.getAmount()) + " ethers"
    );
  }, [contract]);

  const transferAmountToMetamask = useCallback(async () => {
    await contract.getPaid();
  }, [contract]);

  return {
    connectToMetaMask,
    accountNumber,
    amountEarned,
    refreshAmountEarned,
    transferAmountToMetamask,
  };
};

export default useEthers;
