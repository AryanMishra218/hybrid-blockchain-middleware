## Performance Testing

This project includes load testing for 500–1000 transactions.

### Metrics Measured:
- Latency (ms)
- Total execution time
- Throughput (TPS)

### Key Observation:
- Polygon introduces high delay due to consensus (~2–5 sec)
- Hyperledger Fabric is faster (~100–500 ms)
- Middleware overhead is minimal (~50–200 ms)