"use server";

export async function getEthUsdPrice(): Promise<number> {
  // Try Zerion API first
  try {
    const response = await fetch(
      "https://api.zerion.io/v1/fungibles/eth?currency=usd",
      {
        headers: {
          Accept: "application/json",
          Authorization:
            "Basic emtfZGV2X2JkZGY3ODRhMTY0MTQyYzY4YWNjM2Y4OTZjNWVjMjRmOg==",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Zerion HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the response has the expected structure
    if (
      data?.data?.attributes?.market_data?.price &&
      typeof data.data.attributes.market_data.price === "number"
    ) {
      return data.data.attributes.market_data.price;
    }

    // Log the actual structure for debugging if unexpected
    console.warn(
      "Unexpected Zerion API response structure:",
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error("Failed to fetch ETH/USD price from Zerion:", error);
  }

  // Fallback to CoinCap
  try {
    const response = await fetch("https://api.coincap.io/v2/assets/ethereum", {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`CoinCap HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.data && typeof data.data.priceUsd === "string") {
      const price = parseFloat(data.data.priceUsd);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }

    console.warn(
      "Unexpected CoinCap API response structure:",
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error("Failed to fetch ETH/USD price from CoinCap:", error);
  }

  // Final fallback - return 0 to trigger 1:1 ratio
  console.warn("All price APIs failed, using 1:1 ratio fallback");
  return 0;
}

export async function getEthValueFromUsd(usdAmount: number) {
  try {
    const ethPrice = await getEthUsdPrice();

    console.log("💰 Current ETH price:", ethPrice);
    console.log("💵 USD amount to convert:", usdAmount);

    if (!ethPrice || ethPrice <= 0) {
      // Fallback to 1:1 ratio if price is invalid
      console.warn("Invalid ETH price, using 1:1 ratio fallback");
      return usdAmount;
    }

    // Calculate ETH value using real ETH price (same for mainnet and testnet)
    const ethAmount = usdAmount / ethPrice;

    console.log("💎 Calculated ETH amount:", ethAmount);

    // Format to 6 decimal places
    return ethAmount;
  } catch (error) {
    console.error("Error getting ETH value:", error);
    // Fallback to 1:1 ratio
    return usdAmount;
  }
}

export async function getUsdValueFromEth(ethAmount: number) {
  try {
    const ethPrice = await getEthUsdPrice();

    if (!ethPrice || ethPrice <= 0) {
      // Fallback to 1:1 ratio if price is invalid
      console.warn("Invalid ETH price, using 1:1 ratio fallback");
      return ethAmount;
    }

    // Calculate USD value using real ETH price (same for mainnet and testnet)
    return ethAmount * ethPrice;
  } catch (error) {
    console.error("Error getting USD value:", error);
    // Fallback to 1:1 ratio
    return ethAmount;
  }
}
