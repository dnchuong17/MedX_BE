use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("DiCg1rTEDj1pqkC9d6CDfSZKfTYRn9GhZmYYE1bjo6Tj");

#[program]
pub mod smart_contract {
    use super::*;

    /// Upload a new medical record
    pub fn upload_record(
        ctx: Context<UploadRecord>,
        record_id: String,
        metadata_hash: String,
    ) -> Result<()> {
        let rec = &mut ctx.accounts.record;
        rec.owner = ctx.accounts.user.key();
        rec.record_id = record_id;
        rec.metadata_hash = metadata_hash;
        rec.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// Grant view access
    pub fn grant_access(ctx: Context<GrantAccess>) -> Result<()> {
        Ok(())
    }

    /// Revoke view access
    pub fn revoke_access(ctx: Context<RevokeAccess>) -> Result<()> {
        let lamports = ctx.accounts.access_control.to_account_info().lamports();
        **ctx.accounts.owner.to_account_info().lamports.borrow_mut() += lamports;
        **ctx.accounts.access_control.to_account_info().lamports.borrow_mut() = 0;
        Ok(())
    }

    /// Complete a challenge and mint reward
    pub fn complete_challenge(
        ctx: Context<CompleteChallenge>,
        challenge_id: u64,
        reward: u64,
    ) -> Result<()> {
        let state = &mut ctx.accounts.challenge_state;
        require!(
            !state.completed.contains(&challenge_id),
            ChallengeError::AlreadyCompleted
        );
        state.completed.push(challenge_id);
        let bump = ctx.bumps.vault_authority;
        let seeds: &[&[u8]] = &[b"vault", &[bump]];
        let signer = &[&seeds[..]];
        let cpi = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi,
                signer,
            ),
            reward,
        )?;
        Ok(())
    }

    /// Share anonymized record for research and earn reward
    pub fn share_anonymized(
        ctx: Context<ShareAnonymized>,
        metadata_hash: String,
        reward: u64,
    ) -> Result<()> {
        let ev = &mut ctx.accounts.share_event;
        ev.user = ctx.accounts.user.key();
        ev.metadata_hash = metadata_hash;
        ev.timestamp = Clock::get()?.unix_timestamp;
        let bump = ctx.bumps.vault_authority;
        let seeds: &[&[u8]] = &[b"vault", &[bump]];
        let signer = &[&seeds[..]];
        let cpi = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi,
                signer,
            ),
            reward,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(record_id: String, metadata_hash: String)]
pub struct UploadRecord<'info> {
    #[account(
        init,
        seeds = [record_id.as_bytes(), user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 4 + record_id.len() + 4 + metadata_hash.len() + 8
    )]
    pub record: Account<'info, MedicalRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GrantAccess<'info> {
    #[account(mut, has_one = owner)]
    pub record: Account<'info, MedicalRecord>,
    #[account(
        init,
        seeds = [b"access", record.key().as_ref(), viewer.key().as_ref()],
        bump,
        payer = owner,
        space = 8
    )]
    pub access_control: Account<'info, AccessControl>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Viewer can be any account; PDA seeds ensure access control is valid.
    pub viewer: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    #[account(
        mut,
        seeds = [b"access", record.key().as_ref(), viewer.key().as_ref()],
        bump,
        close = owner
    )]
    pub access_control: Account<'info, AccessControl>,
    pub record: Account<'info, MedicalRecord>,
    #[account(mut, address = record.owner)]
    pub owner: Signer<'info>,
    /// CHECK: Viewer can be any account
    pub viewer: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CompleteChallenge<'info> {
    #[account(mut, has_one = user)]
    pub challenge_state: Account<'info, ChallengeState>,
    #[account(mut)]
    /// CHECK: Vault token account passed as generic AccountInfo for CPI; token program will validate it
    pub vault: AccountInfo<'info>,
    #[account(seeds = [b"vault"], bump)]
    /// CHECK: PDA authority for vault mint; seeds ["vault"] ensure correct authority
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: User token account passed as generic AccountInfo for CPI; token program will validate it
    pub user_token_account: AccountInfo<'info>,
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(metadata_hash: String)]
pub struct ShareAnonymized<'info> {
    #[account(
        init,
        seeds = [b"share", user.key().as_ref(), metadata_hash.as_bytes()],
        bump,
        payer = user,
        space = 8 + 32 + 4 + metadata_hash.len() + 8
    )]
    pub share_event: Account<'info, ShareEvent>,
    #[account(mut)]
    /// CHECK: Vault token account passed as generic AccountInfo for CPI; token program will validate it
    pub vault: AccountInfo<'info>,
    #[account(seeds = [b"vault"], bump)]
    /// CHECK: PDA authority for vault mint; seeds ["vault"] ensure correct authority
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: User token account passed as generic AccountInfo for CPI; token program will validate it
    pub user_token_account: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct MedicalRecord {
    pub owner: Pubkey,
    pub record_id: String,
    pub metadata_hash: String,
    pub timestamp: i64,
}

#[account]
pub struct AccessControl {}

#[account]
pub struct ChallengeState {
    pub user: Pubkey,
    pub completed: Vec<u64>,
}

#[account]
pub struct ShareEvent {
    pub user: Pubkey,
    pub metadata_hash: String,
    pub timestamp: i64,
}

#[error_code]
pub enum ChallengeError {
    #[msg("Challenge already completed")]
    AlreadyCompleted,
}
