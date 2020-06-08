import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<{ ok: boolean }> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const checkIfTransactionExists = await transactionsRepository.findOne({
      id,
    });

    if (!checkIfTransactionExists)
      throw new AppError('The transaction doensn`t exists.', 400);

    await transactionsRepository.remove(checkIfTransactionExists);

    return { ok: true };
  }
}

export default DeleteTransactionService;
