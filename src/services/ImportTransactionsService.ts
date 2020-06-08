import csvParse from 'csv-parse';
import fs from 'fs';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(file: string): Promise<Transaction[]> {
    async function loadTransactions(path: string): Promise<any[]> {
      const readStream = fs.createReadStream(path);

      if (!readStream) {
        throw new AppError('Error opening file', 400);
      }

      const parseStream = csvParse({
        from_line: 2,
        ltrim: true,
        rtrim: true,
      });

      const parseCSV = readStream.pipe(parseStream);

      const lines: any[] | PromiseLike<any[]> = [];

      parseCSV.on('data', line => {
        const transaction = {
          title: line[0],
          type: line[1],
          value: parseFloat(line[2]),
          category_title: line[3],
        };
        lines.push(transaction);
      });

      await new Promise(resolve => {
        parseCSV.on('end', resolve);
      });

      return lines;
    }

    const createTransactionService = new CreateTransactionService();
    const lines = await loadTransactions(file);

    const savedTransactions = async (): Promise<Transaction[]> =>
      Promise.all(
        lines.map(line =>
          createTransactionService.execute({ ...line, operation: 'import' }),
        ),
      );

    const transactions = savedTransactions().then(data => data);

    await fs.promises.unlink(file);

    return transactions;
  }
}

export default ImportTransactionsService;
