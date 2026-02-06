import {
  useCallback,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
  Badge,
  useToast,
  Progress,
} from "@chakra-ui/react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "@/utils/anchor";
import {
  calculateUnlockCost,
  isTierUnlocked,
  TIER_COLORS,
  TIER_NAMES,
  calculateProductionRate,
  getMaxAccumulationHours,
} from "@/utils/pluginHelpers";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const UnlockTiers = forwardRef<{ refresh: () => void }, {}>((props, ref) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useProgram();
  const toast = useToast();

  const [unlockedTiers, setUnlockedTiers] = useState<number>(0);
  const [cookieBalance, setCookieBalance] = useState<number>(0);
  const [unlockingTier, setUnlockingTier] = useState<number | null>(null);

  const [cookieMintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("reward")],
    program.programId
  );

  // Fetch player data
  const fetchPlayerData = useCallback(async () => {
    if (!publicKey || !program) return;

    try {
      const [playerDataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), publicKey.toBuffer()],
        program.programId
      );

      const playerData = await program.account.playerData.fetch(playerDataPDA);
      setUnlockedTiers(playerData.unlockedTiers);

      // Fetch cookie balance
      const playerTokenAccount = getAssociatedTokenAddressSync(
        cookieMintPDA,
        publicKey
      );

      try {
        const balance =
          await program.provider.connection.getTokenAccountBalance(
            playerTokenAccount
          );
        setCookieBalance(balance.value.uiAmount || 0);
      } catch {
        setCookieBalance(0);
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  }, [publicKey, program, cookieMintPDA]);

  useEffect(() => {
    fetchPlayerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, program]); // Only re-fetch when wallet or program changes

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refresh: fetchPlayerData,
  }));

  const unlockTier = async (tier: number) => {
    if (!publicKey) return;

    setUnlockingTier(tier);

    try {
      const [playerDataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), publicKey.toBuffer()],
        program.programId
      );

      const playerTokenAccount = getAssociatedTokenAddressSync(
        cookieMintPDA,
        publicKey
      );

      const tx = await program.methods
        .unlockTier(tier)
        .accounts({
          player: publicKey,
          playerData: playerDataPDA,
          playerTokenAccount,
          cookieMint: cookieMintPDA,
        })
        .rpc();

      toast({
        title: `Tier ${tier} Unlocked! 🎉`,
        description: `${TIER_NAMES[tier]} tier is now available`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Refresh player data immediately
      await fetchPlayerData();
    } catch (error: any) {
      toast({
        title: "Unlock Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error unlocking tier:", error);
    } finally {
      setUnlockingTier(null);
    }
  };

  if (!publicKey) {
    return (
      <Box textAlign="center" p={8}>
        <Text>Connect your wallet to unlock tiers</Text>
      </Box>
    );
  }

  const tiers = Array.from({ length: 10 }, (_, i) => i + 1);
  const unlockedCount = tiers.filter((t) =>
    isTierUnlocked(unlockedTiers, t)
  ).length;

  return (
    <VStack spacing={6} align="stretch" w="full">
      <VStack spacing={2}>
        <Heading size="lg">🔓 Unlock Plugin Tiers</Heading>
        <HStack>
          <Text fontSize="lg">Your Cookies:</Text>
          <Text fontSize="lg" fontWeight="bold" color="orange.500">
            {cookieBalance} 🍪
          </Text>
        </HStack>
        <Progress
          value={(unlockedCount / 10) * 100}
          colorScheme="purple"
          size="sm"
          w="full"
          borderRadius="full"
        />
        <Text fontSize="sm" color="gray.600">
          {unlockedCount} / 10 tiers unlocked
        </Text>
      </VStack>

      <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
        {tiers.map((tier) => {
          const isUnlocked = isTierUnlocked(unlockedTiers, tier);
          const unlockCost = calculateUnlockCost(tier);
          const canAfford = cookieBalance >= unlockCost;
          const productionRate = calculateProductionRate(tier);
          const maxHours = getMaxAccumulationHours(tier);

          return (
            <Box
              key={tier}
              borderWidth={2}
              borderRadius="lg"
              p={4}
              borderColor={isUnlocked ? TIER_COLORS[tier] : "gray.300"}
              bg={isUnlocked ? `${TIER_COLORS[tier]}20` : "gray.50"}
              opacity={isUnlocked ? 1 : 0.8}
            >
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Badge
                    colorScheme={isUnlocked ? "green" : "gray"}
                    fontSize="sm"
                  >
                    Tier {tier}
                  </Badge>
                  {isUnlocked && <Text fontSize="xl">✅</Text>}
                </HStack>

                <Text fontWeight="bold" fontSize="lg">
                  {TIER_NAMES[tier]}
                </Text>

                <VStack align="stretch" spacing={1} fontSize="sm">
                  <HStack justify="space-between">
                    <Text color="gray.600">Production:</Text>
                    <Text fontWeight="bold">{productionRate} 🍪/hr</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">Max Cap:</Text>
                    <Text fontWeight="bold">{maxHours}h</Text>
                  </HStack>
                  {!isUnlocked && (
                    <HStack justify="space-between">
                      <Text color="gray.600">Unlock Cost:</Text>
                      <Text
                        fontWeight="bold"
                        color={canAfford ? "green.500" : "red.500"}
                      >
                        {unlockCost === 0 ? "FREE" : `${unlockCost} 🍪`}
                      </Text>
                    </HStack>
                  )}
                </VStack>

                {isUnlocked ? (
                  <Button size="sm" colorScheme="green" isDisabled>
                    Unlocked ✓
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    colorScheme={canAfford ? "purple" : "gray"}
                    onClick={() => unlockTier(tier)}
                    isLoading={unlockingTier === tier}
                    isDisabled={!canAfford || unlockingTier !== null}
                  >
                    {canAfford ? "Unlock" : "Not enough cookies"}
                  </Button>
                )}
              </VStack>
            </Box>
          );
        })}
      </Grid>
    </VStack>
  );
});

UnlockTiers.displayName = "UnlockTiers";

export default UnlockTiers;
