const { assert } = require('chai');

const Meme = artifacts.require("Meme");

require('chai')
.use(require('chai-as-promised'))
.should()

contract('Meme', (accounts) => {
    let meme

    before(async () => {
        meme = await Meme.deployed()
    })

    it ("deploys contract correctly", async() => {
        const address = meme.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, '')
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
    it("sets tha data correctly", async() => {
        const _memeHash = "my meme"
        await meme.set(_memeHash)
        const result = await meme.memeHash()
        assert.equal(_memeHash, result)
    })
}) 