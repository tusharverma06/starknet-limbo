import { Contract } from "starknet";
import { getStarknetProvider } from "@/lib/starknet/provider";

const ETH_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
];

export async function getEthBalance(address: string): Promise<bigint> {
  const provider = getStarknetProvider();

  const contract = new Contract({
    abi: erc20Abi,
    address: ETH_ADDRESS,
    providerOrAccount: provider,
  });
  const res = await contract.balanceOf(address);
  console.log("FAAAHHHHHH", res);

  return BigInt(res);
}
