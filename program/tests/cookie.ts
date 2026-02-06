import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Cookie } from "../target/types/cookie";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";

describe("cookie", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Cookie as Program<Cookie>;
  const payer = provider.wallet as anchor.Wallet;
  const gameDataSeed = "gameData";

  // Metaplex token metadata program ID
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  // Metaplex setup
  const metaplex = Metaplex.make(provider.connection);

  // Cookie token metadata
  const metadata = {
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/main/tokens/tokens/.assets/spl-token.png",
    name: "Cookie Token",
    symbol: "COOKIE",
  };

  // Cookie token mint PDA
  const [cookieMintPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("reward")],
    program.programId
  );

  // Helper function to log and confirm transactions
  async function logTransaction(txHash: string) {
    const { blockhash, lastValidBlockHeight } =
      await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction({
      blockhash,
      lastValidBlockHeight,
      signature: txHash,
    });

    console.log(`✅ Transaction confirmed: ${txHash}`);
  }

  it("Init player and chop tree!", async () => {
    console.log("Local address", payer.publicKey.toBase58());

    const balance = await anchor
      .getProvider()
      .connection.getBalance(payer.publicKey);

    if (balance < 1e8) {
      const res = await anchor
        .getProvider()
        .connection.requestAirdrop(payer.publicKey, 1e9);
      await anchor
        .getProvider()
        .connection.confirmTransaction(res, "confirmed");
    }

    const [playerPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), payer.publicKey.toBuffer()],
      program.programId
    );

    console.log("Player PDA", playerPDA.toBase58());

    const [gameDataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(gameDataSeed)],
      program.programId
    );

    try {
      let tx = await program.methods
        .initPlayer(gameDataSeed)
        .accountsStrict({
          player: playerPDA,
          signer: payer.publicKey,
          gameData: gameDataPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc({ skipPreflight: true });
      console.log("Init transaction", tx);

      await anchor.getProvider().connection.confirmTransaction(tx, "confirmed");
      console.log("Confirmed", tx);
    } catch (e) {
      console.log("Player already exists: ", e);
    }

    for (let i = 0; i < 11; i++) {
      console.log(`Chop instruction ${i}`);

      let tx = await program.methods
        .chopTree(gameDataSeed, 0)
        .accountsStrict({
          player: playerPDA,
          sessionToken: null,
          signer: payer.publicKey,
          gameData: gameDataPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("Chop instruction", tx);
      await anchor.getProvider().connection.confirmTransaction(tx, "confirmed");
    }

    const accountInfo = await anchor
      .getProvider()
      .connection.getAccountInfo(playerPDA, "confirmed");

    const decoded = program.coder.accounts.decode(
      "playerData",
      accountInfo.data
    );
    console.log("Player account info", JSON.stringify(decoded));
  });

  it("Creates the Cookie Token! 🍪", async () => {
    console.log("\n🍪 Creating Cookie Token Mint...");
    console.log("Cookie Mint PDA:", cookieMintPDA.toBase58());

    // Get metadata account PDA using Metaplex
    const cookieTokenMintMetadataPDA = await metaplex
      .nfts()
      .pdas()
      .metadata({ mint: cookieMintPDA });

    console.log("Metadata Account:", cookieTokenMintMetadataPDA.toBase58());

    let txHash: string;

    try {
      const mintData = await getMint(provider.connection, cookieMintPDA);
      console.log("✅ Cookie Token Mint Already Exists!");
      console.log("Mint Address:", cookieMintPDA.toString());
    } catch {
      // Mint doesn't exist, create it
      txHash = await program.methods
        .createMint(metadata.uri, metadata.name, metadata.symbol)
        .accounts({
          admin: payer.publicKey,
          rewardTokenMint: cookieMintPDA,
          metadataAccount: cookieTokenMintMetadataPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      await logTransaction(txHash);
      console.log("🎉 Cookie Token Created Successfully!");
      console.log("Token Mint:", cookieMintPDA.toString());
    }
  });

  it("Clicks the cookie and earns tokens! 🖱️🍪", async () => {
    console.log("\n🖱️ Testing Cookie Clicking Mechanism...");

    // Player data account PDA
    const [playerPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), payer.publicKey.toBuffer()],
      program.programId
    );

    const [gameDataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(gameDataSeed)],
      program.programId
    );

    // Player cookie token account address
    const playerTokenAccount = getAssociatedTokenAddressSync(
      cookieMintPDA,
      payer.publicKey
    );

    console.log("Player Token Account:", playerTokenAccount.toBase58());

    // Helper function to fetch and display account data
    async function fetchAccountData() {
      try {
        const [playerBalance, playerData] = await Promise.all([
          provider.connection.getTokenAccountBalance(playerTokenAccount),
          program.account.playerData.fetch(playerPDA),
        ]);

        console.log("🍪 Cookie Balance:", playerBalance.value.uiAmount);
        console.log("⚡ Player Energy:", playerData.energy.toString());
        return {
          balance: playerBalance.value.uiAmount,
          energy: playerData.energy,
        };
      } catch (e) {
        console.log("Account data not available yet");
        return null;
      }
    }

    let txHash: string;

    // Initialize player if needed
    try {
      const playerData = await program.account.playerData.fetch(playerPDA);
      console.log("✅ Player Already Exists");
      console.log("⚡ Player Energy:", playerData.energy.toString());
    } catch {
      txHash = await program.methods
        .initPlayer(gameDataSeed)
        .accounts({
          player: playerPDA,
          signer: payer.publicKey,
          gameData: gameDataPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      await logTransaction(txHash);
      console.log("🎉 Player Account Created!");
    }

    // Click the cookie multiple times!
    const clickCount = 5;
    console.log(`\n🍪 Clicking the cookie ${clickCount} times!`);

    for (let i = 0; i < clickCount; i++) {
      console.log(`\n--- Click ${i + 1} ---`);

      txHash = await program.methods
        .onClick()
        .accounts({
          player: playerPDA,
          playerAuthority: payer.publicKey,
          playerTokenAccount: playerTokenAccount,
          rewardTokenMint: cookieMintPDA,
          signer: payer.publicKey,
          sessionToken: null, // No session token for this test
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await logTransaction(txHash);
      const data = await fetchAccountData();

      if (data) {
        console.log(`🍪 Earned 1 COOKIE! Total: ${data.balance}`);
      }
    }

    console.log("\n🎉 Final Stats:");
    await fetchAccountData();
  });
});
