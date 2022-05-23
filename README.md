# Deploy Benchmark
Requires nodejs、yarn、[nginx](../axon-nginx/README.md)
## Configuration of the deployment


### Step 1
```shell
$ yarn install
```

### Step 2

```shell
$ vim config.json 
```

Editor config.json

```conf
{
    "http_endpoint": "http://localhost:8024",
    "private_key" : "0xdd50cac37ec6dd12539a968c1a2cbedda75bd8724f7bcad486548eaabb87fc8b",
    "keystore_path": "./keystore/account.private",
    "continuous_benchmark": false,
    "benchmark_time": 60000,
    "batch_size": 1,
    "thread_num": 50,
    "id": "936501604767629344",
    "token": "Fha8Hn6C31VEu3wL5XejIVGocTXiQbJ6HabAC5sLtHHwvqQ63iXj1FmOkH_FVN4mTZwQ",
    "benchmark_cases": ["./contract_benchmark"]
}
                                               
```
`http_endpoint`: Http address of axon rpc

`private_key`: Private Key

`keystore_path`:benchmark accounts

`continuous_benchmark`: Whether to continue benchmark testing

`batch_size`: Number of transactions sent per time

`thread_num`: Number of threads sending transactions

`benchmark_time`: When continuous_benchmark is false, the duration of the benchmark test

`id`: discord webhook's id(When continuous_benchmark is false, the results are pushed to discord)

`token` discord webhook's token(When continuous_benchmark is false, the results are pushed to discord)

`benchmark_cases`: Use cases for benchmark

## Instructions for use
### register accounts
```shell
$ vi index_account.js

	const ACCOUNT_PRIVATE_KEY = '0xdd50cac37ec6dd12539a968c1a2cbedda75bd8724f7bcad486548eaabb87fc8b'
	const rpc_url = 'http://localhost:8024'
	const TRANSFER_BALANCE = 1000000000000000000n
	const register_num = 50
	const keystore_path = './keystore/account.private'

  node index_account.js

```
### start
```shell
node index.js
```


### Modify specified parameters via pass-through
The passed parameters will replace the configuration of the corresponding key in config.json
```shell
$ nohup node index.js --benchmark_cases="['./benchmark']" &
```
