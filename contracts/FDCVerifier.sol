// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FDCVerifier
 * @notice Integrates with Flare Data Connector to verify external chain transactions
 * @dev This is a simplified implementation - production would integrate with actual FDC
 */
contract FDCVerifier is Ownable {
    
    // Attestation structure
    struct Attestation {
        string txHash;
        string sourceChain;
        uint256 blockNumber;
        uint256 timestamp;
        bool verified;
        address verifier;
    }
    
    // Storage
    mapping(bytes32 => Attestation) public attestations;
    mapping(address => bool) public authorizedVerifiers;
    
    // Events
    event AttestationSubmitted(
        bytes32 indexed attestationId,
        string txHash,
        string sourceChain,
        bool verified
    );
    
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);
    
    constructor() Ownable(msg.sender) {
        // Owner is automatically an authorized verifier
        authorizedVerifiers[msg.sender] = true;
    }
    
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender], "Not authorized verifier");
        _;
    }
    
    /**
     * @notice Authorize a new verifier
     */
    function authorizeVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid address");
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }
    
    /**
     * @notice Revoke verifier authorization
     */
    function revokeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }
    
    /**
     * @notice Submit an attestation for an external transaction
     * @param txHash Transaction hash on external chain
     * @param sourceChain Source blockchain (e.g., "BTC", "ETH", "XRP")
     * @param blockNumber Block number on source chain
     * @param verified Whether the transaction is verified
     */
    function submitAttestation(
        string memory txHash,
        string memory sourceChain,
        uint256 blockNumber,
        bool verified
    ) external onlyAuthorizedVerifier returns (bytes32) {
        require(bytes(txHash).length > 0, "Invalid tx hash");
        require(bytes(sourceChain).length > 0, "Invalid source chain");
        
        // Generate unique attestation ID
        bytes32 attestationId = keccak256(
            abi.encodePacked(txHash, sourceChain, blockNumber)
        );
        
        // Store attestation
        attestations[attestationId] = Attestation({
            txHash: txHash,
            sourceChain: sourceChain,
            blockNumber: blockNumber,
            timestamp: block.timestamp,
            verified: verified,
            verifier: msg.sender
        });
        
        emit AttestationSubmitted(attestationId, txHash, sourceChain, verified);
        
        return attestationId;
    }
    
    /**
     * @notice Verify if a transaction has been attested
     */
    function verifyTransaction(
        string memory txHash,
        string memory sourceChain,
        uint256 blockNumber
    ) external view returns (bool) {
        bytes32 attestationId = keccak256(
            abi.encodePacked(txHash, sourceChain, blockNumber)
        );
        
        Attestation memory attestation = attestations[attestationId];
        return attestation.verified && attestation.timestamp > 0;
    }
    
    /**
     * @notice Get attestation details
     */
    function getAttestation(bytes32 attestationId) 
        external 
        view 
        returns (Attestation memory) 
    {
        return attestations[attestationId];
    }
    
    /**
     * @notice Check if an address is an authorized verifier
     */
    function isAuthorizedVerifier(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier];
    }
}
