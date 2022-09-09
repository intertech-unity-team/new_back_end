// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MyProject {
    address owner;

    constructor() {
        owner = msg.sender;
    }

    function getOwner() public view returns(address){ 
        return owner;
    }

    struct Parent {
        string name;
        string surname;
        address payable parentAddress;
        string email;
        uint256 phoneNumber;
        address[] children;
        
    }

    struct Child {
        string name;
        string surname;
        address payable childAddress;
        uint256 releaseTime;
        uint256 amount;
        string email;
        uint256 phoneNumber;

    }

    mapping(address => Parent) private parents;
    mapping(address => Child) private children;
    address[] public parentaddresslist;
    address[] public childaddresslist;


    function addParent(string memory name, string memory surname, address payable parentAddress, string memory email, uint256 phoneNumber) public {
        Parent storage added_parent = parents[parentAddress];
        require( added_parent.parentAddress == address(0), "The parent has already stored." );
        added_parent.name = name;
        added_parent.surname = surname;
        added_parent.parentAddress = parentAddress;
        added_parent.email = email;
        added_parent.phoneNumber = phoneNumber;
        parentaddresslist.push(parentAddress);
    }

    function getParent() public view returns(Parent memory result) {
        Parent storage Message_Sender_Parent = parents[msg.sender];
        result = Message_Sender_Parent;
    }
    

    function addChild(string memory name, string memory surname, address payable childAddress, uint256 releaseTime, string memory email, uint256 phoneNumber ) public onlyParent{
        parents[msg.sender].children.push(childAddress);
        Child storage added_child = children[childAddress];
        require( added_child.childAddress == address(0), "The child has already stored." );
        added_child.name = name;
        added_child.surname = surname;
        added_child.childAddress = childAddress;
        added_child.releaseTime = releaseTime;
        added_child.email = email;
        added_child.phoneNumber = phoneNumber;
        childaddresslist.push(childAddress);
    }

    function getChild() public view returns(Child memory result) {
        Child storage Message_Sender_Child = children[msg.sender];
        result = Message_Sender_Child;
    }

    function delete_Child_With_ID(address myaddress) public onlyParent {
        Child storage selectedchild = children[myaddress];
        delete(selectedchild.name);
        delete(selectedchild.surname);
        delete(selectedchild.childAddress);
        delete(selectedchild.releaseTime);
        delete(selectedchild.email);
        delete(selectedchild.phoneNumber);
    }

    function update_Child_with_ID(string memory new_name, string memory new_surname, address myAddress, uint256 new_releaseTime, string memory new_email, uint256 new_phoneNumber) public onlyParent{
        Child storage selectedchild = children[myAddress];
        selectedchild.name = new_name;
        selectedchild.surname = new_surname;
        selectedchild.releaseTime = new_releaseTime;
        selectedchild.email = new_email;
        selectedchild.phoneNumber = new_phoneNumber;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can use this function");
        _;
    }

    modifier onlyParent(){
        require(parents[msg.sender].parentAddress != address(0), "Only parent can use this function" );
        _;
    }
    
    function get_All_Parents() public view onlyOwner returns(Parent[] memory result) {
        result = new Parent[](parentaddresslist.length);
        for (uint i = 0; i < parentaddresslist.length; i++) {
            result[i] = parents[parentaddresslist[i]];
        }      
    }

    function get_All_Children() public view onlyOwner returns(Child[] memory result2) {
        result2 = new Child[](childaddresslist.length);
        for (uint j = 0; j < childaddresslist.length; j++) {
            result2[j] = children[childaddresslist[j]];
        }      
    }

    function get_Children_Of_Parent(address parentAddress) external view returns(Child[] memory result3){
        result3 = new Child[](parents[parentAddress].children.length);
        for (uint j = 0; j < parents[parentAddress].children.length; j++) {
            result3[j] = children[parents[parentAddress].children[j]];
        }
    }
    
    function deposit_to_Child(address payable address_child) external onlyParent payable {
        require( children[address_child].childAddress != address(0), "The child isn't stored." );
        Child storage selected_child = children[address_child];
        selected_child.amount += msg.value;
    }


    function child_Withdraws_Money(address payable address_child, uint256 amount, uint256 releaseTime) external payable {
        Child storage selected_child = children[address_child];
        uint currentTime = block.timestamp;
        require(currentTime > releaseTime, "You are not 18 yet.");
        require(selected_child.amount > amount, "You don't have enough money");
        selected_child.amount -= amount;
        selected_child.childAddress.transfer(amount);
    }

    function parent_Withdraws_Money(address payable address_child, uint256 amount) external onlyParent payable {
        Parent storage selected_parent = parents[msg.sender];
        Child storage selected_child = children[address_child];
        require(selected_child.amount > amount, "You don't have enough money");
        selected_child.amount -= amount;
        selected_parent.parentAddress.transfer(amount);
    }

    function get_Balance_of_Contract() public view onlyOwner returns(uint256){
        return address(this).balance;
    }

    enum Role {
        Admin,
        Parent,
        Child,
        Unregistered
    }

    function getRole(address wanted_address) public view returns(Role result) {
        if(wanted_address == owner) {   
            result = Role.Admin ;
        } else if( children[wanted_address].childAddress != address(0) ){
            result = Role.Child;
        } else if( parents[wanted_address].parentAddress != address(0) ) {
            result = Role.Parent;  
        } else {
            result= Role.Unregistered;
        } 
    }

    
    mapping(string => uint) public tokenActions;
    mapping(string => address) public allowedTokens;

    function allowToken(string calldata symbol, address tokenAdress) external onlyOwner {
        allowedTokens[symbol] = tokenAdress;
    }

    function receiveTokens(uint amount, string calldata symbol) external {
        require(allowedTokens[symbol] != address(0), "This token is not allowed");

        IERC20(allowedTokens[symbol]).transferFrom(msg.sender, address(this), amount);
        tokenActions[symbol] += amount;
    }

    function ownerWithdrawToken(uint amount, string calldata symbol) external onlyOwner {
        require(tokenActions[symbol] >= amount, "Insufficient funds");

        IERC20(allowedTokens[symbol]).transfer(msg.sender, amount);
        tokenActions[symbol] -= amount;
    }

}