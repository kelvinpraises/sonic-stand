import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { anvil, sonicBlazeTestnet } from "wagmi/chains";

const isDev = process.env.NODE_ENV === "development";

export const config = createConfig(
  getDefaultConfig({
    appName: "SonicStand",
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: isDev ? [anvil] : [sonicBlazeTestnet],
    multiInjectedProviderDiscovery: true,
    transports: {
      [anvil.id]: http(),
      [sonicBlazeTestnet.id]: http("https://sonic-blaze-rpc.publicnode.com"),
    },
  })
);
