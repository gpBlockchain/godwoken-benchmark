const Web3 = require('web3')
const { WaitableBatchRequest } = require('./utils');
const logger = require('./logger')

class Benchmark {
    constructor(info) {
        let config = info.config
        let private_key = info.private_key
        this.config = {
                http_endpoint: config.http_endpoint,
                private_key : config.private_key,
                continuous_benchmark: config.continuous_benchmark,
                benchmark_time: config.benchmark_time,
                batch_size: config.batch_size,
                id: config.id,
                token: config.token,
        }

        this.benchmark_info = {
            success_tx: 0,
            fail_tx: 0,
            transfer_count: 0,
            start_block_number: 0,
            end_block_number: 0,
            total_time: 0,
            nonce: 0,
        }

        this.web3 = new Web3(new Web3.providers.HttpProvider(config.http_endpoint))
        this.account = this.web3.eth.accounts.privateKeyToAccount(private_key)
        this.web3.eth.defaultAccount = this.account.address
        // deploy contract contains receive function
        this.chainId = 1;
        this.contract = null;

    }

    async exec() {
        await this.start()
        await this.send_txs()
        await this.end();

        return this.benchmark_info
    }

    async start() {
        this.benchmark_info.total_time = 0
        this.benchmark_info.start_time = performance.now()
        this.benchmark_info.nonce = await this.web3.eth.getTransactionCount(this.account.address)
    }

    async end() {
        this.benchmark_info.transfer_count = this.benchmark_info.success_tx + this.benchmark_info.fail_tx;
    }

    async send_txs() {
        while (this.config.continuous_benchmark || this.config.benchmark_time > this.benchmark_info.total_time) {
            await this.send_batch_transactions();
            this.benchmark_info.total_time = (performance.now() - this.benchmark_info.start_time)
        }
    }

    async send_batch_transactions() {
        let txs = new WaitableBatchRequest(this.web3);
        for (let i = 0; i < this.config.batch_size; i++) {
            let tx = {
                "from":this.account.address,
                "to": this.contract.address,
                "value": 1,
                "gasLimit": 21000,
                // "nonce": this.benchmark_info.nonce,
                "chainId": this.chainId,
            }
            txs.add(this.web3.eth.sendTransaction.request(tx, (err, res) => {
                if (err) {
                    this.benchmark_info.fail_tx += 1
                    logger.error("send tx err: ", err)
                }
                else this.benchmark_info.success_tx += 1
            }), tx.transactionHash);
        }

        await txs.execute()
        await txs.waitFinished();
    }

}

module.exports = Benchmark
