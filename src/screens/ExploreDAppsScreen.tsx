import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloudVoidTheme } from '../theme/tokens';
import { useNavigation } from '@react-navigation/native';

const CATEGORIES = [
  'DEX',
  'Lending',
  'Yield',
  'Staking',
  'Predictions',
  'NFTs',
  'Games',
  'AI & Bots',
  'Bridge'
];

interface DappItem {
  name: string;
  desc: string;
  icon: string;
  category: string;
  tint: string;
}

export const ALL_DAPPS: DappItem[] = [
  // --- DEX ---
  { name: 'Uniswap', desc: 'Swap tokens instantly across 10+ EVM networks', icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png', category: 'DEX', tint: '#ff007a' },
  { name: 'PancakeSwap', desc: 'Trade, earn, and win on BNB Chain and Ethereum', icon: 'https://cryptologos.cc/logos/pancakeswap-cake-logo.png', category: 'DEX', tint: '#D1884F' },
  { name: 'Curve Finance', desc: 'Highly efficient stablecoin liquidity and swap pools', icon: 'https://cryptologos.cc/logos/curve-dao-token-crv-logo.png', category: 'DEX', tint: '#50A0FF' },
  { name: 'Raydium', desc: 'Next-generation AMM and liquidity provider on Solana', icon: 'https://cryptologos.cc/logos/raydium-ray-logo.png', category: 'DEX', tint: '#c35bf5' },
  { name: 'Jupiter', desc: 'Solana\'s leading swap aggregator and router', icon: 'https://cryptologos.cc/logos/jupiter-jup-logo.png', category: 'DEX', tint: '#57B576' },
  { name: 'Orca', desc: 'The most user-friendly concentrated liquidity DEX on Solana', icon: 'https://cryptologos.cc/logos/orca-orca-logo.png', category: 'DEX', tint: '#F0B90B' },
  { name: 'Balancer', desc: 'Flexible automated portfolio manager and liquidity provider', icon: 'https://cryptologos.cc/logos/balancer-bal-logo.png', category: 'DEX', tint: '#1E293B' },
  { name: 'Trader Joe', desc: 'Avalanche\'s native swap, lending, and yield platform', icon: 'https://cryptologos.cc/logos/trader-joe-joe-logo.png', category: 'DEX', tint: '#E84142' },
  { name: 'QuickSwap', desc: 'High-speed Layer 2 DEX native to Polygon network', icon: 'https://cryptologos.cc/logos/quickswap-quick-logo.png', category: 'DEX', tint: '#0082FF' },
  { name: 'SushiSwap', desc: 'Community-driven decentralized exchange on 20+ chains', icon: 'https://cryptologos.cc/logos/sushiswap-sushi-logo.png', category: 'DEX', tint: '#FA52A0' },
  { name: '1inch', desc: 'Aggregates liquidity from hundreds of DEXes for the best rates', icon: 'https://cryptologos.cc/logos/1inch-1inch-logo.png', category: 'DEX', tint: '#0F2942' },
  { name: 'dYdX', desc: 'Trade perpetual contracts with low fees and deep liquidity', icon: 'https://cryptologos.cc/logos/dydx-dydx-logo.png', category: 'DEX', tint: '#6962F7' },
  { name: 'GMX', desc: 'Decentralized perpetual exchange with zero price impact', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', category: 'DEX', tint: '#2D3748' },
  { name: 'Camelot', desc: 'Customizable native liquidity engine on Arbitrum', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', category: 'DEX', tint: '#FFA500' },
  { name: 'Velodrome', desc: 'The primary liquidity hub and trading protocol on Optimism', icon: 'https://cryptologos.cc/logos/optimism-op-logo.png', category: 'DEX', tint: '#FF0420' },
  { name: 'Aerodrome', desc: 'Central liquidity engine of the Base network ecosystem', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'DEX', tint: '#0052FF' },
  { name: 'Meteora', desc: 'Dynamic yield-generating AMM pools on Solana network', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'DEX', tint: '#14F195' },
  { name: 'BiSwap', desc: 'Feature-rich decentralized exchange with ultra-low trading fees', icon: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png', category: 'DEX', tint: '#E01E5A' },
  { name: 'ParaSwap', desc: 'Aggregator combining DEX liquidity into a single secure gateway', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'DEX', tint: '#000000' },
  { name: 'KyberSwap', desc: 'Multichain liquidity hub and decentralized swap aggregator', icon: 'https://cryptologos.cc/logos/kyber-network-knc-logo.png', category: 'DEX', tint: '#31CB9E' },

  // --- Lending ---
  { name: 'Aave', desc: 'Lend and borrow assets with variable/stable interest rates', icon: 'https://cryptologos.cc/logos/aave-aave-logo.png', category: 'Lending', tint: '#2EBAC6' },
  { name: 'Compound', desc: 'Autonomous interest rate protocol for digital assets', icon: 'https://cryptologos.cc/logos/compound-comp-logo.png', category: 'Lending', tint: '#00D395' },
  { name: 'Morpho', desc: 'Optimized peer-to-peer lending and vault aggregator', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Lending', tint: '#1A202C' },
  { name: 'JustLend', desc: 'The first official decentralized lending platform on TRON', icon: 'https://cryptologos.cc/logos/tron-trx-logo.png', category: 'Lending', tint: '#EC008C' },
  { name: 'Benqi', desc: 'Decentralized liquidity and lending protocol native to Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-2-logo.png', category: 'Lending', tint: '#00D1FF' },
  { name: 'Kamino Finance', desc: 'Borrow, lend, and manage yields on Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Lending', tint: '#05B5CC' },
  { name: 'Marginfi', desc: 'Decentralized lending and margin trading protocol on Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Lending', tint: '#334155' },
  { name: 'Solend', desc: 'Solana-native algorithmic protocol for lending and borrowing', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Lending', tint: '#E75C3B' },
  { name: 'Venus Protocol', desc: 'Decentralized money market and stablecoin system on BSC', icon: 'https://cryptologos.cc/logos/venus-xvs-logo.png', category: 'Lending', tint: '#F0B90B' },
  { name: 'Fluid', desc: 'Hyper-efficient debt and credit market built on Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Lending', tint: '#4287f5' },
  { name: 'Spark Protocol', desc: 'MakerDAO\'s advanced money market for Dai liquidity', icon: 'https://cryptologos.cc/logos/maker-mkr-logo.png', category: 'Lending', tint: '#1AAB9F' },
  { name: 'Notional Finance', desc: 'Decentralized fixed-rate lending and borrowing on Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Lending', tint: '#2D3748' },
  { name: 'Fraxlend', desc: 'Custom debt markets and lending protocols for Frax assets', icon: 'https://cryptologos.cc/logos/frax-share-fxs-logo.png', category: 'Lending', tint: '#000000' },
  { name: 'Radiant Capital', desc: 'Omnichain money market built to unify cross-chain liquidity', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', category: 'Lending', tint: '#3C40C6' },
  { name: 'Liquity', desc: 'Interest-free borrowing of LUSD using ETH collateral', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Lending', tint: '#38A169' },
  { name: 'Silo Finance', desc: 'Isolated money markets protecting users from shared risk', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', category: 'Lending', tint: '#4A5568' },
  { name: 'Juice Finance', desc: 'Lending protocol that leverages cross-margin positions', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Lending', tint: '#F6AD55' },
  { name: 'Euler', desc: 'Non-custodial permissionless lending and borrowing protocol', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Lending', tint: '#5A67D8' },
  { name: 'Maple Finance', desc: 'Institutional credit marketplace for undercollateralized loans', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Lending', tint: '#805AD5' },
  { name: 'Clearpool', desc: 'Decentralized capital markets for unsecured institutional debt', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', category: 'Lending', tint: '#10B981' },

  // --- Yield ---
  { name: 'Yearn Finance', desc: 'Automated yield aggregator maximizing asset returns', icon: 'https://cryptologos.cc/logos/yearn-finance-yfi-logo.png', category: 'Yield', tint: '#006AE3' },
  { name: 'Beefy', desc: 'Multichain yield optimizer auto-compounding interest rates', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Yield', tint: '#E53E3E' },
  { name: 'Convex Finance', desc: 'Boost CRV yields and Curve liquidity provider rewards', icon: 'https://cryptologos.cc/logos/convex-finance-cvx-logo.png', category: 'Yield', tint: '#000000' },
  { name: 'Aura Finance', desc: 'Yield optimization booster for Balancer ecosystem pools', icon: 'https://cryptologos.cc/logos/balancer-bal-logo.png', category: 'Yield', tint: '#6B46C1' },
  { name: 'Pendle', desc: 'Tokenize and trade future yield via AMM structures', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#00E676' },
  { name: 'Reaper Farm', desc: 'Decentralized auto-compounding yield farm on Fantom/Optimism', icon: 'https://cryptologos.cc/logos/optimism-op-logo.png', category: 'Yield', tint: '#ED8936' },
  { name: 'Jito', desc: 'Solana MEV-boosted liquid staking and yield aggregator', icon: 'https://cryptologos.cc/logos/jupiter-jup-logo.png', category: 'Yield', tint: '#4299E1' },
  { name: 'Marinade Finance', desc: 'Stake SOL and participate in Solana ecosystem yield', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Yield', tint: '#319795' },
  { name: 'Lido', desc: 'Earn daily staking rewards while keeping tokens liquid', icon: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png', category: 'Yield', tint: '#00A3C4' },
  { name: 'Rocket Pool', desc: 'Decentralized Ethereum liquid staking yield platform', icon: 'https://cryptologos.cc/logos/rocket-pool-rpl-logo.png', category: 'Yield', tint: '#D53F8C' },
  { name: 'Ether.fi', desc: 'Liquid restaking protocol on EigenLayer with bonus yield', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#38B2AC' },
  { name: 'Kelp DAO', desc: 'Restake liquid staked tokens (LST) for compound yield', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#4FD1C5' },
  { name: 'Renzo', desc: 'EigenLayer Strategy Manager that optimizes restaking rewards', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#667EEA' },
  { name: 'Puffer Finance', desc: 'Slash-resistant decentralized liquid restaking protocol', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#76E4F7' },
  { name: 'EigenLayer', desc: 'Security restaking protocol enabling ETH shared validation', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#0052FF' },
  { name: 'Symbiotic', desc: 'Permissionless shared security restaking hub on Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#1A202C' },
  { name: 'Karak', desc: 'Universal restaking layer securing multi-chain services', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Yield', tint: '#718096' },
  { name: 'Ethena', desc: 'Synthetic dollar protocol generating internet bond yield', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Yield', tint: '#000000' },
  { name: 'Yield Yak', desc: 'Aggregator compounding yields on Avalanche pools', icon: 'https://cryptologos.cc/logos/avalanche-2-logo.png', category: 'Yield', tint: '#3182CE' },
  { name: 'Stader Labs', desc: 'Multi-chain liquid staking platform maximizing validator yield', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', category: 'Yield', tint: '#9B2C2C' },

  // --- Staking ---
  { name: 'Lido Finance', desc: 'The leading liquid staking protocol for Ethereum', icon: 'https://cryptologos.cc/logos/lido-dao-ldo-logo.png', category: 'Staking', tint: '#00A3C4' },
  { name: 'Rocket Pool', desc: 'Eth2 staking protocol designed to be decentralized', icon: 'https://cryptologos.cc/logos/rocket-pool-rpl-logo.png', category: 'Staking', tint: '#D53F8C' },
  { name: 'Jito', desc: 'Liquid staking on Solana with MEV optimization', icon: 'https://cryptologos.cc/logos/jupiter-jup-logo.png', category: 'Staking', tint: '#4299E1' },
  { name: 'Marinade Finance', desc: 'Stake SOL and receive mSOL to use in DeFi', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Staking', tint: '#319795' },
  { name: 'Ether.fi', desc: 'Non-custodial restaked native liquid staking for ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#38B2AC' },
  { name: 'Puffer Finance', desc: 'Eth restaking protocol optimized for home validators', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#76E4F7' },
  { name: 'Renzo', desc: 'DeFi protocol that streamlines EigenLayer restaking', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#667EEA' },
  { name: 'Kelp DAO', desc: 'Restake ETH LSTs to earn Kelp Miles and yield', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#4FD1C5' },
  { name: 'Stader Labs', desc: 'Liquid staking across Ethereum, Polygon, and Fantom', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', category: 'Staking', tint: '#9B2C2C' },
  { name: 'Ankr', desc: 'Decentralized node infrastructure and liquid staking', icon: 'https://cryptologos.cc/logos/ankr-ankr-logo.png', category: 'Staking', tint: '#2F80ED' },
  { name: 'Benqi Staking', desc: 'Liquid staking protocol for Avalanche validators', icon: 'https://cryptologos.cc/logos/avalanche-2-logo.png', category: 'Staking', tint: '#00D1FF' },
  { name: 'BlazeStake', desc: 'High-performance liquid staking protocol for Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Staking', tint: '#E53E3E' },
  { name: 'Binance Web3 Staking', desc: 'Stake assets directly from the global exchange framework', icon: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png', category: 'Staking', tint: '#F0B90B' },
  { name: 'Coinbase Wrapped Staking', desc: 'Institutional wrapped staking tokens backed by Coinbase', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Staking', tint: '#0052FF' },
  { name: 'Swell Network', desc: 'Optimized liquid staking and restaking for Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#2B6CB0' },
  { name: 'Mantle Staking', desc: 'Earn native staking rewards on Mantle network Layer 2', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#000000' },
  { name: 'Bedrock', desc: 'Institutional-grade multi-asset liquid staking platform', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Staking', tint: '#4A5568' },
  { name: 'StakeWise', desc: 'Liquid staking with unique reward tokenization pools', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#718096' },
  { name: 'Kiln', desc: 'Leading enterprise validator staking platform integration', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Staking', tint: '#ED64A6' },
  { name: 'Sanctum', desc: 'Unifying all Solana liquid staking tokens (LSTs)', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Staking', tint: '#2F855A' },

  // --- Predictions ---
  { name: 'Polymarket', desc: 'Predict on politics, pop culture, business, and more', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', category: 'Predictions', tint: '#0082FF' },
  { name: 'Azuro', desc: 'Base layer for decentralized betting and prediction apps', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Predictions', tint: '#00E676' },
  { name: 'Augur', desc: 'Decentralized oracle and prediction market protocol', icon: 'https://cryptologos.cc/logos/augur-rep-logo.png', category: 'Predictions', tint: '#500050' },
  { name: 'Drift Protocol', desc: 'Prediction markets and perpetuals native to Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Predictions', tint: '#05B5CC' },
  { name: 'SX Bet', desc: 'The largest decentralized sports betting exchange', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', category: 'Predictions', tint: '#10B981' },
  { name: 'Predict Fun', desc: 'Meme prediction markets on Optimism and Base', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Predictions', tint: '#FF0420' },
  { name: 'Zeitgeist', desc: 'Polkadot-based prediction market and futarchy protocol', icon: 'https://cryptologos.cc/logos/polkadot-dot-logo.png', category: 'Predictions', tint: '#1A202C' },
  { name: 'Limitless Exchange', desc: 'No-loss prediction markets built on Base network', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Predictions', tint: '#3B99FC' },
  { name: 'Hedgehog Markets', desc: 'No-loss liquidity prediction pools on Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Predictions', tint: '#718096' },
  { name: 'Opinion', desc: 'Peer-to-peer prediction game for political forecasting', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Predictions', tint: '#D53F8C' },
  { name: 'Space', desc: 'Decentralized virtual oracle predictions aggregator', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Predictions', tint: '#4299E1' },
  { name: 'Blinq', desc: 'High-speed algorithmic predictions market on Layer 2', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', category: 'Predictions', tint: '#6B46C1' },
  { name: 'Xmarket', desc: 'Aggregated micro-prediction markets on Web3 topics', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Predictions', tint: '#3182CE' },
  { name: 'Trueo', desc: 'Peer-to-peer truth engine and forecasting exchange', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Predictions', tint: '#E53E3E' },
  { name: 'Dexsport', desc: 'Decentralized web3 betting platform for sports and eSports', icon: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png', category: 'Predictions', tint: '#F0B90B' },
  { name: 'MetaDAO', desc: 'Futarchy market running a DAO based on market predictions', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Predictions', tint: '#0052FF' },
  { name: 'Lamas Finance', desc: 'Web3 prediction gaming platform built on Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Predictions', tint: '#805AD5' },
  { name: 'Fortune', desc: 'Gamified predictions for token launches and pools', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Predictions', tint: '#ED64A6' },
  { name: 'Kizzy', desc: 'Social prediction marketplace for micro-betting trends', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Predictions', tint: '#FFA500' },
  { name: 'Myriad Markets', desc: 'Cross-chain decentralized prediction market hub', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Predictions', tint: '#2F855A' },
  { name: 'Manifold Markets', desc: 'Play-money prediction market to forecast future events', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Predictions', tint: '#1A202C' },

  // --- NFTs ---
  { name: 'Blur', desc: 'Zero-fee NFT marketplace designed for pro traders', icon: 'https://cryptologos.cc/logos/blur-blur-logo.png', category: 'NFTs', tint: '#ff0000' },
  { name: 'OpenSea', desc: 'The world\'s first and largest digital marketplace for NFTs', icon: 'https://cryptologos.cc/logos/opensea-logo.png', category: 'NFTs', tint: '#2081E2' },
  { name: 'Magic Eden', desc: 'Leading cross-chain NFT marketplace (Solana, Bitcoin, EVM)', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'NFTs', tint: '#E42575' },
  { name: 'Tensor', desc: 'Pro-trade Solana NFT marketplace with orderbooks', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'NFTs', tint: '#FF4D00' },
  { name: 'LooksRare', desc: 'Community-first NFT marketplace offering staking rewards', icon: 'https://cryptologos.cc/logos/looksrare-looks-logo.png', category: 'NFTs', tint: '#00E676' },
  { name: 'X2Y2', desc: 'Bulk trading NFT marketplace with low creator fees', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'NFTs', tint: '#1A202C' },
  { name: 'Rarible', desc: 'Multi-chain aggregate NFT marketplace and creation hub', icon: 'https://cryptologos.cc/logos/rarible-rari-logo.png', category: 'NFTs', tint: '#FFE600' },
  { name: 'Element Market', desc: 'Multi-chain NFT aggregator with gas savings', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'NFTs', tint: '#3B99FC' },
  { name: 'AlienSwap', desc: 'Community-built NFT marketplace with trading bonuses', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'NFTs', tint: '#10B981' },
  { name: 'Dew', desc: 'Polygon-focused professional aggregate NFT marketplace', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', category: 'NFTs', tint: '#7C3AED' },

  // --- Games ---
  { name: 'Pixels', desc: 'Farming MMO game where you build and harvest land', icon: 'https://cryptologos.cc/logos/ronin-ron-logo.png', category: 'Games', tint: '#4299E1' },
  { name: 'Axie Infinity', desc: 'Collect, breed, and battle fantasy creatures in Web3', icon: 'https://cryptologos.cc/logos/axie-infinity-axs-logo.png', category: 'Games', tint: '#0083FC' },
  { name: 'Illuvium', desc: 'Open-world RPG adventure game built on Ethereum L2', icon: 'https://cryptologos.cc/logos/illuvium-ilv-logo.png', category: 'Games', tint: '#8B5CF6' },
  { name: 'Gods Unchained', desc: 'Tactical competitive card battle game where you own cards', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Games', tint: '#E2E8F0' },
  { name: 'The Sandbox', desc: 'Create, voxel-build, and monetize gaming experiences', icon: 'https://cryptologos.cc/logos/the-sandbox-sand-logo.png', category: 'Games', tint: '#0084FF' },
  { name: 'Decentraland', desc: 'Explore virtual lands owned and governed by players', icon: 'https://cryptologos.cc/logos/decentraland-mana-logo.png', category: 'Games', tint: '#FF2D55' },
  { name: 'Parallel', desc: 'Sci-fi trading card game featuring factions and NFTs', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Games', tint: '#1A202C' },
  { name: 'Big Time', desc: 'Multiplayer Action RPG featuring web3 virtual economy', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Games', tint: '#ED64A6' },
  { name: 'Pirates Nation', desc: 'Adventure on high seas in a fully on-chain RPG engine', icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', category: 'Games', tint: '#0F172A' },
  { name: 'Shrapnel', desc: 'AAA extraction first-person shooter running on Avalanche', icon: 'https://cryptologos.cc/logos/avalanche-2-logo.png', category: 'Games', tint: '#10B981' },

  // --- AI and Bots ---
  { name: 'Fetch.ai', desc: 'Autonomous AI agents optimizing complex daily tasks', icon: 'https://cryptologos.cc/logos/fetch-ai-fet-logo.png', category: 'AI & Bots', tint: '#1E293B' },
  { name: 'SingularityNET', desc: 'Decentralized platform bringing AI algorithms to Web3', icon: 'https://cryptologos.cc/logos/singularitynet-agix-logo.png', category: 'AI & Bots', tint: '#5F3AFE' },
  { name: 'Render Network', desc: 'Decentralized GPU rendering network for AI and design', icon: 'https://cryptologos.cc/logos/render-token-rndr-logo.png', category: 'AI & Bots', tint: '#E53E3E' },
  { name: 'Bittensor', desc: 'Open-source network powering decentralized AI training', icon: 'https://cryptologos.cc/logos/bittensor-tao-logo.png', category: 'AI & Bots', tint: '#000000' },
  { name: 'Ocean Protocol', desc: 'Decentralized data sharing and monetization for AI models', icon: 'https://cryptologos.cc/logos/ocean-protocol-ocean-logo.png', category: 'AI & Bots', tint: '#F43F5E' },
  { name: 'AIT Protocol', desc: 'First Web3 data infrastructure optimizing AI model training', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'AI & Bots', tint: '#4F46E5' },
  { name: 'Banana Gun', desc: 'Telegram trading bot designed for high-speed token snipes', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'AI & Bots', tint: '#FBBF24' },
  { name: 'Maestro Bots', desc: 'Multi-chain Telegram bot facilitating instant token buys', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'AI & Bots', tint: '#10B981' },
  { name: 'Trojan Bot', desc: 'Solana trading bot executing limit orders and copytrades', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'AI & Bots', tint: '#8B5CF6' },
  { name: 'BonkBot', desc: 'The fastest Telegram trading bot native to Solana ecosystem', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'AI & Bots', tint: '#F59E0B' },

  // --- Bridge ---
  { name: 'Across Protocol', desc: 'Optimistic cross-chain bridge for fast L2 transactions', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Bridge', tint: '#2F855A' },
  { name: 'Stargate Finance', desc: 'Fully composable cross-chain liquidity and bridge hub', icon: 'https://cryptologos.cc/logos/stargate-finance-stg-logo.png', category: 'Bridge', tint: '#0F172A' },
  { name: 'Synapse', desc: 'Bridge assets, swap, and earn yield across blockchains', icon: 'https://cryptologos.cc/logos/synapse-syn-logo.png', category: 'Bridge', tint: '#EC4899' },
  { name: 'Hop Protocol', desc: 'Fast, trustless bridge for transferring assets between L2s', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Bridge', tint: '#5C5FE5' },
  { name: 'Celer Network', desc: 'Real-time multi-chain bridge and cross-chain message passing', icon: 'https://cryptologos.cc/logos/celo-celo-logo.png', category: 'Bridge', tint: '#2F80ED' },
  { name: 'Orbiter Finance', desc: 'Decentralized optimistic cross-rollup Layer 2 bridge', icon: 'https://cryptologos.cc/logos/base-logo.png', category: 'Bridge', tint: '#EA580C' },
  { name: 'Portal Bridge', desc: 'Bridge assets globally across blockchains using Wormhole', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Bridge', tint: '#0F172A' },
  { name: 'Jumper Exchange', desc: 'Liquidity bridge and swap aggregator native to Li.Fi', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Bridge', tint: '#6366F1' },
  { name: 'deBridge', desc: 'Secure real-time cross-chain transfers with zero slippage', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', category: 'Bridge', tint: '#10B981' },
  { name: 'Bungee', desc: 'Optimized routing engine for fast and cheap bridging paths', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', category: 'Bridge', tint: '#3B99FC' }
];

export default function ExploreDAppsScreen() {
  const [activeCategory, setActiveCategory] = useState('DEX');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();

  const filteredDapps = ALL_DAPPS.filter(d => 
    d.category === activeCategory && 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeftRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={CloudVoidTheme.colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explore dApps</Text>
        </View>
        <Ionicons name="options-outline" size={22} color={CloudVoidTheme.colors.textSecondary} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={CloudVoidTheme.colors.textDisabled} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by dApp name..."
          placeholderTextColor={CloudVoidTheme.colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Horizontal Category Pills Selector */}
      <View style={styles.pillsOuterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[
                styles.categoryPill, 
                activeCategory === cat && styles.activeCategoryPill
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[
                styles.categoryPillText, 
                activeCategory === cat && styles.activeCategoryPillText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Standard List View */}
      <FlatList
        data={filteredDapps}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No dApps found matching "{searchQuery}"</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => Alert.alert('Simulate Connection', `Open session request modal for ${item.name}?`)}
          >
            {/* High Contrast Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: item.tint }]}>
              {item.icon ? (
                <Image source={{ uri: item.icon }} style={styles.dappIconImage} />
              ) : (
                <Text style={styles.dappInitialText}>{item.name[0]}</Text>
              )}
            </View>

            {/* Bold Title & Value Prop */}
            <View style={styles.dappDetails}>
              <Text style={styles.dappTitle}>{item.name}</Text>
              <Text style={styles.dappDesc}>{item.desc}</Text>
            </View>

            {/* Right Action arrow */}
            <Ionicons name="chevron-forward" size={16} color={CloudVoidTheme.colors.textDisabled} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050514',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    height: 48,
    fontSize: 15,
  },
  pillsOuterContainer: {
    marginVertical: 16,
  },
  pillsContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeCategoryPill: {
    backgroundColor: 'rgba(59, 153, 252, 0.15)',
    borderColor: '#3B99FC',
  },
  categoryPillText: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeCategoryPillText: {
    color: '#3B99FC',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  dappIconImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  dappInitialText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  dappDetails: {
    flex: 1,
    marginRight: 10,
  },
  dappTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  dappDesc: {
    color: CloudVoidTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: CloudVoidTheme.colors.textDisabled,
    fontSize: 14,
  }
});
