import Image from "next/image";
import { useCallback, useState, useEffect } from "react";
import { Button, HStack, VStack, Text } from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSessionWallet } from "@magicblock-labs/gum-react-sdk";
import { useGameState } from "@/contexts/GameStateProvider";
import { useProgram, PROGRAM_ID } from "@/utils/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// Cookie mint PDA
const [cookieMintPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("reward")],
  PROGRAM_ID
);

interface CookieButtonProps {
  onBalanceUpdate?: (balance: number) => void;
}

const CookieButton = ({ onBalanceUpdate }: CookieButtonProps = {}) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const sessionWallet = useSessionWallet();
  const { gameState, playerDataPDA } = useGameState();
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingMainWallet, setIsLoadingMainWallet] = useState(false);
  const [cookieBalance, setCookieBalance] = useState<number | null>(null);

  const program = useProgram();

  // Get player's cookie token account
  const getPlayerTokenAccount = useCallback(() => {
    if (!publicKey) return null;
    return getAssociatedTokenAddressSync(cookieMintPDA, publicKey);
  }, [publicKey]);

  // Fetch cookie balance
  const fetchCookieBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const playerTokenAccount = getPlayerTokenAccount();
      if (!playerTokenAccount) return;

      const balance = await connection.getTokenAccountBalance(
        playerTokenAccount
      );
      const balanceAmount = balance.value.uiAmount || 0;
      setCookieBalance(balanceAmount);
      onBalanceUpdate?.(balanceAmount);
    } catch (error) {
      // Token account doesn't exist yet
      setCookieBalance(0);
      onBalanceUpdate?.(0);
    }
  }, [publicKey, connection, getPlayerTokenAccount, onBalanceUpdate]);

  // Fetch balance on mount and when publicKey changes
  useEffect(() => {
    fetchCookieBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, connection]); // Only re-fetch when wallet or connection changes

  // WebSocket subscription for real-time balance updates
  useEffect(() => {
    if (!publicKey || !connection) return;

    const playerTokenAccount = getPlayerTokenAccount();
    if (!playerTokenAccount) return;

    console.log(
      "🔌 Setting up WebSocket for cookie balance:",
      playerTokenAccount.toBase58()
    );

    // Subscribe to account changes
    const subscriptionId = connection.onAccountChange(
      playerTokenAccount,
      (accountInfo) => {
        try {
          // Decode token account data
          const data = accountInfo.data;
          // Token amount is at bytes 64-72 (little-endian u64)
          const amount = Buffer.from(data).readBigUInt64LE(64);
          const balance = Number(amount); // No decimals, so direct conversion

          console.log("🍪 Real-time balance update:", balance);
          setCookieBalance(balance);
          onBalanceUpdate?.(balance);
        } catch (error) {
          console.error("Error parsing token account update:", error);
        }
      },
      "confirmed"
    );

    console.log("✅ WebSocket subscription active:", subscriptionId);

    // Cleanup subscription on unmount
    return () => {
      console.log("🔌 Cleaning up WebSocket subscription");
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection, getPlayerTokenAccount, onBalanceUpdate]);

  // Session wallet click (fast, no approval needed)
  const onClickCookieSession = useCallback(async () => {
    if (!playerDataPDA || !sessionWallet || !publicKey) return;

    setIsLoadingSession(true);

    try {
      const playerTokenAccount = getPlayerTokenAccount();
      if (!playerTokenAccount) {
        console.error("Failed to get player token account");
        return;
      }

      const transaction = await program.methods
        .onClick()
        .accountsPartial({
          player: playerDataPDA,
          playerAuthority: publicKey,
          playerTokenAccount: playerTokenAccount,
          rewardTokenMint: cookieMintPDA,
          signer: sessionWallet.publicKey!,
          sessionToken: sessionWallet.sessionToken,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const txids = await sessionWallet.signAndSendTransaction!(transaction);

      if (txids && txids.length > 0) {
        console.log("Cookie clicked (session):", txids);
        // Wait a bit then update balance
        setTimeout(() => fetchCookieBalance(), 1000);
      } else {
        console.error("Failed to send transaction");
      }
    } catch (error: any) {
      console.log("error", `Cookie click failed! ${error?.message}`);
    } finally {
      setIsLoadingSession(false);
    }
  }, [
    sessionWallet,
    playerDataPDA,
    publicKey,
    program,
    getPlayerTokenAccount,
    fetchCookieBalance,
  ]);

  // Main wallet click (requires approval)
  const onClickCookieMainWallet = useCallback(async () => {
    if (!publicKey || !playerDataPDA) return;

    setIsLoadingMainWallet(true);

    try {
      const playerTokenAccount = getPlayerTokenAccount();
      if (!playerTokenAccount) {
        console.error("Failed to get player token account");
        return;
      }

      const transaction = await program.methods
        .onClick()
        .accountsPartial({
          player: playerDataPDA,
          playerAuthority: publicKey,
          playerTokenAccount: playerTokenAccount,
          rewardTokenMint: cookieMintPDA,
          signer: publicKey,
          sessionToken: null, // No session token when using main wallet
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      const txSig = await sendTransaction(transaction, connection, {
        skipPreflight: true,
      });

      console.log(
        `Cookie clicked! https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      );

      // Wait for confirmation and update balance
      await connection.confirmTransaction(txSig, "confirmed");
      await fetchCookieBalance();
    } catch (error: any) {
      console.log("error", `Cookie click failed! ${error?.message}`);
    } finally {
      setIsLoadingMainWallet(false);
    }
  }, [
    publicKey,
    playerDataPDA,
    connection,
    sendTransaction,
    program,
    getPlayerTokenAccount,
    fetchCookieBalance,
  ]);

  // Check if plugin system is unlocked
  const isPluginUnlocked = cookieBalance !== null && cookieBalance >= 10;
  const cookiesNeeded =
    cookieBalance !== null ? Math.max(0, 10 - cookieBalance) : 10;

  return (
    <>
      {publicKey && gameState && (
        <VStack spacing={4}>
          <VStack spacing={2}>
            <Button
              onClick={
                sessionWallet && sessionWallet.sessionToken
                  ? onClickCookieSession
                  : onClickCookieMainWallet
              }
              isLoading={isLoadingSession || isLoadingMainWallet}
              size="lg"
              colorScheme="orange"
              width="200px"
              height="200px"
              borderRadius="full"
              _hover={{ transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
            >
              <Image
                src="/cookie.png"
                alt="Cookie"
                width={150}
                height={150}
                style={{ pointerEvents: "none" }}
              />
            </Button>
            <Text fontSize="xl" fontWeight="bold">
              Click the Cookie! 🍪
            </Text>
            {sessionWallet && sessionWallet.sessionToken ? (
              <Text fontSize="xs" color="green.500">
                ⚡ Session Mode Active - Fast Clicks!
              </Text>
            ) : (
              <Text fontSize="xs" color="gray.500">
                💡 Enable session keys above for faster clicking
              </Text>
            )}
          </VStack>
          {cookieBalance !== null && (
            <HStack>
              <Text fontSize="lg" fontWeight="semibold">
                Cookies:
              </Text>
              <Text fontSize="lg" color="orange.500">
                {cookieBalance} 🍪
              </Text>
            </HStack>
          )}
          <Text fontSize="sm" color="gray.500">
            Each click costs 5 energy
          </Text>

          {/* Plugin System Hint/Unlock */}
          {!isPluginUnlocked && cookieBalance !== null && cookieBalance > 0 && (
            <VStack
              spacing={2}
              p={4}
              bg="purple.50"
              borderRadius="md"
              borderWidth={2}
              borderColor="purple.200"
              borderStyle="dashed"
            >
              <Text fontSize="md" fontWeight="bold" color="purple.700">
                🔒 Mystery Feature Locked
              </Text>
              <Text fontSize="sm" color="purple.600">
                Collect {cookiesNeeded} more cookie
                {cookiesNeeded !== 1 ? "s" : ""} to unlock something special...
              </Text>
            </VStack>
          )}

          {isPluginUnlocked && (
            <VStack
              spacing={2}
              p={4}
              bg="purple.100"
              borderRadius="md"
              borderWidth={2}
              borderColor="purple.400"
            >
              <Text fontSize="lg" fontWeight="bold" color="purple.700">
                🎉 Plugin System Unlocked! 🎉
              </Text>
              <Text fontSize="sm" color="purple.600">
                You&apos;ve discovered the upgrade system!
              </Text>
            </VStack>
          )}
        </VStack>
      )}
    </>
  );
};

export default CookieButton;
