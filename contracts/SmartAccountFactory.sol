// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartAccount
 * @notice Individual smart account with autonomous execution capabilities
 */
contract SmartAccount {
    address public owner;
    address public complianceEngine;
    
    event TransactionExecuted(address indexed to, uint256 value, bytes data);
    event TransactionRejected(string reason);
    
    constructor(address _owner, address _complianceEngine) {
        owner = _owner;
        complianceEngine = _complianceEngine;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyComplianceEngine() {
        require(msg.sender == complianceEngine, "Not compliance engine");
        _;
    }
    
    /**
     * @notice Execute transaction if compliance approved
     */
    function executeTransaction(
        address to,
        uint256 value,
        bytes memory data
    ) external onlyComplianceEngine returns (bool) {
        (bool success, ) = to.call{value: value}(data);
        
        if (success) {
            emit TransactionExecuted(to, value, data);
        } else {
            emit TransactionRejected("Transaction failed");
        }
        
        return success;
    }
    
    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {}
    
    /**
     * @notice Get account balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

/**
 * @title SmartAccountFactory
 * @notice Factory for creating and managing Smart Accounts
 */
contract SmartAccountFactory is Ownable {
    
    mapping(address => address) public userAccounts;
    address[] public allAccounts;
    address public complianceEngine;
    
    event SmartAccountCreated(address indexed user, address indexed account);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Set the compliance engine address
     */
    function setComplianceEngine(address _complianceEngine) external onlyOwner {
        require(_complianceEngine != address(0), "Invalid address");
        complianceEngine = _complianceEngine;
    }
    
    /**
     * @notice Create a new Smart Account for a user
     */
    function createSmartAccount() external returns (address) {
        require(userAccounts[msg.sender] == address(0), "Account already exists");
        require(complianceEngine != address(0), "Compliance engine not set");
        
        SmartAccount newAccount = new SmartAccount(msg.sender, complianceEngine);
        address accountAddress = address(newAccount);
        
        userAccounts[msg.sender] = accountAddress;
        allAccounts.push(accountAddress);
        
        emit SmartAccountCreated(msg.sender, accountAddress);
        
        return accountAddress;
    }
    
    /**
     * @notice Get Smart Account for a user
     */
    function getSmartAccount(address user) external view returns (address) {
        return userAccounts[user];
    }
    
    /**
     * @notice Check if user has a Smart Account
     */
    function hasSmartAccount(address user) external view returns (bool) {
        return userAccounts[user] != address(0);
    }
    
    /**
     * @notice Get total number of Smart Accounts
     */
    function getTotalAccounts() external view returns (uint256) {
        return allAccounts.length;
    }
}
