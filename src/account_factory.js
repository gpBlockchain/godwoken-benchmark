const Web3 = require('web3')
const { WaitableBatchRequest } = require('./utils');
const logger = require('./logger')
const { get_benchmark_accounts_by_path } = require('./account_register')

class AccountFactory {
    async get_accounts(config) {

        let web3 = new Web3(new Web3.providers.HttpProvider(config.http_endpoint))
        let account = web3.eth.accounts.privateKeyToAccount(config.private_key)
        web3.eth.defaultAccount = account.address

        let nonce = await web3.eth.getTransactionCount(account.address)

        let accounts = []
        let batch_request = new WaitableBatchRequest(web3);
        for (let i = 0; i < config.thread_num; i++) {
            let benchmark_account = web3.eth.accounts.create()

            nonce += 1
            let tx = {
                "to": benchmark_account.address,
                "type": 2,
                "value": 10000000000000000,
                "maxPriorityFeePerGas": 3,
                "maxFeePerGas": 3,
                "gasLimit": 21000,
                "nonce": nonce,
                "chainId": 5
            }
            let signed_tx = await account.signTransaction(tx)
            batch_request.add(web3.eth.sendSignedTransaction.request(signed_tx.rawTransaction, (err, res) => {
                if (err) logger.error("create account tx err: ", err)
                else accounts.push(benchmark_account)
            }), signed_tx.transactionHash);
        }

        await batch_request.execute()
        await batch_request.waitFinished();
        await batch_request.waitConfirmed();
        return accounts
    }

    async get_accounts_by_path(config){
        let web3 = new Web3(new Web3.providers.HttpProvider(config.http_endpoint))
        let private_accounts =  await get_benchmark_accounts_by_path(web3,config.keystore_path,config.thread_num)
        let accounts = []
        for (let i = 0; i <  private_accounts.length; i++) {
            let acc = web3.eth.accounts.wallet.add(private_accounts[i])
            accounts.push(acc)
        }
        return accounts;
    }
}

module.exports = AccountFactory
