import { ReactNode } from "react";
import Web3WagmiProvider from "@/components/web3-wagmi.provider";

interface ILayoutProps {
  children: ReactNode;
}

export default function Web3Layout({ children }: ILayoutProps) {
  console.log("Root Layout");
  return (
      <Web3WagmiProvider>
        {children}
      </Web3WagmiProvider>
  );
}