"use client";

import { Button } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import {
  CAMPAIGN_FACTORY_ABI,
  CAMPAIGN_FACTORY_ADDRESS,
} from "../../config/abi";
import { parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { waitForTransactionReceipt } from "viem/actions";

export default function CreateCampaignPage() {
  const [campaignName, setCampaignName] = useState<string>("");
  const [campaignDescription, setCampaignDescription] = useState<string>("");
  const [campaignFlowrate, setCampaignFlowrate] = useState<number>(1);
  const [campaignGithub, setCampaignGithub] = useState<string>("");
  const [campaignTwitter, setCampaignTwitter] = useState<string>("");
  const [campaignFarcaster, setCampaignFarcaster] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const createCampaign = async () => {
    console.log({ walletClient });
    if (!address || !walletClient) return;

    setErrorMessage(null); // Reset error message
    console.log(chainId);
    if (chainId !== sepolia.id) {
      await switchChainAsync({ chainId: sepolia.id });
    }

    const campaignMetadata = JSON.stringify({
      name: campaignName,
      description: campaignDescription,
      github: campaignGithub,
      twitter: campaignTwitter,
      farcaster: campaignFarcaster,
    });
    console.log("abi", CAMPAIGN_FACTORY_ABI);
    console.log("address", CAMPAIGN_FACTORY_ADDRESS);
    console.log("args", [address, campaignMetadata]);

    // Send transaction to blockchain
    const txHash = await walletClient?.writeContract({
      abi: CAMPAIGN_FACTORY_ABI,
      functionName: "createCp",
      address: CAMPAIGN_FACTORY_ADDRESS,
      args: [address, campaignMetadata],
    });
    console.log("Tx Hash", txHash);

    const txReceipt = await publicClient?.waitForTransactionReceipt({
      hash: txHash,
    });

    console.log("Tx Receipt", txReceipt);
  };

  return (
    <section className="flex flex-col space-y-4 items-center">
      <h1 className="text-xl font-bold">Create campaign</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <Input
        isRequired
        type="text"
        label="Campaign Name"
        className="max-w-xs"
        value={campaignName}
        onValueChange={(value) => setCampaignName(value)}
      />
      <Textarea
        isRequired
        label="Campaign Description"
        value={campaignDescription}
        onValueChange={(value) => setCampaignDescription(value)}
        className="max-w-xs"
      />
      <Input
        isRequired
        type="number"
        label="Flowrate"
        value={campaignFlowrate.toString()}
        onValueChange={(value) => setCampaignFlowrate(Number(value))}
        className="max-w-xs"
      />
      <Input
        type="text"
        label="GitHub"
        value={campaignGithub}
        onValueChange={(value) => setCampaignGithub(value)}
        className="max-w-xs"
      />
      <Input
        type="text"
        label="Twitter"
        value={campaignTwitter}
        onValueChange={(value) => setCampaignTwitter(value)}
        className="max-w-xs"
      />
      <Input
        type="text"
        label="Farcaster"
        value={campaignFarcaster}
        onValueChange={(value) => setCampaignFarcaster(value)}
        className="max-w-xs"
      />

      <Button
        onClick={() => createCampaign()}
        color="primary"
        className="max-w-xs w-full"
        disabled={!address}
      >
        Create Campaign
      </Button>
    </section>
  );
}
