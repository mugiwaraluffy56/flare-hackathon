// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ComplianceEngine
 * @notice Core compliance logic for FACE - Flare Autonomous Compliance Engine
 * @dev Manages risk assessment, compliance rules, and automated decision making
 */
contract ComplianceEngine is Ownable, ReentrancyGuard {
    
    // Compliance status enum
    enum ComplianceStatus {
        PENDING,
        APPROVED,
        REJECTED,
        UNDER_REVIEW
    }
    
    // Risk level thresholds
    uint8 public constant LOW_RISK_THRESHOLD = 30;
    uint8 public constant MEDIUM_RISK_THRESHOLD = 60;
    uint8 public constant HIGH_RISK_THRESHOLD = 85;
    
    // Compliance record structure
    struct ComplianceRecord {
        address user;
        string assetType;
        uint256 amount;
        uint8 riskScore;
        ComplianceStatus status;
        uint256 timestamp;
        string txHash;
        bool fdcVerified;
        uint256 assetPrice;
        uint256 volatility;
    }
    
    // Storage
    mapping(uint256 => ComplianceRecord) public complianceRecords;
    mapping(address => uint256[]) public userRecords;
    uint256 public recordCounter;
    
    // Smart Account Factory reference
    address public smartAccountFactory;
    
    // FDC Verifier reference
    address public fdcVerifier;
    
    // FTSO Price Feed reference
    address public ftsoPriceFeed;
    
    // Events
    event ComplianceSubmitted(
        uint256 indexed recordId,
        address indexed user,
        string assetType,
        uint256 amount,
        uint8 riskScore
    );
    
    event ComplianceApproved(
        uint256 indexed recordId,
        address indexed user,
        uint256 timestamp
    );
    
    event ComplianceRejected(
        uint256 indexed recordId,
        address indexed user,
        uint8 riskScore,
        uint256 timestamp
    );
    
    event RiskThresholdUpdated(
        string thresholdType,
        uint8 oldValue,
        uint8 newValue
    );
    
    constructor() Ownable(msg.sender) {
        recordCounter = 0;
    }
    
    /**
     * @notice Set the Smart Account Factory address
     */
    function setSmartAccountFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "Invalid factory address");
        smartAccountFactory = _factory;
    }
    
    /**
     * @notice Set the FDC Verifier address
     */
    function setFDCVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        fdcVerifier = _verifier;
    }
    
    /**
     * @notice Set the FTSO Price Feed address
     */
    function setFTSOPriceFeed(address _priceFeed) external onlyOwner {
        require(_priceFeed != address(0), "Invalid price feed address");
        ftsoPriceFeed = _priceFeed;
    }
    
    /**
     * @notice Submit a new compliance check
     * @param assetType Type of asset being checked
     * @param amount Amount of asset
     * @param riskScore AI-calculated risk score (0-100)
     * @param txHash External transaction hash
     * @param fdcVerified Whether FDC verification passed
     * @param assetPrice Current asset price from FTSO
     * @param volatility Price volatility metric
     */
    function submitCompliance(
        string memory assetType,
        uint256 amount,
        uint8 riskScore,
        string memory txHash,
        bool fdcVerified,
        uint256 assetPrice,
        uint256 volatility
    ) external nonReentrant returns (uint256) {
        require(riskScore <= 100, "Invalid risk score");
        require(bytes(assetType).length > 0, "Asset type required");
        require(amount > 0, "Amount must be positive");
        
        recordCounter++;
        uint256 recordId = recordCounter;
        
        // Determine compliance status based on risk score
        ComplianceStatus status = _determineStatus(riskScore, fdcVerified);
        
        // Create compliance record
        complianceRecords[recordId] = ComplianceRecord({
            user: msg.sender,
            assetType: assetType,
            amount: amount,
            riskScore: riskScore,
            status: status,
            timestamp: block.timestamp,
            txHash: txHash,
            fdcVerified: fdcVerified,
            assetPrice: assetPrice,
            volatility: volatility
        });
        
        // Track user records
        userRecords[msg.sender].push(recordId);
        
        // Emit event
        emit ComplianceSubmitted(recordId, msg.sender, assetType, amount, riskScore);
        
        // Auto-approve or reject based on status
        if (status == ComplianceStatus.APPROVED) {
            emit ComplianceApproved(recordId, msg.sender, block.timestamp);
        } else if (status == ComplianceStatus.REJECTED) {
            emit ComplianceRejected(recordId, msg.sender, riskScore, block.timestamp);
        }
        
        return recordId;
    }
    
    /**
     * @notice Determine compliance status based on risk score and verification
     */
    function _determineStatus(uint8 riskScore, bool fdcVerified) 
        internal 
        pure 
        returns (ComplianceStatus) 
    {
        // Reject if FDC verification failed
        if (!fdcVerified) {
            return ComplianceStatus.REJECTED;
        }
        
        // Auto-approve low risk
        if (riskScore < LOW_RISK_THRESHOLD) {
            return ComplianceStatus.APPROVED;
        }
        
        // Auto-reject high risk
        if (riskScore >= HIGH_RISK_THRESHOLD) {
            return ComplianceStatus.REJECTED;
        }
        
        // Medium risk requires review
        return ComplianceStatus.UNDER_REVIEW;
    }
    
    /**
     * @notice Manually approve a compliance record (for under review cases)
     */
    function approveCompliance(uint256 recordId) external onlyOwner {
        ComplianceRecord storage record = complianceRecords[recordId];
        require(record.user != address(0), "Record does not exist");
        require(record.status == ComplianceStatus.UNDER_REVIEW, "Not under review");
        
        record.status = ComplianceStatus.APPROVED;
        emit ComplianceApproved(recordId, record.user, block.timestamp);
    }
    
    /**
     * @notice Manually reject a compliance record
     */
    function rejectCompliance(uint256 recordId) external onlyOwner {
        ComplianceRecord storage record = complianceRecords[recordId];
        require(record.user != address(0), "Record does not exist");
        require(record.status == ComplianceStatus.UNDER_REVIEW, "Not under review");
        
        record.status = ComplianceStatus.REJECTED;
        emit ComplianceRejected(recordId, record.user, record.riskScore, block.timestamp);
    }
    
    /**
     * @notice Get compliance record by ID
     */
    function getComplianceRecord(uint256 recordId) 
        external 
        view 
        returns (ComplianceRecord memory) 
    {
        return complianceRecords[recordId];
    }
    
    /**
     * @notice Get all compliance records for a user
     */
    function getUserRecords(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userRecords[user];
    }
    
    /**
     * @notice Get total number of records
     */
    function getTotalRecords() external view returns (uint256) {
        return recordCounter;
    }
}
