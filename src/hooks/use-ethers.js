import { useState, useCallback, useMemo } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import DeCloudFiles from "../res/contracts/DeCloudFiles.json";

const wcProvider = new WalletConnectProvider({
  rpc: {
    1337: "http://192.168.1.28:7545",
  },
});

const ETH_TO_INR = 265629.35;

const getObjFromEther = (etherEarned) => {
  const ether = parseFloat(etherEarned, 10);
  return {
    inr: ether * ETH_TO_INR,
    ether: ether,
  };
};

const useEthers = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [contract, setContract] = useState(null);
  const [amountsEarned, setAmountsEarned] = useState([]);

  const disconnect = async () => {
    await wcProvider.disconnect();
    setAccountNumber("");
  };

  const totalAmount = useMemo(() => {
    let totEth = 0;

    amountsEarned.forEach((item) => (totEth = item.amount.ether));

    return {
      ether: totEth,
      inr: totEth * ETH_TO_INR,
    };
  }, [amountsEarned]);

  const connectToMetaMask = async () => {
    await wcProvider.enable();
    const web3Provider = new ethers.providers.Web3Provider(wcProvider);

    const signer = web3Provider.getSigner(wcProvider.accounts[0]);

    const fContract = new ethers.Contract(
      "0x220d6A0867a4304a32918A02Ae8EA0ab32f09aD0",
      DeCloudFiles.abi,
      signer
    );

    console.log(wcProvider.accounts[0]);

    window.api.send("account-number", wcProvider.accounts[0]);
    setAccountNumber(wcProvider.accounts[0]);
    setContract(fContract);

    await refreshAmountEarned(fContract);
  };

  const refreshAmountEarned = useCallback(
    async (cotractFromP = null) => {
      try {
        let con = cotractFromP;
        if (!con) {
          con = contract;
        }
        const length = await con.getNoOfPaidAmount();
        const newAmounts = [];
        for (let i = 0; i < length; i++) {
          const obj = await con.getAmount(i);
          const etherEarned = ethers.utils.formatEther(obj[0]);

          newAmounts.push({
            amount: getObjFromEther(etherEarned),
            date: obj[1].toNumber(),
            isPaid: obj[2],
          });
        }
        console.log(newAmounts);
        setAmountsEarned(newAmounts.reverse());
      } catch (err) {
        console.log(err);
      }
    },
    [contract]
  );

  const transferAmountToMetamask = useCallback(
    async (position) => {
      try {
        await contract.getPaid(position);
        setAmountsEarned((prev) =>
          prev.map((item, idx) => {
            if (idx !== position) {
              return item;
            }

            return {
              ...item,
              isPaid: true,
            };
          })
        );
      } catch (err) {
        console.error(err);
      }
    },
    [contract]
  );

  return {
    connectToMetaMask,
    accountNumber,
    amountsEarned,
    refreshAmountEarned,
    totalAmount,
    transferAmountToMetamask,
    disconnect,
  };
};

export default useEthers;
