import { useState } from "react";
import { Box, Flex, Heading, Spacer, VStack, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletMultiButton from "@/components/WalletMultiButton";
import DisplayGameState from "@/components/DisplayGameState";
import InitPlayerButton from "@/components/InitPlayerButton";
import SessionKeyButton from "@/components/SessionKeyButton";
import CookieButton from "@/components/CookieButton";
import PluginSystem from "@/components/PluginSystem";
import RequestAirdrop from "@/components/RequestAirdrop";
import DisplayNfts from "@/components/DisplayNfts";

export default function Home() {
  const { publicKey } = useWallet();
  const [cookieBalance, setCookieBalance] = useState<number>(0);

  // Plugin system unlocks at 10+ cookies
  const isPluginUnlocked = cookieBalance >= 10;

  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>
      <VStack spacing={6}>
        <Heading>Cookie Clicker 🍪</Heading>
        {!publicKey && <Text>Connect to devnet wallet!</Text>}
        <DisplayGameState />
        <InitPlayerButton />
        <SessionKeyButton />
        <CookieButton onBalanceUpdate={setCookieBalance} />

        {/* Plugin System - Unlocks at 10 cookies */}
        {publicKey && isPluginUnlocked && <PluginSystem />}

        <RequestAirdrop />
        <DisplayNfts />
      </VStack>
    </Box>
  );
}
