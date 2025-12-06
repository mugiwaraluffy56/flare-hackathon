import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const COSTON2_CHAIN_ID = '0x72'; // 114 in hex
const COSTON2_RPC = 'https://coston2-api.flare.network/ext/C/rpc';

export const useWeb3 = () => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();

                if (accounts.length > 0) {
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();

                    setProvider(provider);
                    setSigner(signer);
                    setAccount(address);
                    setIsConnected(true);

                    await checkNetwork();
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        }
    };

    const checkNetwork = async () => {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setIsCorrectNetwork(chainId === COSTON2_CHAIN_ID);
        } catch (error) {
            console.error('Error checking network:', error);
        }
    };

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask to use this application');
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);

            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setProvider(provider);
            setSigner(signer);
            setAccount(address);
            setIsConnected(true);

            await switchToCoston2();
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet');
        }
    };

    const switchToCoston2 = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: COSTON2_CHAIN_ID }],
            });
            setIsCorrectNetwork(true);
        } catch (switchError) {
            // Chain doesn't exist, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: COSTON2_CHAIN_ID,
                                chainName: 'Flare Testnet Coston2',
                                nativeCurrency: {
                                    name: 'Coston2 Flare',
                                    symbol: 'C2FLR',
                                    decimals: 18,
                                },
                                rpcUrls: [COSTON2_RPC],
                                blockExplorerUrls: ['https://coston2-explorer.flare.network'],
                            },
                        ],
                    });
                    setIsCorrectNetwork(true);
                } catch (addError) {
                    console.error('Error adding network:', addError);
                }
            }
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setProvider(null);
        setSigner(null);
        setIsConnected(false);
        setIsCorrectNetwork(false);
    };

    return {
        account,
        provider,
        signer,
        isConnected,
        isCorrectNetwork,
        connectWallet,
        switchToCoston2,
        disconnectWallet,
    };
};
