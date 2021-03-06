const { assert } = require('chai');

const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether');
}


contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async()=>{
        //Load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //xfer all dapptoken to tokenfarm
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        //xfer to investor
        await daiToken.transfer(investor, tokens('100'),{from: owner})

    })

    //write tests here
    describe('Mock Dai Deployment', async()=>{
        it('has a name', async()=> {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })

    })

    describe('Dapp Dai Deployment', async()=>{
        it('has a name', async()=> {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })

    })

    describe('Token Farm Deployment', async()=>{
        it('has a name', async()=> {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farms')
        })

        it('contract has tokens', async()=> {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })

    })

    //test staking function
    describe('Farming Tokens', async()=>{
        it('rewards investors for staking mDai tokens', async()=> {
            let result
            
            //check investor balance before depositing
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'),'investor mDAI wallet balance correct before staking')

            //deposit mDAI tokens
            await daiToken.approve(tokenFarm.address,tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'),{from: investor})

            //check deposit result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor balance correct after deposit')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token farm mock dai token correct after investor deposit')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor staking balance correct after investor deposit')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'Investor staking status correct after investor deposit')

            //issue token
            await tokenFarm.issueTokens({from: owner})

            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Correct balance of dapptoken given')

            

        })

    })



})