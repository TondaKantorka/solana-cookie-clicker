import Image from "next/image";
import { HStack, VStack, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGameState } from "@/contexts/GameStateProvider";

const DisplayPlayerData = () => {
  const { publicKey } = useWallet();
  const { gameState, nextEnergyIn } = useGameState();

  return (
    <>
      {gameState && publicKey && (
        <HStack justifyContent="center" spacing={4}>
          <HStack>
            <Image src="/energy.png" alt="Energy Icon" width={64} height={64} />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="semibold">
                Energy: {Number(gameState.energy)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Next in: {nextEnergyIn}
              </Text>
            </VStack>
          </HStack>
        </HStack>
      )}
    </>
  );
};

export default DisplayPlayerData;
