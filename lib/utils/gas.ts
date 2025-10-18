import {
  Contract,
  formatEther,
  formatUnits,
  parseEther,
  JsonRpcProvider,
  toBeHex,
} from "ethers";

/**
 * Call eth_estimateGas using Alchemy's JSON-RPC API
 */
async function callAlchemyEstimateGas(
  rpcUrl: string,
  from: string,
  to: string,
  value: string,
  data?: string
): Promise<bigint> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_estimateGas",
      params: [
        {
          from,
          to,
          value,
          ...(data && { data }),
        },
      ],
      id: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.error) {
    console.error("Alchemy gas estimation error:", result.error);
    const errorMsg = result.error.message || "Gas estimation failed";
    const errorData = result.error.data || result.error.reason || "";

    // Log full error for debugging
    console.error("Full RPC error:", JSON.stringify(result.error, null, 2));

    throw new Error(`${errorMsg}${errorData ? ` - ${errorData}` : ""}`);
  }

  return BigInt(result.result);
}

export const estimateGas = async (
  provider: JsonRpcProvider,
  fromAddress: string,
  toAddress: string,
  amount: string
): Promise<{
  gasLimit: string;
  gasPrice: string;
  totalCost: string;
}> => {
  try {
    // Get RPC URL from provider connection info
    const connection = (
      provider as { _getConnection: () => { url: string } }
    )._getConnection();
    const rpcUrl = connection.url;

    if (!rpcUrl) {
      throw new Error("Could not get RPC URL from provider");
    }

    const feeData = await provider.getFeeData();
    if (!feeData.gasPrice) throw new Error("Could not estimate gas price");

    // Estimate for ETH transfer using Alchemy API
    const valueHex = toBeHex(parseEther(amount));
    const gasEstimate = await callAlchemyEstimateGas(
      rpcUrl,
      fromAddress,
      toAddress,
      valueHex
    );

    const totalCost = gasEstimate * feeData.gasPrice;

    return {
      gasLimit: gasEstimate.toString(),
      gasPrice: formatUnits(feeData.gasPrice, "gwei"),
      totalCost: formatEther(totalCost),
    };
  } catch (error) {
    console.error("Error estimating gas:", (error as Error).message);
    throw new Error("Failed to estimate gas");
  }
};

/**
 * Estimate gas for a contract function call using Alchemy API
 */
export const estimateContractGas = async (
  contract: Contract,
  functionName: string,
  args: unknown[],
  value?: bigint
): Promise<{
  gasLimit: bigint;
  gasPrice: bigint;
  totalCost: bigint;
}> => {
  try {
    const provider = contract.runner?.provider as JsonRpcProvider;
    if (!provider) {
      throw new Error("Provider not available on contract");
    }

    // Get RPC URL from provider connection info
    const connection = (
      provider as { _getConnection: () => { url: string } }
    )._getConnection();
    const rpcUrl = connection.url;

    if (!rpcUrl) {
      throw new Error("Could not get RPC URL from provider");
    }

    console.log("🔗 Using RPC URL for gas estimation:", rpcUrl);

    const feeData = await provider.getFeeData();
    if (!feeData.gasPrice) {
      throw new Error("Could not estimate gas price");
    }

    // Get the from address (signer address)
    const signer = contract.runner;
    if (
      !signer ||
      typeof (signer as { getAddress?: () => Promise<string> }).getAddress !==
        "function"
    ) {
      throw new Error("Signer not available on contract");
    }
    const fromAddress = await (
      signer as { getAddress: () => Promise<string> }
    ).getAddress();

    // Encode the function call
    const data = contract.interface.encodeFunctionData(functionName, args);

    // Use Alchemy API for gas estimation
    const valueHex = value ? toBeHex(value) : "0x0";
    const gasLimit = await callAlchemyEstimateGas(
      rpcUrl,
      fromAddress,
      await contract.getAddress(),
      valueHex,
      data
    );

    const totalCost = gasLimit * feeData.gasPrice;

    return {
      gasLimit,
      gasPrice: feeData.gasPrice,
      totalCost,
    };
  } catch (error) {
    console.error("Error estimating contract gas:", (error as Error).message);
    throw error;
  }
};
