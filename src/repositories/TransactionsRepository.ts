import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    let income = 0;
    let outcome = 0;

    if (transactions.length <= 0) return { income: 0, outcome: 0, total: 0 };

    if (transactions.filter(t => t.type === 'income').length > 0)
      income = transactions
        .filter(t => t.type === 'income')
        .map(t => t.value)
        .reduce((a, b) => a + b);

    if (transactions.filter(t => t.type === 'outcome').length > 0)
      outcome = transactions
        .filter(t => t.type === 'outcome')
        .map(t => t.value)
        .reduce((a, b) => a + b);

    const balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
