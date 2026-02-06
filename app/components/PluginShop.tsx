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
  Spinner,
} from "@chakra-ui/react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "@/utils/anchor";
import {
  calculateInstallCost,
  calculateProductionRate,
  getMaxAccumulationHours,
  TIER_COLORS,
  TIER_NAMES,
  isTierUnlocked,
} from "@/utils/pluginHelpers";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

interface PluginMetadata {
  name?: string;
  description?: string;
  tier?: number;
  icon?: string;
  background?: string;
}

interface Plugin {
  pluginId: number;
  creator: PublicKey;
  tier: number;
  metadataUri: string;
  totalInstalls: number;
  creatorEarnings: number;
  createdAt: number;
  creatorShareBps: number;
  burnShareBps: number;
  metadata?: PluginMetadata;
}

interface PluginShopProps {
  onPluginInstalled?: () => void;
}

const PluginShop = forwardRef<{ refresh: () => void }, PluginShopProps>(
  ({ onPluginInstalled }, ref) => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const program = useProgram();
    const toast = useToast();

    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(false);
    const [installingPluginId, setInstallingPluginId] = useState<number | null>(
      null
    );
    const [unlockedTiers, setUnlockedTiers] = useState<number>(0);
    const [installedPlugins, setInstalledPlugins] = useState<
      Map<number, number>
    >(new Map()); // Map<tier, pluginId>

    const [cookieMintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward")],
      program.programId
    );

    // Fetch all plugins
    const fetchPlugins = useCallback(async () => {
      if (!program) return;

      setLoading(true);
      try {
        const pluginAccounts = await program.account.plugin.all();
        const pluginData = pluginAccounts.map((account: any) => {
          // Parse metadata JSON
          let metadata: PluginMetadata | undefined;
          try {
            metadata = JSON.parse(account.account.metadataUri);
          } catch (e) {
            console.warn("Failed to parse plugin metadata:", e);
          }

          return {
            pluginId: account.account.pluginId.toNumber(),
            creator: account.account.creator,
            tier: account.account.tier,
            metadataUri: account.account.metadataUri,
            totalInstalls: account.account.totalInstalls.toNumber(),
            creatorEarnings: account.account.creatorEarnings.toNumber(),
            createdAt: account.account.createdAt.toNumber(),
            creatorShareBps: account.account.creatorShareBps,
            burnShareBps: account.account.burnShareBps,
            metadata,
          };
        });

        // Sort by tier, then by total installs
        pluginData.sort((a, b) => {
          if (a.tier !== b.tier) return a.tier - b.tier;
          return b.totalInstalls - a.totalInstalls;
        });

        setPlugins(pluginData);
      } catch (error) {
        console.error("Error fetching plugins:", error);
      } finally {
        setLoading(false);
      }
    }, [program]);

    // Fetch player's unlocked tiers and installed plugins
    const fetchUnlockedTiers = useCallback(async () => {
      if (!publicKey || !program) return;

      try {
        const [playerDataPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("player"), publicKey.toBuffer()],
          program.programId
        );

        const playerData = await program.account.playerData.fetch(
          playerDataPDA
        );
        setUnlockedTiers(playerData.unlockedTiers);

        // Fetch installed plugins for each tier
        const installedMap = new Map<number, number>();
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

            const slotData = await program.account.playerPluginSlot.fetch(
              playerPluginSlotPDA
            );

            if (slotData.pluginId.toNumber() !== 0) {
              installedMap.set(tier, slotData.pluginId.toNumber());
            }
          } catch (error) {
            // Slot doesn't exist or is empty
            continue;
          }
        }

        setInstalledPlugins(installedMap);
      } catch (error) {
        console.error("Error fetching unlocked tiers:", error);
      }
    }, [publicKey, program]);

    useEffect(() => {
      fetchPlugins();
      fetchUnlockedTiers();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, program]); // Only re-fetch when wallet or program changes

    // Expose refresh method to parent
    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchPlugins();
        fetchUnlockedTiers();
      },
    }));

    const installPlugin = async (plugin: Plugin) => {
      if (!publicKey) return;

      setInstallingPluginId(plugin.pluginId);

      try {
        const [playerDataPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("player"), publicKey.toBuffer()],
          program.programId
        );

        const [pluginPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("plugin"),
            new Uint8Array(new BigInt64Array([BigInt(plugin.pluginId)]).buffer),
          ],
          program.programId
        );

        const [playerPluginSlotPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("player_plugin_slot"),
            publicKey.toBuffer(),
            new Uint8Array([plugin.tier]),
          ],
          program.programId
        );

        const playerTokenAccount = getAssociatedTokenAddressSync(
          cookieMintPDA,
          publicKey
        );

        const creatorTokenAccount = getAssociatedTokenAddressSync(
          cookieMintPDA,
          plugin.creator
        );

        console.log("📦 Installing plugin...", {
          pluginId: plugin.pluginId,
          tier: plugin.tier,
          playerPluginSlotPDA: playerPluginSlotPDA.toBase58(),
        });

        const tx = await program.methods
          .installPlugin()
          .accounts({
            player: publicKey,
            playerData: playerDataPDA,
            plugin: pluginPDA,
            playerPluginSlot: playerPluginSlotPDA,
            playerTokenAccount,
            creatorTokenAccount,
            cookieMint: cookieMintPDA,
          })
          .rpc();

        console.log("✅ Plugin installed! TX:", tx);
        console.log(
          "🔍 Verifying account creation at PDA:",
          playerPluginSlotPDA.toBase58()
        );

        // Wait a moment for account to be created
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Try to fetch the account to verify it exists
        try {
          const verifySlot = await program.account.playerPluginSlot.fetch(
            playerPluginSlotPDA
          );
          console.log("✅ Account verified:", {
            tier: verifySlot.tier,
            pluginId: verifySlot.pluginId.toNumber(),
          });
        } catch (e) {
          console.error("❌ Failed to verify account:", e);
        }

        toast({
          title: "Plugin Installed! 🎉",
          description: `Installed ${TIER_NAMES[plugin.tier]} plugin`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Refresh plugins to update install count
        await fetchPlugins();

        // Notify parent to switch tabs
        onPluginInstalled?.();
      } catch (error: any) {
        toast({
          title: "Installation Failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error("Error installing plugin:", error);
      } finally {
        setInstallingPluginId(null);
      }
    };

    if (!publicKey) {
      return (
        <Box textAlign="center" p={8}>
          <Text>Connect your wallet to browse plugins</Text>
        </Box>
      );
    }

    return (
      <VStack spacing={6} align="stretch" w="full">
        <Heading size="lg">🏪 Plugin Shop</Heading>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading plugins...</Text>
          </Box>
        ) : plugins.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text fontSize="lg">No plugins available yet!</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Be the first to create one! 🎨
            </Text>
          </Box>
        ) : (
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
            {plugins.map((plugin) => {
              const isUnlocked = isTierUnlocked(unlockedTiers, plugin.tier);
              const installCost = calculateInstallCost(plugin.tier);
              const productionRate = calculateProductionRate(plugin.tier);
              const maxHours = getMaxAccumulationHours(plugin.tier);
              const currentlyInstalledId = installedPlugins.get(plugin.tier);
              const isCurrentlyInstalled =
                currentlyInstalledId === plugin.pluginId;
              const hasPluginInTier = currentlyInstalledId !== undefined;

              return (
                <Box
                  key={plugin.pluginId}
                  borderWidth={2}
                  borderRadius="lg"
                  p={4}
                  borderColor={TIER_COLORS[plugin.tier]}
                  bg={`${TIER_COLORS[plugin.tier]}10`}
                  opacity={isUnlocked ? 1 : 0.6}
                >
                  <VStack align="stretch" spacing={3}>
                    <HStack justify="space-between">
                      <Badge colorScheme="purple">
                        Tier {plugin.tier} - {TIER_NAMES[plugin.tier]}
                      </Badge>
                      <Badge colorScheme="green">
                        {plugin.totalInstalls} installs
                      </Badge>
                    </HStack>

                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {plugin.metadata?.name ||
                            `Plugin #${plugin.pluginId}`}
                        </Text>
                        {plugin.metadata?.description && (
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {plugin.metadata.description}
                          </Text>
                        )}
                      </VStack>
                      {isCurrentlyInstalled && (
                        <Badge colorScheme="blue" alignSelf="start">
                          Installed
                        </Badge>
                      )}
                    </HStack>

                    <VStack align="stretch" spacing={1} fontSize="sm">
                      <HStack justify="space-between">
                        <Text color="gray.600">Production:</Text>
                        <Text fontWeight="bold">{productionRate} 🍪/hr</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Max Cap:</Text>
                        <Text fontWeight="bold">{maxHours}h</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="gray.600">Install Cost:</Text>
                        <Text fontWeight="bold">{installCost} 🍪</Text>
                      </HStack>
                      {hasPluginInTier && !isCurrentlyInstalled && (
                        <Text fontSize="xs" color="orange.600" mt={1}>
                          ⚠️ Will replace Plugin #{currentlyInstalledId}
                        </Text>
                      )}
                    </VStack>

                    <Button
                      colorScheme={hasPluginInTier ? "orange" : "green"}
                      onClick={() => installPlugin(plugin)}
                      isLoading={installingPluginId === plugin.pluginId}
                      isDisabled={
                        !isUnlocked ||
                        installingPluginId !== null ||
                        isCurrentlyInstalled
                      }
                      size="sm"
                    >
                      {!isUnlocked
                        ? "🔒 Unlock Tier First"
                        : isCurrentlyInstalled
                        ? "✅ Currently Installed"
                        : hasPluginInTier
                        ? "🔄 Replace"
                        : "Install"}
                    </Button>
                  </VStack>
                </Box>
              );
            })}
          </Grid>
        )}
      </VStack>
    );
  }
);

PluginShop.displayName = "PluginShop";

export default PluginShop;
