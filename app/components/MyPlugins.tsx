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
  Heading,
  HStack,
  Text,
  VStack,
  Progress,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "@/utils/anchor";
import {
  calculateAccumulatedCookies,
  calculateProductionRate,
  getMaxAccumulationHours,
  formatTimeRemaining,
  TIER_COLORS,
  TIER_NAMES,
} from "@/utils/pluginHelpers";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

interface PluginMetadata {
  name?: string;
  description?: string;
  tier?: number;
  icon?: string;
  background?: string;
}

interface PluginSlot {
  tier: number;
  pluginId: number;
  installedAt: number;
  lastClaim: number;
  totalClaimed: number;
  metadata?: PluginMetadata;
}

const MyPlugins = forwardRef<{ refresh: () => void }, {}>((props, ref) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useProgram();
  const toast = useToast();

  const [slots, setSlots] = useState<PluginSlot[]>([]);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [claimingTier, setClaimingTier] = useState<number | null>(null);

  const [cookieMintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("reward")],
    program.programId
  );

  // Update current time every second for real-time accumulation display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch player's installed plugins
  const fetchMyPlugins = useCallback(async () => {
    if (!publicKey || !program) return;

    try {
      const mySlots: PluginSlot[] = [];

      console.log("🔍 Fetching plugins for wallet:", publicKey.toBase58());

      // Check all 10 tier slots
      for (let tier = 1; tier <= 10; tier++) {
        try {
          const [playerPluginSlotPDA] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("player_plugin_slot"),
              publicKey.toBuffer(),
              new Uint8Array([tier]),
            ],
            program.programId
          );

          console.log(
            `Checking Tier ${tier} PDA:`,
            playerPluginSlotPDA.toBase58()
          );

          const slotData = await program.account.playerPluginSlot.fetch(
            playerPluginSlotPDA
          );

          console.log(`Tier ${tier} data:`, {
            pluginId: slotData.pluginId.toNumber(),
            tier: slotData.tier,
            installedAt: slotData.installedAt.toNumber(),
          });

          // Only include slots with plugins installed
          if (slotData.pluginId.toNumber() !== 0) {
            console.log(`✅ Found installed plugin in Tier ${tier}`);

            // Fetch plugin metadata
            let metadata: PluginMetadata | undefined;
            try {
              const [pluginPDA] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("plugin"),
                  new Uint8Array(
                    new BigInt64Array([
                      BigInt(slotData.pluginId.toNumber()),
                    ]).buffer
                  ),
                ],
                program.programId
              );
              const pluginData = await program.account.plugin.fetch(pluginPDA);
              metadata = JSON.parse(pluginData.metadataUri);
            } catch (e) {
              console.warn("Failed to fetch plugin metadata:", e);
            }

            mySlots.push({
              tier: slotData.tier,
              pluginId: slotData.pluginId.toNumber(),
              installedAt: slotData.installedAt.toNumber(),
              lastClaim: slotData.lastClaim.toNumber(),
              totalClaimed: slotData.totalClaimed.toNumber(),
              metadata,
            });
          }
        } catch (error) {
          // Slot doesn't exist or is empty
          console.log(`Tier ${tier}: No account found (not installed)`);
          continue;
        }
      }

      console.log(`📊 Total installed plugins found: ${mySlots.length}`);
      setSlots(mySlots.sort((a, b) => a.tier - b.tier));
    } catch (error) {
      console.error("Error fetching my plugins:", error);
    }
  }, [publicKey, program]);

  useEffect(() => {
    fetchMyPlugins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, program]); // Only re-fetch when wallet or program changes

  // Expose refresh method to parent
  useImperativeHandle(ref, () => ({
    refresh: fetchMyPlugins,
  }));

  const claimCookies = async (tier: number) => {
    if (!publicKey) return;

    setClaimingTier(tier);

    try {
      const [playerPluginSlotPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player_plugin_slot"),
          publicKey.toBuffer(),
          new Uint8Array([tier]),
        ],
        program.programId
      );

      const playerTokenAccount = getAssociatedTokenAddressSync(
        cookieMintPDA,
        publicKey
      );

      const tx = await program.methods
        .claimPluginCookies(tier)
        .accounts({
          player: publicKey,
          playerPluginSlot: playerPluginSlotPDA,
          playerTokenAccount,
          cookieMint: cookieMintPDA,
        })
        .rpc();

      toast({
        title: "Cookies Claimed! 🍪",
        description: `Claimed from Tier ${tier} plugin`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh slots immediately after claiming
      await fetchMyPlugins();
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error claiming cookies:", error);
    } finally {
      setClaimingTier(null);
    }
  };

  if (!publicKey) {
    return (
      <Box textAlign="center" p={8}>
        <Text>Connect your wallet to view your plugins</Text>
      </Box>
    );
  }

  if (slots.length === 0) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="md" mb={4}>
          🎮 My Plugins
        </Heading>
        <Text>No plugins installed yet!</Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          Visit the Plugin Shop to get started 🏪
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      <Heading size="md">🎮 My Plugins</Heading>

      {slots.map((slot) => {
        const accumulated = calculateAccumulatedCookies(
          slot.tier,
          slot.lastClaim,
          currentTime
        );
        const productionRate = calculateProductionRate(slot.tier);
        const maxHours = getMaxAccumulationHours(slot.tier);
        const maxAccumulation = productionRate * maxHours;
        const progress = (accumulated / maxAccumulation) * 100;
        const timeUntilFull = Math.max(
          0,
          slot.lastClaim + maxHours * 3600 - currentTime
        );

        return (
          <Box
            key={slot.tier}
            borderWidth={2}
            borderRadius="lg"
            p={4}
            borderColor={TIER_COLORS[slot.tier]}
            bg={`${TIER_COLORS[slot.tier]}15`}
          >
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={0}>
                  <Badge colorScheme="purple" fontSize="md">
                    Tier {slot.tier} - {TIER_NAMES[slot.tier]}
                  </Badge>
                  <Text fontWeight="bold" fontSize="lg" mt={1}>
                    {slot.metadata?.name || `Plugin #${slot.pluginId}`}
                  </Text>
                  {slot.metadata?.description && (
                    <Text fontSize="xs" color="gray.600" noOfLines={1}>
                      {slot.metadata.description}
                    </Text>
                  )}
                </VStack>
                <Text fontSize="xs" color="gray.500">
                  ID: #{slot.pluginId}
                </Text>
              </HStack>

              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" fontSize="xl">
                    {accumulated} 🍪
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    / {maxAccumulation} max
                  </Text>
                </HStack>

                <Progress
                  value={progress}
                  colorScheme={progress >= 100 ? "green" : "orange"}
                  size="sm"
                  borderRadius="full"
                />

                <HStack justify="space-between" fontSize="sm">
                  <Text color="gray.600">{productionRate} 🍪/hr</Text>
                  <Text color="gray.600">
                    {progress >= 100
                      ? "✅ Full!"
                      : formatTimeRemaining(timeUntilFull)}
                  </Text>
                </HStack>

                <HStack justify="space-between" fontSize="xs" color="gray.500">
                  <Text>Total claimed: {slot.totalClaimed} 🍪</Text>
                </HStack>
              </VStack>

              <Button
                colorScheme={accumulated > 0 ? "green" : "gray"}
                onClick={() => claimCookies(slot.tier)}
                isLoading={claimingTier === slot.tier}
                isDisabled={accumulated === 0 || claimingTier !== null}
                size="sm"
              >
                {accumulated > 0
                  ? `Claim ${accumulated} 🍪`
                  : "Nothing to claim"}
              </Button>
            </VStack>
          </Box>
        );
      })}
    </VStack>
  );
});

MyPlugins.displayName = "MyPlugins";

export default MyPlugins;
