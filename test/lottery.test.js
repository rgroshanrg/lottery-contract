const { AssertionError } = require('assert');
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const {abi, bytecode} = require('../compile');

const web3 = new Web3(ganache.provider());

let accounts, lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(JSON.stringify(abi)))
                .deploy({ data: bytecode })
                .send({ from: accounts[0], gas: '1000000' });
    
});

describe('Lottery Contract', () => {

    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    })

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether') 
        })

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    })
    it('allows multiple account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether') 
        })
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.015', 'ether')
        })
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.012', 'ether')
        })
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.equal(3, players.length);
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
    })

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: '2000'
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    })

    it('sends money to winner and resets players', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.1', 'ether')
        });

        const intialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({ from: accounts[0] })
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - intialBalance;

        assert(difference > web3.utils.toWei('0.05', 'ether'));

        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
        assert.equal(0, players.length);

        const balance = await web3.eth.getBalance(lottery.options.address);
        assert.equal(0, balance);
    })

})
