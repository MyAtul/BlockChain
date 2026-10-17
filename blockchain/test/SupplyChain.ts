
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SupplyChain", function () {
  async function deployFixture() {
    const [
      admin,
      manufacturer,
      distributor,
      retailer,
      attacker,
    ] = await ethers.getSigners();

    const supplyChain = await ethers.deployContract("SupplyChain");
    await supplyChain.waitForDeployment();

    await supplyChain.registerParticipant(
      manufacturer.address,
      "ABC Manufacturing",
      "Manufacturer"
    );

    await supplyChain.registerParticipant(
      distributor.address,
      "XYZ Distribution",
      "Distributor"
    );

    await supplyChain.registerParticipant(
      retailer.address,
      "City Retail Store",
      "Retailer"
    );

    await supplyChain.registerParticipant(
      attacker.address,
      "Unauthorized Participant",
      "Participant"
    );

    return {
      supplyChain,
      admin,
      manufacturer,
      distributor,
      retailer,
      attacker,
    };
  }

  it("should assign the deployer as admin", async function () {
    const { supplyChain, admin } = await deployFixture();

    expect(await supplyChain.admin()).to.equal(admin.address);
  });

  it("should allow the admin to register participants", async function () {
    const { supplyChain, attacker } = await deployFixture();

    const participant = await supplyChain.participants(
      attacker.address
    );

    expect(participant.registered).to.equal(true);
    expect(participant.name).to.equal("Unauthorized Participant");
  });

  it("should prevent non-admins from registering participants", async function () {
    const { supplyChain, manufacturer, retailer } =
      await deployFixture();

    await expect(
      supplyChain.connect(manufacturer).registerParticipant(
        retailer.address,
        "Another Store",
        "Retailer"
      )
    ).to.be.revertedWith("Only admin can perform this action");
  });

  it("should register a product and create its initial history", async function () {
    const { supplyChain, manufacturer } = await deployFixture();

    await supplyChain.connect(manufacturer).registerProduct(
      "Laptop",
      "Laptop batch A",
      "Mumbai"
    );

    const product = await supplyChain.getProduct(1n);
    const history = await supplyChain.getHistory(1n);

    expect(product.id).to.equal(1n);
    expect(product.name).to.equal("Laptop");
    expect(product.origin).to.equal("Mumbai");
    expect(product.currentOwner).to.equal(manufacturer.address);
    expect(product.status).to.equal("Registered");

    expect(history.length).to.equal(1);
    expect(history[0].status).to.equal("Registered");
    expect(history[0].location).to.equal("Mumbai");
  });

  it("should prevent unregistered users from creating products", async function () {
    const { supplyChain, attacker } = await deployFixture();

    // Deploy another contract account is unnecessary:
    // use a fresh, unregistered signer.
    const [unregistered] = await ethers.getSigners().then(
      (signers) => [signers[5]]
    );

    await expect(
      supplyChain.connect(unregistered).registerProduct(
        "Phone",
        "Phone batch B",
        "Pune"
      )
    ).to.be.revertedWith("Not a registered participant");

    // Keep the fixture's attacker available for other tests.
    expect(attacker.address).to.be.a("string");
  });

  it("should allow the current owner to update product status", async function () {
    const { supplyChain, manufacturer } = await deployFixture();

    await supplyChain.connect(manufacturer).registerProduct(
      "Laptop",
      "Laptop batch A",
      "Mumbai"
    );

    await supplyChain.connect(manufacturer).updateProduct(
      1n,
      "Pune Warehouse",
      "In Transit",
      "Shipment dispatched"
    );

    const product = await supplyChain.getProduct(1n);
    const history = await supplyChain.getHistory(1n);

    expect(product.status).to.equal("In Transit");
    expect(history.length).to.equal(2);
    expect(history[1].location).to.equal("Pune Warehouse");
  });

  it("should prevent non-owners from updating products", async function () {
    const { supplyChain, manufacturer, attacker } =
      await deployFixture();

    await supplyChain.connect(manufacturer).registerProduct(
      "Laptop",
      "Laptop batch A",
      "Mumbai"
    );

    await expect(
      supplyChain.connect(attacker).updateProduct(
        1n,
        "Unknown Location",
        "Delivered",
        "Unauthorized update"
      )
    ).to.be.revertedWith(
      "Only current owner can update product"
    );
  });

  it("should transfer ownership to a registered participant", async function () {
    const { supplyChain, manufacturer, distributor } =
      await deployFixture();

    await supplyChain.connect(manufacturer).registerProduct(
      "Laptop",
      "Laptop batch A",
      "Mumbai"
    );

    await supplyChain.connect(manufacturer).transferProduct(
      1n,
      distributor.address,
      "Mumbai Distribution Center",
      "Handed over to distributor"
    );

    const product = await supplyChain.getProduct(1n);
    const history = await supplyChain.getHistory(1n);

    expect(product.currentOwner).to.equal(distributor.address);
    expect(product.status).to.equal("Transferred");
    expect(history.length).to.equal(2);
  });

  it("should prevent transfers to unregistered participants", async function () {
    const { supplyChain, manufacturer } = await deployFixture();

    await supplyChain.connect(manufacturer).registerProduct(
      "Laptop",
      "Laptop batch A",
      "Mumbai"
    );

    const [unregistered] = await ethers.getSigners().then(
      (signers) => [signers[5]]
    );

    await expect(
      supplyChain.connect(manufacturer).transferProduct(
        1n,
        unregistered.address,
        "Mumbai",
        "Invalid transfer"
      )
    ).to.be.revertedWith("Recipient is not registered");
  });

  it("should reject updates for nonexistent products", async function () {
    const { supplyChain, manufacturer } = await deployFixture();

    await expect(
      supplyChain.connect(manufacturer).updateProduct(
        999n,
        "Mumbai",
        "Delivered",
        "Unknown product"
      )
    ).to.be.revertedWith("Product does not exist");
  });
});
