use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

// Import metadata types from mpl_token_metadata
use mpl_token_metadata::instructions::{
    CreateMetadataAccountV3, CreateMetadataAccountV3InstructionArgs,
};
use mpl_token_metadata::types::DataV2;

pub fn create_mint(
    ctx: Context<CreateMint>,
    uri: String,
    name: String,
    symbol: String,
) -> Result<()> {
    // PDA seeds and bump to "sign" for CPI
    let seeds = b"reward";
    let bump = ctx.bumps.reward_token_mint;
    let signer: &[&[&[u8]]] = &[&[seeds, &[bump]]];

    // On-chain token metadata for the mint
    let data_v2 = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // Create metadata account using mpl_token_metadata
    let metadata_infos = vec![
        ctx.accounts.metadata_account.to_account_info(),
        ctx.accounts.reward_token_mint.to_account_info(),
        ctx.accounts.reward_token_mint.to_account_info(), // mint authority
        ctx.accounts.admin.to_account_info(),
        ctx.accounts.reward_token_mint.to_account_info(), // update authority
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];

    let create_metadata_account_ix = CreateMetadataAccountV3 {
        metadata: ctx.accounts.metadata_account.key(),
        mint: ctx.accounts.reward_token_mint.key(),
        mint_authority: ctx.accounts.reward_token_mint.key(),
        payer: ctx.accounts.admin.key(),
        update_authority: (ctx.accounts.reward_token_mint.key(), true),
        system_program: ctx.accounts.system_program.key(),
        rent: Some(ctx.accounts.rent.key()),
    };

    let args = CreateMetadataAccountV3InstructionArgs {
        data: data_v2,
        is_mutable: true,
        collection_details: None,
    };

    anchor_lang::solana_program::program::invoke_signed(
        &create_metadata_account_ix.instruction(args),
        &metadata_infos,
        signer,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateMint<'info> {
    /// The admin account that can create the mint
    /// TODO: Add address constraint with proper admin pubkey
    #[account(mut)]
    pub admin: Signer<'info>,

    // The PDA is both the address of the mint account and the mint authority
    #[account(
        init,
        seeds = [b"reward"],
        bump,
        payer = admin,
        mint::decimals = 0, // No cookie crumbs! 🍪
        mint::authority = reward_token_mint,

    )]
    pub reward_token_mint: Account<'info, Mint>,

    ///CHECK: Using "address" constraint to validate metadata account address
    #[account(
        mut,
        seeds = [
            b"metadata",
            mpl_token_metadata::ID.as_ref(),
            reward_token_mint.key().as_ref(),
        ],
        bump,
        seeds::program = mpl_token_metadata::ID,
    )]
    pub metadata_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    /// CHECK: This is the Metaplex token metadata program
    pub token_metadata_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
