"use client";
import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { CAMPAIGN_ABI } from "@/config/abi";
import { useState } from "react";
import { shortenAddress } from "@/config/utils";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

export default function CampaignPage({
  params,
}: {
  params: { address: string };
}) {
  const campaignAddress = params.address;
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [flowRate, setFlowrate] = useState<number>(1);

  const donate = async () => {
    const txHash = await walletClient?.writeContract({
      abi: CAMPAIGN_ABI,
      address: campaignAddress as `0x${string}`,
      functionName: "donateViaStream",
      args: [BigInt(flowRate)],
    });

    console.log("donate txHash", txHash);
    if (txHash) {
      const txReceipt = await publicClient?.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("donate txReceipt", txReceipt);
    }
  };
  const withdraw = async () => {};
  return (
    <section className="flex flex-col space-y-4 items-center">
      <h1 className="text-2xl font-bold">
        Campaign{shortenAddress(campaignAddress)}
      </h1>
      {/* insert here the metadata of the campaign */}
      <Input
        isRequired
        type="number"
        label="Donation Flowrate"
        value={flowRate.toString()}
        onValueChange={(value) => setFlowrate(Number(value))}
        className="max-w-xs"
      />
      <Button color="primary" onClick={donate}>
        Donate
      </Button>
    </section>
  );
}
