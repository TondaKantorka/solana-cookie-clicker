pub use crate::errors::GameErrorCode;
use crate::state::player_data::PlayerData;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};
use session_keys::{Session, SessionToken};

pub fn on_click(ctx: Context<OnClick>) -> Result<()> {
    // Check if player has enough energy
    if ctx.accounts.player.energy < 5 {
        return err!(GameErrorCode::NotEnoughEnergy);
    }
    // Subtract 5 energy from player
    ctx.accounts.player.energy = ctx.accounts.player.energy.checked_sub(5).unwrap();

    // PDA seeds and bump to "sign" for CPI
    let seeds = b"reward";
    let bump = ctx.bumps.reward_token_mint;
    let signer: &[&[&[u8]]] = &[&[seeds, &[bump]]];

    // CPI Context
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.reward_token_mint.to_account_info(),
            to: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.reward_token_mint.to_account_info(),
        },
        signer,
    );

    // Mint 100 cookies per click - TESTING BOOST! 🍪
    let amount = 100u64;

    mint_to(cpi_ctx, amount)?;
    Ok(())
}

#[derive(Accounts, Session)]
pub struct OnClick<'info> {
    #[session(
        // The ephemeral key pair signing the transaction
        signer = signer,
        // The authority of the user account which must have created the session
        authority = player.authority.key()
    )]
    // Session Tokens are passed as optional accounts
    pub session_token: Option<Account<'info, SessionToken>>,

    #[account(
        mut,
        seeds = [b"player".as_ref(), player.authority.key().as_ref()],
        bump,
    )]
    pub player: Account<'info, PlayerData>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: The player's main wallet that owns the token account
    #[account(mut, address = player.authority)]
    pub player_authority: AccountInfo<'info>,

    // Initialize player token account if it doesn't exist
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = reward_token_mint,
        associated_token::authority = player_authority
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"reward"],
        bump,
    )]
    pub reward_token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
