import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
  operation?: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
    operation,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const balance = await transactionsRepository.getBalance();

    if (operation !== 'import' && type === 'outcome' && value > balance.total)
      throw new AppError('Insufficient balance', 400);

    async function handleCategoryExistence(): Promise<Category> {
      const categoryRepository = getRepository(Category);
      const exists = await categoryRepository.findOne({
        title: category_title,
      });

      if (!exists)
        return categoryRepository.save(
          categoryRepository.create({ title: category_title }),
        );

      return exists;
    }

    const category = await handleCategoryExistence();

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
