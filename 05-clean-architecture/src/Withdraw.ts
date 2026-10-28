import type IAccountRepository from "./AccountRepository.ts";
import type IUserCase from "./IUserCase.ts";

export class Withdraw implements IUserCase {
    constructor(
        readonly accountRepository: IAccountRepository
    ) { }

    async Execute(input: Input): Promise<void> {
        const account = await this.accountRepository.GetById(input.accountId);
        account.Withdraw(input.assetId, input.quantity);
        await this.accountRepository.Update(account);
    }
}

type Input = {
    accountId: string;
    assetId: string;
    quantity: number
}