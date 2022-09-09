import { expect } from "chai";
import { ethers } from "hardhat";
import { MyProject} from "../typechain-types/contracts";
import { MyProject__factory, Uni__factory, Usdt__factory } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Uni } from "../typechain-types/contracts";
import { Usdt } from "../typechain-types/contracts";


describe("MyProject", function(){
  let myproject:MyProject
  let Uni:Uni
  let Usdt:Usdt
  let owner:SignerWithAddress
  let signers:SignerWithAddress[]
  let allParents:MyProject.ParentStructOutput[]
  let theParent:MyProject.ParentStructOutput
  let allChildren:MyProject.ChildStructOutput[]
  let firstChild:MyProject.ChildStructOutput
  let secondChild:MyProject.ChildStructOutput
  let parentSigner:SignerWithAddress
  let childSigner1:SignerWithAddress
  let childSigner2:SignerWithAddress
  let unregSigner:SignerWithAddress

  before(async () => {
    signers = await ethers.getSigners();
    owner = signers[0];

  })
  
  beforeEach(async () => {
    myproject = await new MyProject__factory(owner).deploy();
    Uni = await new Uni__factory(signers[1]).deploy();
    Usdt = await new Usdt__factory(signers[1]).deploy();

    parentSigner = signers[1];
    childSigner1 = signers[2];
    childSigner2 = signers[4];
    unregSigner = signers[5];

    await myproject.deployed();
    await myproject.addParent("Test","Parent",parentSigner.address,"emailparent",532);
    await myproject.connect(signers[1]).addChild("Test","Child",childSigner1.address,10,"emailchild1",534);
    await myproject.connect(signers[1]).addChild("Test2","Child2",childSigner2.address,10,"emailchild2",535);

    allParents = await myproject.get_All_Parents();
    theParent = await myproject.connect(parentSigner).getParent();
    allChildren = await myproject.get_All_Children();
    firstChild = await myproject.connect(childSigner1).getChild();
    secondChild = await myproject.connect(childSigner2).getChild();

    await Uni.connect(signers[1]).approve(
      myproject.address,
      1000
    )

    await myproject.connect(signers[0]).allowToken(
      'UNI',
      Uni.address
    )

  });

  it("Should deployed from the owner", async function () {
    expect(await myproject.getOwner()).to.equal(owner.address);
  });
  
  it("Should check the parent ", async function () {
    expect(theParent.parentAddress).to.be.equal(parentSigner.address); 
  });

  it("Should check children ", async function () {
    expect(firstChild.childAddress).to.be.equal(childSigner1.address);
    expect(secondChild.childAddress).to.be.equal(childSigner2.address); 
  });

  it("Should get the message sender child", async function () {
    const myChild = myproject.connect(childSigner1).getChild();
    expect((await myChild).childAddress).to.be.equal(firstChild.childAddress);
  })

  it("Should get the message sender parent", async function () {
    const myParent = myproject.connect(parentSigner).getParent();
    expect((await myParent).parentAddress).to.be.equal(theParent.parentAddress);
  })

  it("Should delete a child ", async function () {
    await myproject.connect(parentSigner).delete_Child_With_ID(firstChild.childAddress);
    const myChild = await myproject.connect(childSigner1).getChild();
    expect(myChild.childAddress).to.be.equal(ethers.constants.AddressZero); 
  });

  it("Should check if parent can get his/her children via get_Children_Of_Parent", async function () {
    const allChildren_of_Parent = await myproject.get_Children_Of_Parent(theParent.parentAddress);
    const firstChild = allChildren_of_Parent[0];
    const secondChild = allChildren_of_Parent[1];
    expect(firstChild.childAddress).to.be.equal(childSigner1.address); 
    expect(secondChild.childAddress).to.be.equal(childSigner2.address);
  });

  it("Should transfer money from parent to child", async function() {
    await myproject.connect(parentSigner).deposit_to_Child(firstChild.childAddress , { value: ethers.utils.parseEther("5")});
    const myChild = await myproject.connect(childSigner1).getChild();
    expect(myChild.amount).to.be.equal(ethers.utils.parseEther("5"));
  })

  it("Should transfer money from contract to child when the time is right", async function() {
    await myproject.connect(parentSigner).deposit_to_Child(firstChild.childAddress , { value: ethers.utils.parseEther("5")});
    await myproject.child_Withdraws_Money(firstChild.childAddress ,ethers.utils.parseEther("3"),10);
    const myChild = await myproject.connect(childSigner1).getChild();
    expect(myChild.amount).to.be.equal(ethers.utils.parseEther("2"));
  })

  it("Should transfer money from contract to parent, this is the cancel function and child's amount will be decreased.", async function() {
    await myproject.connect(parentSigner).deposit_to_Child(firstChild.childAddress , { value: ethers.utils.parseEther("5")});
    await myproject.connect(parentSigner).parent_Withdraws_Money(firstChild.childAddress, ethers.utils.parseEther("2"));
    const myChild = await myproject.connect(childSigner1).getChild();
    expect(myChild.amount).to.be.equal(ethers.utils.parseEther("3"));
  })

  it("Should check roles", async function() {
    const theAdmin = await myproject.getRole(owner.address);
    const myParent = await myproject.getRole(theParent.parentAddress);
    const myChild = await myproject.getRole(firstChild.childAddress);
    const unRegistered = await myproject.getRole(unregSigner.address);
    expect(theAdmin).to.be.equal(0);
    expect(myParent).to.be.equal(1);
    expect(myChild).to.be.equal(2);
    expect(unRegistered).to.be.equal(3);
  })

  it("Should get the balance of the contract", async function () {
    await myproject.connect(parentSigner).deposit_to_Child(firstChild.childAddress , { value: ethers.utils.parseEther("5")});
    const myBalance = await myproject.get_Balance_of_Contract();
    expect(myBalance).to.be.equal(ethers.utils.parseEther("5"));
  })

  it("Should update the child information",async function (){
    await myproject.connect(signers[1]).update_Child_with_ID("Updated","FirstChild",signers[2].address,15,"updatedmail",540);
    const myChild = await myproject.connect(childSigner1).getChild();
    expect(myChild.name).to.be.equal("Updated");
  })

  it("Should receivetokens" , async function(){
    await myproject.connect(signers[1]).receiveTokens(9, 'UNI');
    
    expect(await myproject.tokenActions('UNI')).to.equal('9');
    expect(await Uni.balanceOf(myproject.address)).to.equal('9');
})

it("Should withdrawtoken" , async function(){
    await myproject.connect(signers[1]).receiveTokens(20, 'UNI');
    await myproject.connect(signers[0]).ownerWithdrawToken(2, 'UNI')
    
    expect(await Uni.balanceOf(myproject.address)).to.equal('18');
    expect(await Uni.balanceOf(signers[0].address)).to.equal('2');
})

});