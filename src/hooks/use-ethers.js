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
  const [amountEarned, setAmountEarned] = useState(0);

  const connectToMetaMask = async () => {
    await wcProvider.enable();
    const web3Provider = new ethers.providers.Web3Provider(wcProvider);

    const signer = web3Provider.getSigner(wcProvider.accounts[0]);

    const fContract = new ethers.Contract(
      "0x44F959039F49b730c63f240ab011bd7aa96f464b",
      DeCloudFiles.abi,
      signer
    );

    window.api.send("account-number", wcProvider.accounts[0]);
    setAccountNumber(wcProvider.accounts[0]);
    setContract(fContract);

    setAmountEarned(await fContract.getAmount());
  };

  const refreshAmountEarned = useCallback(async () => {
    setAccountNumber(await contract.getAmount());
  }, [contract]);

  return {
    connectToMetaMask,
    accountNumber,
    amountEarned,
    refreshAmountEarned,
  };
};

export default useEthers;
