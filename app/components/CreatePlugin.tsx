import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Heading,
  VStack,
  HStack,
  Text,
  useToast,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Textarea,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "@/utils/anchor";
import {
  calculateCreationCost,
  calculateProductionRate,
  getMaxAccumulationHours,
  TIER_NAMES,
} from "@/utils/pluginHelpers";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

interface CreatePluginProps {
  onPluginCreated?: () => void;
}

const CreatePlugin = ({ onPluginCreated }: CreatePluginProps) => {
  const { publicKey } = useWallet();
  const program = useProgram();
  const toast = useToast();

  const [tier, setTier] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [creatorShare, setCreatorShare] = useState(20); // 20%
  const [creating, setCreating] = useState(false);

  const [cookieMintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("reward")],
    program.programId,
  );

  const createPlugin = async () => {
    if (!publicKey) return;

    // Validation
    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a plugin name",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCreating(true);

    try {
      // Create metadata JSON (simplified - in production use Arweave/IPFS)
      const metadata = JSON.stringify({
        name,
        description,
        tier,
        icon: iconUrl || `https://via.placeholder.com/100/random?tier=${tier}`,
        background:
          backgroundUrl ||
          `https://via.placeholder.com/400/random?tier=${tier}`,
      });

      // For now, use metadata string directly (max 200 chars)
      // In production, upload to Arweave/IPFS and use the URI
      const metadataUri =
        metadata.length <= 200 ? metadata : `{"name":"${name}","tier":${tier}}`;

      const [playerDataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), publicKey.toBuffer()],
        program.programId,
      );

      // Fetch current plugin counter to derive the next plugin PDA
      const playerData = await program.account.playerData.fetch(playerDataPDA);
      const pluginId = playerData.pluginGlobalCounter.toNumber();

      const [pluginPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("plugin"),
          new Uint8Array(new BigInt64Array([BigInt(pluginId)]).buffer),
        ],
        program.programId,
      );

      const creatorTokenAccount = getAssociatedTokenAddressSync(
        cookieMintPDA,
        publicKey,
      );

      const creatorShareBps = creatorShare * 100; // Convert % to basis points

      const tx = await program.methods
        .createPlugin(tier, metadataUri, creatorShareBps)
        .accounts({
          creator: publicKey,
        })
        .rpc();

      toast({
        title: "Plugin Created! 🎉",
        description: `Your ${TIER_NAMES[tier]} plugin is now live`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setName("");
      setDescription("");
      setIconUrl("");
      setBackgroundUrl("");

      // Notify parent
      onPluginCreated?.();
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error creating plugin:", error);
    } finally {
      setCreating(false);
    }
  };

  if (!publicKey) {
    return (
      <Box textAlign="center" p={8}>
        <Text>Connect your wallet to create a plugin</Text>
      </Box>
    );
  }

  const creationCost = calculateCreationCost(tier);
  const productionRate = calculateProductionRate(tier);
  const maxHours = getMaxAccumulationHours(tier);
  const burnShare = 100 - creatorShare;

  return (
    <VStack spacing={6} align="stretch" maxW="600px" mx="auto">
      <Heading size="lg">🎨 Create Plugin</Heading>

      <FormControl>
        <FormLabel>Plugin Tier</FormLabel>
        <Select value={tier} onChange={(e) => setTier(Number(e.target.value))}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((t) => (
            <option key={t} value={t}>
              Tier {t} - {TIER_NAMES[t]}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Plugin Name</FormLabel>
        <Input
          placeholder="My Awesome Plugin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Description</FormLabel>
        <Textarea
          placeholder="What makes your plugin special?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Icon URL (optional)</FormLabel>
        <Input
          placeholder="https://..."
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
        />
        <Text fontSize="xs" color="gray.500" mt={1}>
          Square image recommended (100x100px)
        </Text>
      </FormControl>

      <FormControl>
        <FormLabel>Background URL (optional)</FormLabel>
        <Input
          placeholder="https://..."
          value={backgroundUrl}
          onChange={(e) => setBackgroundUrl(e.target.value)}
        />
        <Text fontSize="xs" color="gray.500" mt={1}>
          Wide image recommended (400x200px)
        </Text>
      </FormControl>

      <FormControl>
        <FormLabel>Creator Revenue Share: {creatorShare}%</FormLabel>
        <Slider
          value={creatorShare}
          onChange={setCreatorShare}
          min={0}
          max={100}
          step={5}
        >
          <SliderTrack>
            <SliderFilledTrack bg="green.400" />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <HStack justify="space-between" fontSize="sm" color="gray.600" mt={2}>
          <Text>You earn: {creatorShare}%</Text>
          <Text>Burned: {burnShare}%</Text>
        </HStack>
      </FormControl>

      <Box borderWidth={1} borderRadius="lg" p={4} bg="purple.50">
        <Heading size="sm" mb={3}>
          📊 Plugin Stats
        </Heading>
        <VStack align="stretch" spacing={2} fontSize="sm">
          <HStack justify="space-between">
            <Text color="gray.600">Production Rate:</Text>
            <Text fontWeight="bold">{productionRate} 🍪/hour</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="gray.600">Max Accumulation:</Text>
            <Text fontWeight="bold">{maxHours} hours</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="gray.600">Creation Cost:</Text>
            <Text fontWeight="bold" color="orange.500">
              {creationCost} 🍪
            </Text>
          </HStack>
        </VStack>
      </Box>

      <Button
        colorScheme="purple"
        size="lg"
        onClick={createPlugin}
        isLoading={creating}
      >
        Create Plugin for {creationCost} 🍪
      </Button>

      <Text fontSize="xs" color="gray.500" textAlign="center">
        💡 Higher tiers cost more to create but are more valuable for players
      </Text>
    </VStack>
  );
};

export default CreatePlugin;
