/**
 * Umbra SDK integration for Private Payroll.
 *
 * This module wraps @umbra-privacy/sdk into simple async helpers
 * that the UI can call directly.
 */

import {
  getUmbraClient,
  getUmbraRelayer,
  getUserRegistrationFunction,
  getUserAccountQuerierFunction,
  getClaimableUtxoScannerFunction,
  getPublicBalanceToReceiverClaimableUtxoCreatorFunction,
  getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction,
  getEncryptedBalanceToPublicBalanceDirectWithdrawerFunction,
  createSignerFromWalletAccount,
} from '@umbra-privacy/sdk'
import {
  getCreateReceiverClaimableUtxoFromPublicBalanceProver,
  getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver,
  getUserRegistrationProver,
} from '@umbra-privacy/web-zk-prover'
import type { Wallet, WalletAccount } from '@wallet-standard/core'
import { PublicKey } from '@solana/web3.js'

// ─── Public re-export of the client type ─────────────────────────────────────

/** The resolved Umbra client type (IUmbraClient is not exported from the SDK). */
export type UmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Umbra's PRVT test token on devnet.
 *
 * This is the correct mint to use with the Umbra relayer on devnet.
 * Circle's devnet USDC (4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU) is NOT
 * in the relayer's supported_mints list and will cause simulation reverts.
 *
 * Umbra relayer supported mints (from /v1/relayer/info):
 *   EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v  ← mainnet USDC (also used on devnet by Umbra)
 *   PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta   ← Umbra PRVT test token (preferred for demos)
 *   So11111111111111111111111111111111111111112      ← wSOL
 *   Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB  ← USDT
 *   CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH  ← CASH
 */
export const PRVT_MINT_DEVNET = 'PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta'
/** Mainnet USDC address — also used by Umbra on devnet (in relayer's supported_mints). */
export const USDC_MINT_DEVNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const USDC_DECIMALS = 6

const RPC_URL = 'https://api.devnet.solana.com'
const RPC_WS_URL = 'wss://api.devnet.solana.com'
const INDEXER_URL = 'https://utxo-indexer.api.umbraprivacy.com'
const RELAYER_URL = 'https://relayer.api.umbraprivacy.com'

// ─── Conversions ──────────────────────────────────────────────────────────────

/** Convert a whole-dollar amount to USDC micro-units (6 decimals). */
export function toMicroUsdc(usdAmount: number): bigint {
  return BigInt(Math.round(usdAmount * 10 ** USDC_DECIMALS))
}

/** Format micro-USDC bigint to a human-readable "$x,xxx.xx" string. */
export function formatMicroUsdc(microUsdc: bigint): string {
  const usd = Number(microUsdc) / 10 ** USDC_DECIMALS
  return usd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ─── Wallet Standard bridge ───────────────────────────────────────────────────

/**
 * Extract the Wallet Standard Wallet + WalletAccount from the wallet adapter
 * context object returned by `useWallet()`.
 *
 * Works with Phantom, Backpack, Solflare — any Wallet Standard compliant wallet.
 */
function extractWalletStandardAccount(
  walletCtx: unknown,
  publicKeyBase58: string
): { wallet: Wallet; account: WalletAccount } {
  // WalletContextState.wallet has shape { adapter: WalletAdapter, ... }.
  // For Wallet Standard adapters (StandardWalletAdapter), adapter.wallet is
  // the underlying Wallet Standard Wallet.
  const adapter = (walletCtx as any)?.adapter
  const standardWallet = adapter?.wallet as Wallet | undefined

  if (
    !standardWallet ||
    typeof standardWallet !== 'object' ||
    !Array.isArray(standardWallet.accounts)
  ) {
    throw new Error(
      'Your wallet does not support the Wallet Standard. ' +
        'Please use Phantom, Backpack, or Solflare.'
    )
  }

  const account = standardWallet.accounts.find((a: WalletAccount) => {
    try {
      return new PublicKey(a.publicKey).toBase58() === publicKeyBase58
    } catch {
      return false
    }
  })

  if (!account) {
    throw new Error(
      `No connected account found for ${publicKeyBase58}. ` +
        'Make sure your wallet is connected and unlocked.'
    )
  }

  return { wallet: standardWallet, account }
}

// ─── Client lifecycle ─────────────────────────────────────────────────────────

/**
 * Initialise an Umbra client for the currently connected wallet.
 *
 * The master-seed signing prompt is deferred until the first SDK operation
 * that needs a derived key.
 *
 * @param walletCtx       - The `wallet` object from `useWallet()` (not `publicKey`).
 * @param publicKeyBase58 - The connected wallet's public key as a base-58 string.
 */
export async function initUmbraClient(
  walletCtx: unknown,
  publicKeyBase58: string
): Promise<UmbraClient> {
  const { wallet, account } = extractWalletStandardAccount(walletCtx, publicKeyBase58)
  const signer = createSignerFromWalletAccount(wallet, account)

  return getUmbraClient({
    signer,
    network: 'devnet',
    rpcUrl: RPC_URL,
    rpcSubscriptionsUrl: RPC_WS_URL,
    indexerApiEndpoint: INDEXER_URL,
    deferMasterSeedSignature: true,
  })
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Returns true if the wallet already has an on-chain Umbra user account.
 */
export async function isRegistered(client: UmbraClient): Promise<boolean> {
  try {
    const query = getUserAccountQuerierFunction({ client })
    const result = await query(client.signer.address)
    return result.state === 'exists'
  } catch {
    return false
  }
}

/**
 * Register the wallet with Umbra (confidential + anonymous modes).
 *
 * Idempotent — safe to call even if already registered.
 * Prompts the user to sign a message (master seed) + several transactions.
 *
 * @returns Array of transaction signatures produced by registration.
 */
export async function registerWithUmbra(client: UmbraClient): Promise<string[]> {
  const zkProver = getUserRegistrationProver()
  const register = getUserRegistrationFunction({ client }, { zkProver })
  return register({ confidential: true, anonymous: true })
}

// ─── Employee registration check ─────────────────────────────────────────────

/**
 * Check which of the given wallet addresses are NOT yet registered with Umbra.
 *
 * Call this before running payroll so you can show a clear error instead of a
 * cryptic simulation revert.
 *
 * @returns Array of unregistered wallet addresses (empty = all good).
 */
export async function findUnregisteredEmployees(
  client: UmbraClient,
  walletAddresses: string[]
): Promise<string[]> {
  const query = getUserAccountQuerierFunction({ client })

  const results = await Promise.allSettled(
    walletAddresses.map(async (addr) => {
      try {
        const result = await query(addr as any)
        return result.state === 'exists' ? null : addr
      } catch {
        return addr // treat errors as unregistered
      }
    })
  )

  return results
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter((addr): addr is string => addr !== null)
}

// ─── Payroll (employer side) ──────────────────────────────────────────────────

/**
 * Send a single private payroll transfer to one employee.
 *
 * Creates a receiver-claimable UTXO in the Umbra mixer pool. Only the
 * employee can claim it; the amount is invisible on-chain.
 *
 * @param client           - Employer's Umbra client.
 * @param recipientAddress - Employee's Solana wallet address (must be registered).
 * @param usdAmount        - Salary in whole USD (e.g. 8000 = $8,000 USDC).
 * @param mint             - Token mint (defaults to devnet USDC).
 * @returns Solana transaction signature of the mixer deposit.
 */
export async function sendPrivatePayroll(
  client: UmbraClient,
  recipientAddress: string,
  usdAmount: number,
  mint: string = PRVT_MINT_DEVNET
): Promise<string> {
  const zkProver = getCreateReceiverClaimableUtxoFromPublicBalanceProver()
  const createUtxo = getPublicBalanceToReceiverClaimableUtxoCreatorFunction(
    { client },
    { zkProver }
  )

  const result = await createUtxo({
    amount: toMicroUsdc(usdAmount) as any, // U64 branded type
    destinationAddress: recipientAddress as any, // Address branded type
    mint: mint as any,
  })

  return result.createUtxoSignature
}

// ─── Balance / claim (employee side) ─────────────────────────────────────────

export interface ScanResult {
  /** All receiver-claimable UTXOs found for this wallet (raw SDK data). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  received: any[]
  /** Total claimable amount in micro-USDC (sum of UTXO amounts). */
  totalMicroUsdc: bigint
}

/**
 * Scan the Umbra mixer pool for incoming payroll UTXOs addressed to this wallet.
 *
 * Scans Stealth Pool tree 0, from insertion index 0. For production you
 * would persist `nextInsertionIndex` and do incremental scans — for the demo
 * we always scan from 0.
 */
export async function scanForPayroll(client: UmbraClient): Promise<ScanResult> {
  const scan = getClaimableUtxoScannerFunction({ client })
  // Arguments: (treeIndex: U32, startInsertionIndex: U32, endInsertionIndex?: U32)
  const result = await scan(0 as any, 0 as any)

  const received: any[] = result.received
  const totalMicroUsdc = received.reduce(
    (sum: bigint, utxo: any) => sum + BigInt(utxo.amount),
    0n
  )

  return { received, totalMicroUsdc }
}

/**
 * Claim received payroll UTXOs into the employee's Umbra encrypted balance,
 * then immediately withdraw the full amount to their public Solana wallet.
 *
 * Two-step flow:
 *  1. ZK proof → claim UTXOs into encrypted balance (MPC computation via relayer).
 *  2. Withdraw encrypted balance → public ATA.
 *
 * @returns Solana transaction signature of the final withdrawal.
 */
export async function claimAndWithdraw(
  client: UmbraClient,
  utxos: any[],
  totalMicroUsdc: bigint,
  mint: string = PRVT_MINT_DEVNET
): Promise<string> {
  if (utxos.length === 0) throw new Error('No UTXOs to claim.')

  if (!client.fetchBatchMerkleProof) {
    throw new Error(
      'Indexer not configured on Umbra client — cannot fetch Merkle proofs. ' +
        'Make sure INDEXER_URL is set.'
    )
  }

  const relayer = getUmbraRelayer({ apiEndpoint: RELAYER_URL })

  // Step 1 — Claim receiver-claimable UTXOs into encrypted balance
  const claimProver = getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver()
  const claim = getReceiverClaimableUtxoToEncryptedBalanceClaimerFunction(
    { client },
    {
      zkProver: claimProver,
      fetchBatchMerkleProof: client.fetchBatchMerkleProof,
      relayer,
    }
  )
  await claim(utxos)

  // Step 2 — Withdraw full encrypted balance → public ATA
  const withdraw = getEncryptedBalanceToPublicBalanceDirectWithdrawerFunction({ client })
  const withdrawResult = await withdraw(
    client.signer.address,
    mint as any,
    totalMicroUsdc as any // U64
  )

  return withdrawResult.callbackSignature ?? withdrawResult.queueSignature
}
